import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store';
import { authenticateJWT } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { RegisterSchema, LoginSchema } from '@sikchakhub/shared-validation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sikchakhub-super-secret-jwt-key-2025';

function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/v1/auth/register
router.post('/register', (req: Request, res: Response) => {
  const parseResult = RegisterSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  const { email, password, fullName, role, phone } = parseResult.data;

  const existing = dbStore.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    passwordHash: password, // In production, bcrypt.hashSync(password, 10)
    fullName,
    role: role as any,
    phone: phone || '',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.users.push(newUser);

  // If role is TEACHER, create a default profile
  if (role === 'TEACHER') {
    dbStore.profiles[newUser.id] = {
      id: `profile-${Date.now()}`,
      userId: newUser.id,
      headline: 'Educator / Teacher',
      bio: '',
      experienceYears: 1,
      highestQualification: 'B.Ed / Post Graduate',
      teachingLevels: ['PGT', 'TGT'],
      subjects: ['General Science'],
      boards: ['CBSE'],
      currentCity: 'New Delhi',
      preferredCities: ['New Delhi'],
      isWillingToRelocate: false,
      noticePeriodDays: 30,
      skills: ['Classroom Management', 'Lesson Planning'],
      certifications: [],
      profileCompletionScore: 60,
      streakDays: 1,
      resumeUrl: '',
      resumeFileName: '',
    };
  }

  const token = generateToken(newUser);
  logAuditEvent(req, 'USER_REGISTERED', 'User', newUser.id, { email, role });

  return res.status(201).json({
    success: true,
    message: 'Registration successful!',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    },
    profile: dbStore.profiles[newUser.id],
  });
});

// POST /api/v1/auth/login
router.post('/login', (req: Request, res: Response) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  const { email, password } = parseResult.data;
  const user = dbStore.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
  }

  // Demo credential validation (supports any seeded pass or exact match)
  const token = generateToken(user);
  const profile = dbStore.profiles[user.id];
  const institution = user.role === 'EMPLOYER' 
    ? dbStore.institutions.find(i => i.ownerId === user.id) || dbStore.institutions[0]
    : undefined;

  logAuditEvent(req, 'USER_LOGIN', 'User', user.id, { email });

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    profile,
    institution,
  });
});

// POST /api/v1/auth/quick-demo-login
// Provides instantaneous one-click login for demonstration: Teacher, Employer, Admin
router.post('/quick-demo-login', (req: Request, res: Response) => {
  const { role } = req.body; // 'TEACHER' | 'EMPLOYER' | 'ADMIN'
  const targetEmail = 
    role === 'EMPLOYER' ? 'recruiter@apexjee.com' :
    role === 'ADMIN' ? 'admin@sikchakhub.com' : 'teacher@sikchakhub.com';

  const user = dbStore.getUserByEmail(targetEmail) || dbStore.users[0];
  const token = generateToken(user);
  const profile = dbStore.profiles[user.id];
  const institution = user.role === 'EMPLOYER' 
    ? dbStore.institutions.find(i => i.ownerId === user.id) || dbStore.institutions[0]
    : undefined;

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    profile,
    institution,
  });
});

// GET /api/v1/auth/me
router.get('/me', authenticateJWT, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = dbStore.getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User record not found.' });
  }

  const profile = dbStore.profiles[user.id];
  const institution = user.role === 'EMPLOYER' 
    ? dbStore.institutions.find(i => i.ownerId === user.id) || dbStore.institutions[0]
    : undefined;

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
    profile,
    institution,
  });
});

// PUT /api/v1/auth/profile
router.put('/profile', authenticateJWT, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const currentProfile = dbStore.profiles[userId] || {
    id: `profile-${Date.now()}`,
    userId,
    experienceYears: 0,
    highestQualification: '',
    teachingLevels: [],
    subjects: [],
    boards: [],
    currentCity: '',
    preferredCities: [],
    isWillingToRelocate: false,
    noticePeriodDays: 30,
    skills: [],
    certifications: [],
    profileCompletionScore: 70,
    streakDays: 1,
  };

  const updatedProfile = {
    ...currentProfile,
    ...req.body,
    userId,
    profileCompletionScore: Math.min(100, Math.max(50, 
      (req.body.resumeUrl ? 25 : 10) +
      (req.body.subjects?.length ? 20 : 0) +
      (req.body.highestQualification ? 15 : 0) +
      (req.body.headline ? 15 : 0) +
      (req.body.bio ? 15 : 0) +
      (req.body.skills?.length ? 10 : 0)
    )),
  };

  dbStore.profiles[userId] = updatedProfile;
  logAuditEvent(req, 'PROFILE_UPDATED', 'TeacherProfile', updatedProfile.id);

  return res.json({
    success: true,
    message: 'Profile updated successfully!',
    profile: updatedProfile,
  });
});

export default router;
