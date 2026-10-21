import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { authenticateJWT, optionalJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { JobVacancySchema } from '@sikchakhub/shared-validation';

const router = Router();

// GET /api/v1/jobs - Public Search & Filtering
router.get('/', optionalJWT, (req: Request, res: Response) => {
  const {
    q,
    subject,
    teachingLevel,
    board,
    employmentType,
    city,
    minSalary,
    maxSalary,
    minExp,
    status = 'ACTIVE',
    institutionId,
    page = '1',
    limit = '10',
  } = req.query;

  let results = dbStore.jobs.map(j => ({
    ...j,
    institution: dbStore.getInstitutionById(j.institutionId),
    totalApplicants: dbStore.applications.filter(a => a.jobId === j.id).length,
  }));

  // Status filter (defaults to ACTIVE unless recruiter/admin specifies otherwise)
  if (status) {
    results = results.filter(j => j.status === status);
  }

  // Text search query
  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    results = results.filter(
      j =>
        j.title.toLowerCase().includes(query) ||
        j.subject.toLowerCase().includes(query) ||
        j.description.toLowerCase().includes(query) ||
        j.institution?.name.toLowerCase().includes(query) ||
        j.city.toLowerCase().includes(query)
    );
  }

  // Subject filter
  if (subject && typeof subject === 'string') {
    results = results.filter(j => j.subject.toLowerCase() === subject.toLowerCase());
  }

  // Teaching level filter
  if (teachingLevel && typeof teachingLevel === 'string') {
    results = results.filter(j => j.teachingLevel === teachingLevel);
  }

  // Board filter
  if (board && typeof board === 'string') {
    results = results.filter(j => j.board === board);
  }

  // Employment type filter
  if (employmentType && typeof employmentType === 'string') {
    results = results.filter(j => j.employmentType === employmentType);
  }

  // City filter
  if (city && typeof city === 'string') {
    results = results.filter(j => j.city.toLowerCase().includes(city.toLowerCase()));
  }

  // Min salary (LPA)
  if (minSalary) {
    results = results.filter(j => j.maxSalaryLPA >= Number(minSalary));
  }

  // Max experience
  if (minExp) {
    results = results.filter(j => j.minExperienceYears <= Number(minExp));
  }

  // Institution filter
  if (institutionId && typeof institutionId === 'string') {
    results = results.filter(j => j.institutionId === institutionId);
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const pageSize = parseInt(limit as string, 10) || 10;
  const total = results.length;
  const paginated = results.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return res.json({
    success: true,
    total,
    page: pageNum,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    jobs: paginated,
  });
});

// GET /api/v1/jobs/:id - Single job detail
router.get('/:id', optionalJWT, (req: Request, res: Response) => {
  const job = dbStore.getJobById(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job opening not found.' });
  }

  const applicationsCount = dbStore.applications.filter(a => a.jobId === job.id).length;

  return res.json({
    success: true,
    job: {
      ...job,
      totalApplicants: applicationsCount,
    },
  });
});

// POST /api/v1/jobs - Create Job Opening (Recruiter / Admin)
router.post('/', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const parseResult = JobVacancySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  // Find user's institution
  let institution = dbStore.institutions.find(i => i.ownerId === req.user!.id);
  if (!institution) {
    institution = dbStore.institutions[0]; // fallback to default institution
  }

  const newJob = {
    id: `job-${Date.now()}`,
    institutionId: institution.id,
    ...parseResult.data,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responsibilities: parseResult.data.responsibilities || [
      'Deliver engaging lessons aligned with curriculum frameworks',
      'Conduct regular formative assessments and progress reviews',
      'Participate in academic planning and faculty development',
    ],
    benefits: parseResult.data.benefits || [
      'Competitive institutional pay scale',
      'Comprehensive medical insurance',
      'Professional training workshops',
    ],
  };

  dbStore.jobs.unshift(newJob as any);
  logAuditEvent(req, 'JOB_CREATED', 'JobVacancy', newJob.id, { title: newJob.title });

  return res.status(201).json({
    success: true,
    message: 'Job vacancy published successfully!',
    job: {
      ...newJob,
      institution,
    },
  });
});

// PUT /api/v1/jobs/:id - Update vacancy
router.put('/:id', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const index = dbStore.jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
  }

  dbStore.jobs[index] = {
    ...dbStore.jobs[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  logAuditEvent(req, 'JOB_UPDATED', 'JobVacancy', req.params.id);

  return res.json({
    success: true,
    message: 'Job vacancy updated successfully!',
    job: dbStore.jobs[index],
  });
});

// PATCH /api/v1/jobs/:id/status - Change status (ACTIVE, PAUSED, CLOSED)
router.patch('/:id/status', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const { status } = req.body;
  const job = dbStore.jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
  }

  job.status = status;
  job.updatedAt = new Date().toISOString();

  logAuditEvent(req, 'JOB_STATUS_CHANGED', 'JobVacancy', job.id, { status });

  return res.json({
    success: true,
    message: `Job status updated to ${status}.`,
    job,
  });
});

// POST /api/v1/jobs/:id/duplicate - Duplicate vacancy
router.post('/:id/duplicate', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
  const source = dbStore.jobs.find(j => j.id === req.params.id);
  if (!source) {
    return res.status(404).json({ success: false, message: 'Source job not found.' });
  }

  const duplicated = {
    ...source,
    id: `job-${Date.now()}`,
    title: `${source.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ACTIVE' as const,
  };

  dbStore.jobs.unshift(duplicated);
  logAuditEvent(req, 'JOB_DUPLICATED', 'JobVacancy', duplicated.id);

  return res.status(201).json({
    success: true,
    message: 'Job vacancy duplicated successfully!',
    job: duplicated,
  });
});

export default router;
