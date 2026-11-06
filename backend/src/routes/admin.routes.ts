import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { 
  UserModel, 
  InstitutionModel, 
  JobVacancyModel, 
  JobApplicationModel, 
  InterviewModel, 
  AuditLogModel 
} from '../db/mongodb';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';

const router = Router();

// GET /api/v1/admin/kpis - Overall platform metrics directly from MongoDB
router.get('/kpis', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    let totalTeachers = 0;
    let totalInstitutions = 0;
    let pendingInstitutions = 0;
    let totalVacancies = 0;
    let activeVacancies = 0;
    let totalApplications = 0;
    let interviewsScheduled = 0;

    try {
      totalTeachers = await UserModel.countDocuments({ role: 'TEACHER' });
      totalInstitutions = await InstitutionModel.countDocuments();
      pendingInstitutions = await InstitutionModel.countDocuments({ verificationStatus: 'PENDING' });
      totalVacancies = await JobVacancyModel.countDocuments();
      activeVacancies = await JobVacancyModel.countDocuments({ status: 'ACTIVE' });
      totalApplications = await JobApplicationModel.countDocuments();
      interviewsScheduled = await InterviewModel.countDocuments();
    } catch (e) {
      totalTeachers = dbStore.users.filter(u => u.role === 'TEACHER').length;
      totalInstitutions = dbStore.institutions.length;
      pendingInstitutions = dbStore.institutions.filter(i => i.verificationStatus === 'PENDING').length;
      totalVacancies = dbStore.jobs.length;
      activeVacancies = dbStore.jobs.filter(j => j.status === 'ACTIVE').length;
      totalApplications = dbStore.applications.length;
      interviewsScheduled = dbStore.interviews.length;
    }

    return res.json({
      success: true,
      kpis: {
        totalTeachers,
        totalInstitutions,
        pendingInstitutions,
        totalVacancies,
        activeVacancies,
        totalApplications,
        interviewsScheduled,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin KPIs' });
  }
});

// GET /api/v1/admin/pending-institutions - Verification queue directly from MongoDB
router.get('/pending-institutions', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    let pending: any[] = [];
    try {
      pending = await InstitutionModel.find({ verificationStatus: 'PENDING' }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      pending = dbStore.institutions.filter(i => i.verificationStatus === 'PENDING');
    }
    return res.json({ success: true, pending });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve pending institutions' });
  }
});

// POST /api/v1/admin/verify-institution - Approve / Reject institution in MongoDB
router.post('/verify-institution', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { institutionId, status, notes } = req.body; // status: 'VERIFIED' | 'REJECTED'

  try {
    let inst: any = null;
    try {
      inst = await InstitutionModel.findOneAndUpdate(
        { id: institutionId },
        { $set: { verificationStatus: status, verificationNotes: notes || '', updatedAt: new Date() } },
        { new: true }
      ).lean();
    } catch (e) {}

    if (!inst) {
      inst = dbStore.institutions.find(i => i.id === institutionId);
      if (inst) {
        inst.verificationStatus = status;
        if (notes) inst.verificationNotes = notes;
        inst.updatedAt = new Date().toISOString();
      }
    }

    if (!inst) {
      return res.status(404).json({ success: false, message: 'Institution record not found.' });
    }

    logAuditEvent(req, `INSTITUTION_${status}`, 'Institution', inst.id, {
      institutionName: inst.name,
      decision: status,
      notes,
    });

    return res.json({
      success: true,
      message: `Institution status updated to ${status}.`,
      institution: inst,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update institution verification status' });
  }
});

// GET /api/v1/admin/audit-logs - Administrative audit trail
router.get('/audit-logs', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    let logs: any[] = [];
    try {
      logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
    } catch (e) {
      logs = dbStore.auditLogs;
    }
    if (logs.length === 0 && dbStore.auditLogs.length > 0) {
      logs = dbStore.auditLogs;
    }

    return res.json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
});

// GET /api/v1/admin/analytics - Aggregated charts & trends from real database
router.get('/analytics', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    let jobs: any[] = [];
    let applications: any[] = [];

    try {
      jobs = await JobVacancyModel.find().lean();
      applications = await JobApplicationModel.find().lean();
    } catch (e) {
      jobs = dbStore.jobs;
      applications = dbStore.applications;
    }

    // Aggregate jobs by teaching level
    const levelCounts: Record<string, number> = {};
    jobs.forEach(j => {
      levelCounts[j.teachingLevel] = (levelCounts[j.teachingLevel] || 0) + 1;
    });

    // Aggregate applications by subject
    const subjectCounts: Record<string, number> = {};
    applications.forEach(a => {
      const job = jobs.find(j => j.id === a.jobId) || dbStore.getJobById(a.jobId);
      if (job) {
        subjectCounts[job.subject] = (subjectCounts[job.subject] || 0) + 1;
      }
    });

    // Top hiring cities
    const cityCounts: Record<string, number> = {};
    jobs.forEach(j => {
      cityCounts[j.city] = (cityCounts[j.city] || 0) + 1;
    });

    return res.json({
      success: true,
      analytics: {
        jobsByLevel: Object.entries(levelCounts).map(([name, count]) => ({ name, count })),
        applicationsBySubject: Object.entries(subjectCounts).map(([name, count]) => ({ name, count })),
        topHiringCities: Object.entries(cityCounts).map(([name, count]) => ({ name, count })),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics' });
  }
});

export default router;
