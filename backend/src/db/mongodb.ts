import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['TEACHER', 'EMPLOYER', 'ADMIN'], default: 'TEACHER' },
  phone: { type: String },
  age: { type: Number },
  avatarUrl: { type: String },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

// Teacher Profile Schema
const TeacherProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  headline: { type: String },
  bio: { type: String },
  age: { type: Number },
  experienceYears: { type: Number, default: 0 },
  highestQualification: { type: String },
  teachingLevels: [{ type: String }],
  subjects: [{ type: String }],
  boards: [{ type: String }],
  currentCity: { type: String },
  preferredCities: [{ type: String }],
  isWillingToRelocate: { type: Boolean, default: false },
  currentSalaryLPA: { type: Number },
  expectedSalaryLPA: { type: Number },
  noticePeriodDays: { type: Number, default: 30 },
  resumeUrl: { type: String },
  resumeFileName: { type: String },
  skills: [{ type: String }],
  certifications: [{ type: String }],
  profileCompletionScore: { type: Number, default: 60 },
  streakDays: { type: Number, default: 1 },
}, { timestamps: true });

// Institution Schema
const InstitutionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'SCHOOL' },
  logoUrl: { type: String },
  website: { type: String },
  description: { type: String },
  affiliationNumber: { type: String },
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
  verificationNotes: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  establishedYear: { type: Number },
}, { timestamps: true });

// Job Vacancy Schema
const JobVacancySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  institutionId: { type: String, required: true },
  title: { type: String, required: true },
  department: { type: String },
  subject: { type: String, required: true },
  additionalSubjects: [{ type: String }],
  teachingLevel: { type: String, required: true },
  board: { type: String, required: true },
  employmentType: { type: String, default: 'FULL_TIME' },
  minExperienceYears: { type: Number, default: 1 },
  maxExperienceYears: { type: Number },
  requiredQualification: { type: String },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  benefits: [{ type: String }],
  minSalaryLPA: { type: Number, required: true },
  maxSalaryLPA: { type: Number, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  vacanciesCount: { type: Number, default: 1 },
  deadline: { type: String, required: true },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'], default: 'ACTIVE' },
  customFields: { type: mongoose.Schema.Types.Mixed, default: [] },
  screeningRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  requireResume: { type: Boolean, default: true },
  syllabusDocumentUrl: { type: String },
  syllabusDocumentName: { type: String },
  totalApplicants: { type: Number, default: 0 },
}, { timestamps: true });

// Job Application Schema
const JobApplicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  jobId: { type: String, required: true },
  teacherId: { type: String, required: true },
  resumeUrl: { type: String },
  resumeFileName: { type: String },
  coverLetter: { type: String },
  stage: { 
    type: String, 
    enum: ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED', 'ON_HOLD'], 
    default: 'APPLIED' 
  },
  customAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },
  matchResult: { type: mongoose.Schema.Types.Mixed, default: {} },
  recruiterNotes: { type: String },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Interview Schema
const InterviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  applicationId: { type: String, required: true },
  jobId: { type: String, required: true },
  teacherId: { type: String, required: true },
  institutionId: { type: String, required: true },
  interviewType: { type: String, default: 'DEMO_CLASS' },
  scheduledTime: { type: String, required: true },
  durationMinutes: { type: Number, default: 45 },
  meetingLink: { type: String },
  locationDetails: { type: String },
  status: { type: String, default: 'SCHEDULED' },
  feedback: { type: String },
  rating: { type: Number },
}, { timestamps: true });

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  userEmail: { type: String },
  action: { type: String, required: true },
  resourceType: { type: String },
  resourceId: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const TeacherProfileModel = mongoose.models.TeacherProfile || mongoose.model('TeacherProfile', TeacherProfileSchema);
export const InstitutionModel = mongoose.models.Institution || mongoose.model('Institution', InstitutionSchema);
export const JobVacancyModel = mongoose.models.JobVacancy || mongoose.model('JobVacancy', JobVacancySchema);
export const JobApplicationModel = mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
export const InterviewModel = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

export async function seedDefaultAdminIfNeeded() {
  try {
    const adminEmail = 'sikshahub@gmail.com';
    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = bcryptjs.hashSync('admin@12345', 10);
      const adminDoc = {
        id: `admin-${Date.now()}`,
        email: adminEmail,
        passwordHash,
        fullName: 'SikshaHub Super Admin',
        role: 'ADMIN',
        phone: '9783143866',
        age: 32,
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SikshaHubAdmin',
        isVerified: true,
      };
      await UserModel.create(adminDoc);
      console.log('✅ Default Super Admin seeded in MongoDB: sikshahub@gmail.com / admin@12345');
    }
  } catch (err: any) {
    console.warn('Admin seed notice:', err.message);
  }
}

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI or MONGO_URL provided in .env');
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');
    await seedDefaultAdminIfNeeded();
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    return false;
  }
}
