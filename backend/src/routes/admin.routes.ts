import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';

const router = Router();

// GET /api/v1/admin/kpis - Overall platform metrics
router.get('/kpis', authenticateJWT, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const totalTeachers = dbStore.users.filter(u => u.role === 'TEACHER').length;
  const totalInstitutions = dbStore.institutions.length;
  const pendingInstitutions = dbStore.institutions.filter(i => i.verificationStatus === 'PENDING').length;
  const totalVacancies = dbStore.jobs.length;
  const activeVacancies = dbStore.jobs.filter(j => j.status === 'ACTIVE').length;
  const totalApplications = dbStore.applications.length;
  const interviewsScheduled = dbStore.interviews.length;

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
});

// GET /api/v1/admin/pending-institutions - Verification queue
router.get('/pending-institutions', authenticateJWT, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const pending = dbStore.institutions.filter(i => i.verificationStatus === 'PENDING');
  return res.json({ success: true, pending });
});

// POST /api/v1/admin/verify-institution - Approve / Reject institution
router.post('/verify-institution', authenticateJWT, requireRole(['ADMIN']), (req: Request, res: Response) => {
  const { institutionId, status, notes } = req.body; // status: 'VERIFIED' | 'REJECTED'
  const inst = dbStore.institutions.find(i => i.id === institutionId);
  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution record not found.' });
  }

  inst.verificationStatus = status;
  if (notes) inst.verificationNotes = notes;
  inst.updatedAt = new Date().toISOString();

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
});

// GET /api/v1/admin/audit-logs - Administrative audit trail
router.get('/audit-logs', authenticateJWT, requireRole(['ADMIN']), (req: Request, res: Response) => {
  return res.json({
    success: true,
    total: dbStore.auditLogs.length,
    logs: dbStore.auditLogs,
  });
});

// GET /api/v1/admin/analytics - Aggregated charts & trends
router.get('/analytics', authenticateJWT, requireRole(['ADMIN']), (req: Request, res: Response) => {
  // Aggregate jobs by teaching level
  const levelCounts: Record<string, number> = {};
  dbStore.jobs.forEach(j => {
    levelCounts[j.teachingLevel] = (levelCounts[j.teachingLevel] || 0) + 1;
  });

  // Aggregate applications by subject
  const subjectCounts: Record<string, number> = {};
  dbStore.applications.forEach(a => {
    const job = dbStore.getJobById(a.jobId);
    if (job) {
      subjectCounts[job.subject] = (subjectCounts[job.subject] || 0) + 1;
    }
  });

  // Top hiring cities
  const cityCounts: Record<string, number> = {};
  dbStore.jobs.forEach(j => {
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
});

export default router;
