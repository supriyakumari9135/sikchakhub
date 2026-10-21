import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { calculateCandidateScreening } from '../services/screeningEngine';
import { SubmitApplicationSchema } from '@sikchakhub/shared-validation';

const router = Router();

// POST /api/v1/applications - Submit Job Application
router.post('/', authenticateJWT, (req: Request, res: Response) => {
  const parseResult = SubmitApplicationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  const { jobId, resumeUrl, coverLetter, customAnswers } = parseResult.data;
  const teacherId = req.user!.id;

  const job = dbStore.getJobById(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job opening not found.' });
  }

  // Prevent duplicate application
  const existingApp = dbStore.applications.find(a => a.jobId === jobId && a.teacherId === teacherId);
  if (existingApp) {
    return res.status(400).json({ 
      success: false, 
      message: 'You have already applied for this opening. You can track your status in your Teacher Dashboard.' 
    });
  }

  const teacherUser = dbStore.getUserById(teacherId);
  const teacherProfile = dbStore.getProfileByUserId(teacherId);

  // Execute deterministic candidate screening engine
  const matchResult = calculateCandidateScreening(
    job,
    { fullName: teacherUser?.fullName || 'Applicant', profile: teacherProfile },
    customAnswers
  );

  const initialStage = matchResult.autoFilteredStatus === 'QUALIFIED' ? 'SCREENING' : 'APPLIED';

  const newApplication = {
    id: `app-${Date.now()}`,
    jobId,
    teacherId,
    resumeUrl: resumeUrl || teacherProfile?.resumeUrl || '/sample-resume.pdf',
    coverLetter: coverLetter || '',
    stage: initialStage as any,
    customAnswers: customAnswers || {},
    matchResult,
    recruiterNotes: '',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.applications.unshift(newApplication);
  logAuditEvent(req, 'APPLICATION_SUBMITTED', 'JobApplication', newApplication.id, {
    jobId,
    score: matchResult.overallScore,
    status: matchResult.autoFilteredStatus,
  });

  return res.status(201).json({
    success: true,
    message: 'Application submitted successfully!',
    application: {
      ...newApplication,
      job,
    },
  });
});

// GET /api/v1/applications/my-applications - For logged in teacher
router.get('/my-applications', authenticateJWT, (req: Request, res: Response) => {
  const teacherId = req.user!.id;
  const apps = dbStore.getApplicationsByTeacherId(teacherId);
  return res.json({ success: true, applications: apps });
});

// GET /api/v1/applications/job/:jobId - Recruiter pipeline candidate list
router.get('/job/:jobId', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { stage, minScore, status, q } = req.query;

  let candidates = dbStore.getApplicationsByJobId(jobId);

  if (stage && typeof stage === 'string') {
    candidates = candidates.filter(c => c.stage === stage);
  }

  if (minScore) {
    candidates = candidates.filter(c => (c.matchResult?.overallScore || 0) >= Number(minScore));
  }

  if (status && typeof status === 'string') {
    candidates = candidates.filter(c => c.matchResult?.autoFilteredStatus === status);
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    candidates = candidates.filter(
      c =>
        c.teacher?.fullName.toLowerCase().includes(query) ||
        c.teacher?.profile?.subjects?.some(s => s.toLowerCase().includes(query)) ||
        c.teacher?.profile?.currentCity.toLowerCase().includes(query)
    );
  }

  // Sort by match score descending by default
  candidates.sort((a, b) => (b.matchResult?.overallScore || 0) - (a.matchResult?.overallScore || 0));

  return res.json({
    success: true,
    total: candidates.length,
    candidates,
  });
});

// PATCH /api/v1/applications/:id/stage - Update recruitment stage
router.patch('/:id/stage', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const { stage } = req.body;
  const app = dbStore.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  app.stage = stage;
  app.updatedAt = new Date().toISOString();

  logAuditEvent(req, 'APPLICATION_STAGE_CHANGED', 'JobApplication', app.id, { stage });

  return res.json({
    success: true,
    message: `Application stage changed to ${stage}.`,
    application: app,
  });
});

// PATCH /api/v1/applications/:id/notes - Add internal recruiter notes
router.patch('/:id/notes', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const { notes } = req.body;
  const app = dbStore.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  app.recruiterNotes = notes;
  app.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Recruiter notes saved.',
    application: app,
  });
});

// GET /api/v1/applications/:id - Single application detail
router.get('/:id', authenticateJWT, (req: Request, res: Response) => {
  const app = dbStore.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const user = dbStore.getUserById(app.teacherId);
  const profile = dbStore.getProfileByUserId(app.teacherId);
  const job = dbStore.getJobById(app.jobId);

  return res.json({
    success: true,
    application: {
      ...app,
      teacher: user ? { ...user, profile } : undefined,
      job,
    },
  });
});

export default router;
