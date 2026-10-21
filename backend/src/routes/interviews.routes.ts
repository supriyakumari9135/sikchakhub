import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { ScheduleInterviewSchema } from '@sikchakhub/shared-validation';

const router = Router();

// POST /api/v1/interviews - Schedule an interview
router.post('/', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const parseResult = ScheduleInterviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  const { applicationId, interviewType, scheduledTime, durationMinutes, meetingLink, locationDetails } = parseResult.data;

  const app = dbStore.applications.find(a => a.id === applicationId);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  const job = dbStore.getJobById(app.jobId);
  const newInterview = {
    id: `interview-${Date.now()}`,
    applicationId,
    jobId: app.jobId,
    teacherId: app.teacherId,
    institutionId: job?.institutionId || 'inst-1',
    interviewType,
    scheduledTime,
    durationMinutes: durationMinutes || 45,
    meetingLink: meetingLink || 'https://meet.google.com/sik-demo-session',
    locationDetails: locationDetails || 'Online Virtual Meeting Room',
    status: 'SCHEDULED' as const,
    feedback: '',
    rating: undefined,
    createdAt: new Date().toISOString(),
  };

  dbStore.interviews.unshift(newInterview);

  // Automatically transition application stage to INTERVIEW_SCHEDULED
  app.stage = 'INTERVIEW_SCHEDULED';
  app.updatedAt = new Date().toISOString();

  logAuditEvent(req, 'INTERVIEW_SCHEDULED', 'Interview', newInterview.id, {
    applicationId,
    type: interviewType,
    scheduledTime,
  });

  return res.status(201).json({
    success: true,
    message: 'Interview round scheduled successfully!',
    interview: newInterview,
  });
});

// GET /api/v1/interviews/my-interviews - For teacher or employer
router.get('/my-interviews', authenticateJWT, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  let list = dbStore.interviews.map(i => {
    const app = dbStore.applications.find(a => a.id === i.applicationId);
    const job = dbStore.getJobById(i.jobId);
    const teacher = dbStore.getUserById(i.teacherId);
    const inst = dbStore.getInstitutionById(i.institutionId);

    return {
      ...i,
      application: app,
      job,
      teacher: teacher ? { id: teacher.id, fullName: teacher.fullName, email: teacher.email } : undefined,
      institution: inst,
    };
  });

  if (role === 'TEACHER') {
    list = list.filter(i => i.teacherId === userId);
  }

  return res.json({ success: true, interviews: list });
});

// PATCH /api/v1/interviews/:id - Update interview status or feedback
router.patch('/:id', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const interview = dbStore.interviews.find(i => i.id === req.params.id);
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview record not found.' });
  }

  if (req.body.status) interview.status = req.body.status;
  if (req.body.feedback) interview.feedback = req.body.feedback;
  if (req.body.rating) interview.rating = req.body.rating;
  if (req.body.scheduledTime) interview.scheduledTime = req.body.scheduledTime;

  logAuditEvent(req, 'INTERVIEW_UPDATED', 'Interview', interview.id, req.body);

  return res.json({
    success: true,
    message: 'Interview details updated successfully.',
    interview,
  });
});

export default router;
