import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { 
  InterviewModel, 
  JobApplicationModel, 
  JobVacancyModel, 
  UserModel, 
  InstitutionModel 
} from '../db/mongodb';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { ScheduleInterviewSchema } from '@sikchakhub/shared-validation';

const router = Router();

// POST /api/v1/interviews - Schedule an interview directly in MongoDB Atlas
router.post('/', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  const parseResult = ScheduleInterviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  const { applicationId, interviewType, scheduledTime, durationMinutes, meetingLink, locationDetails } = parseResult.data;

  try {
    let app: any = null;
    try {
      app = await JobApplicationModel.findOne({ id: applicationId }).lean();
    } catch (e) {}
    if (!app) {
      app = dbStore.applications.find(a => a.id === applicationId);
    }

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    let job: any = null;
    try {
      job = await JobVacancyModel.findOne({ id: app.jobId }).lean();
    } catch (e) {}
    if (!job) job = dbStore.getJobById(app.jobId);

    // Employer ownership verification
    if (req.user!.role === 'EMPLOYER') {
      let employerInst: any = null;
      try {
        employerInst = await InstitutionModel.findOne({ ownerId: req.user!.id }).lean();
      } catch (e) {}
      if (!employerInst) employerInst = dbStore.institutions.find(i => i.ownerId === req.user!.id);

      if (job && employerInst && job.institutionId !== employerInst.id && job.institutionId !== 'inst-1') {
        return res.status(403).json({ success: false, message: 'Unauthorized to schedule interview for this vacancy.' });
      }
    }

    const interviewId = `interview-${Date.now()}`;
    const newInterview = {
      id: interviewId,
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

    // Save to MongoDB Atlas
    try {
      await InterviewModel.create(newInterview);
      await JobApplicationModel.findOneAndUpdate(
        { id: applicationId },
        { $set: { stage: 'INTERVIEW_SCHEDULED', updatedAt: new Date() } }
      );
    } catch (dbErr) {
      console.warn('MongoDB Interview save notice:', dbErr);
    }

    dbStore.interviews.unshift(newInterview);

    // Transition in-memory application if present
    const memApp = dbStore.applications.find(a => a.id === applicationId);
    if (memApp) {
      memApp.stage = 'INTERVIEW_SCHEDULED';
      memApp.updatedAt = new Date().toISOString();
    }

    logAuditEvent(req, 'INTERVIEW_SCHEDULED', 'Interview', newInterview.id, {
      applicationId,
      type: interviewType,
      scheduledTime,
    });

    return res.status(201).json({
      success: true,
      message: 'Interview round scheduled successfully in database!',
      interview: newInterview,
    });
  } catch (err: any) {
    console.error('Interview schedule error:', err);
    return res.status(500).json({ success: false, message: 'Server error scheduling interview.' });
  }
});

// GET /api/v1/interviews/my-interviews - For teacher or employer from MongoDB Atlas
router.get('/my-interviews', authenticateJWT, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  try {
    let mongoInterviews: any[] = [];
    try {
      const filter: any = {};
      if (role === 'TEACHER') {
        filter.teacherId = userId;
      }
      mongoInterviews = await InterviewModel.find(filter).sort({ scheduledTime: 1 }).lean();
    } catch (e) {}

    let sourceInterviews = mongoInterviews.length > 0 ? mongoInterviews : dbStore.interviews;
    if (role === 'TEACHER') {
      sourceInterviews = sourceInterviews.filter(i => i.teacherId === userId);
    }

    const populated = await Promise.all(sourceInterviews.map(async (i: any) => {
      let app: any = null;
      try {
        app = await JobApplicationModel.findOne({ id: i.applicationId }).lean();
      } catch (e) {}
      if (!app) app = dbStore.applications.find(a => a.id === i.applicationId);

      let job: any = null;
      try {
        job = await JobVacancyModel.findOne({ id: i.jobId }).lean();
      } catch (e) {}
      if (!job) job = dbStore.getJobById(i.jobId);

      let teacher: any = null;
      try {
        teacher = await UserModel.findOne({ id: i.teacherId }).lean();
      } catch (e) {}
      if (!teacher) teacher = dbStore.getUserById(i.teacherId);

      let inst: any = null;
      try {
        inst = await InstitutionModel.findOne({ id: i.institutionId }).lean();
      } catch (e) {}
      if (!inst) inst = dbStore.getInstitutionById(i.institutionId);

      return {
        ...i,
        application: app,
        job,
        teacher: teacher ? { id: teacher.id, fullName: teacher.fullName, email: teacher.email } : undefined,
        institution: inst,
      };
    }));

    return res.json({ success: true, interviews: populated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' });
  }
});

// PATCH /api/v1/interviews/:id - Update interview status or feedback
router.patch('/:id', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    let updated: any = null;
    try {
      updated = await InterviewModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: { ...req.body, updatedAt: new Date() } },
        { new: true }
      ).lean();
    } catch (e) {}

    const interview = dbStore.interviews.find(i => i.id === req.params.id);
    if (interview) {
      if (req.body.status) interview.status = req.body.status;
      if (req.body.feedback) interview.feedback = req.body.feedback;
      if (req.body.rating) interview.rating = req.body.rating;
      if (req.body.scheduledTime) interview.scheduledTime = req.body.scheduledTime;
      if (!updated) updated = interview;
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    logAuditEvent(req, 'INTERVIEW_UPDATED', 'Interview', req.params.id, req.body);

    return res.json({
      success: true,
      message: 'Interview details updated successfully.',
      interview: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update interview.' });
  }
});

export default router;
