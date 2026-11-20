import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { JobVacancyModel, InstitutionModel, JobApplicationModel } from '../db/mongodb';
import { authenticateJWT, optionalJWT, requireRole, requireVerifiedAccount } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { JobVacancySchema } from '../validation';

const router = Router();

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// GET /api/v1/jobs - Public Search & Filtering directly from database
router.get('/', optionalJWT, async (req: Request, res: Response) => {
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
    limit = '50',
  } = req.query;

  try {
    // 1. Fetch from MongoDB Atlas
    let mongoJobs: any[] = [];
    try {
      const queryFilter: any = {};
      if (status && status !== 'ALL') {
        queryFilter.status = status;
      }
      if (institutionId) {
        queryFilter.institutionId = institutionId;
      }
      if (subject) {
        queryFilter.subject = new RegExp(escapeRegex(String(subject)), 'i');
      }
      if (teachingLevel) {
        queryFilter.teachingLevel = teachingLevel;
      }
      if (board) {
        queryFilter.board = board;
      }
      if (employmentType) {
        queryFilter.employmentType = employmentType;
      }
      if (city) {
        queryFilter.city = new RegExp(escapeRegex(String(city)), 'i');
      }
      if (minSalary) {
        queryFilter.maxSalaryLPA = { $gte: Number(minSalary) };
      }
      if (minExp) {
        queryFilter.minExperienceYears = { $lte: Number(minExp) };
      }

      mongoJobs = await JobVacancyModel.find(queryFilter).sort({ createdAt: -1 }).lean();
    } catch (dbErr) {
      console.warn('MongoDB JobVacancyModel.find error, falling back to memory store:', dbErr);
      mongoJobs = dbStore.jobs;
    }

    const combined = mongoJobs;

    // Batch resolve institutions and application counts in O(1) database queries (Eliminates N+1 bottleneck)
    const uniqueInstIds = Array.from(new Set(combined.map((j: any) => j.institutionId).filter(Boolean)));
    const allJobIds = combined.map((j: any) => j.id);

    let institutionsList: any[] = [];
    try {
      institutionsList = await InstitutionModel.find({ id: { $in: uniqueInstIds } }).lean();
    } catch (e) {}

    const instMap = new Map<string, any>();
    institutionsList.forEach(inst => instMap.set(inst.id, inst));

    // Batch aggregate applicant counts per job
    const appCountMap = new Map<string, number>();
    try {
      const counts = await JobApplicationModel.aggregate([
        { $match: { jobId: { $in: allJobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } }
      ]);
      counts.forEach((c: any) => appCountMap.set(c._id, c.count));
    } catch (e) {}

    let results = combined.map((j: any) => {
      let inst = instMap.get(j.institutionId);
      if (!inst) inst = dbStore.getInstitutionById(j.institutionId) || null;

      let appCount = appCountMap.get(j.id) || 0;
      if (appCount === 0 && dbStore.applications.length > 0) {
        appCount = dbStore.applications.filter(a => a.jobId === j.id).length;
      }

      return {
        ...j,
        institution: inst,
        totalApplicants: appCount,
      };
    });

    // Moderation & Approval Filter:
    // Only approved vacancies ('ACTIVE') from verified institutions ('VERIFIED') show on the public portal.
    // Super Admin and HR can view all jobs.
    // An employer can view all jobs for their own institution.
    const isSuperAdmin = req.user && req.user.role === 'ADMIN';
    const isHr = req.user && (req.user.role === 'HR' || req.user.adminRole === 'HR');
    const isPrivileged = isSuperAdmin || isHr;
    let isInstitutionOwner = false;
    if (req.user && institutionId) {
      try {
        const inst = await InstitutionModel.findOne({ id: institutionId, ownerId: req.user.id }).lean();
        if (inst) isInstitutionOwner = true;
      } catch (e) {}
    }

    if (!isPrivileged && !isInstitutionOwner) {
      results = results.filter(j => j.status === 'ACTIVE' && j.institution?.verificationStatus === 'VERIFIED');
    } else {
      if (status && status !== 'ALL') {
        results = results.filter(j => j.status === status);
      }
    }

    // Free text search query
    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      results = results.filter(
        j =>
          j.title.toLowerCase().includes(query) ||
          j.subject.toLowerCase().includes(query) ||
          (j.description && j.description.toLowerCase().includes(query)) ||
          'sikchakhub'.includes(query) ||
          'SikchakHub'.includes(query) ||
          (isPrivileged && j.institution?.name && j.institution.name.toLowerCase().includes(query)) ||
          j.city.toLowerCase().includes(query)
      );
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 50;
    const total = results.length;
    const paginated = results.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    // Public Display Masking:
    // Every job vacancy displayed publicly shows "SikchaKhub" as the company/employer name.
    // Real institution names are preserved in database and shown only to Super Admin, HR, and the posting institution owner.
    const sanitizedJobs = paginated.map(j => {
      const isOwnerOfThisJob = req.user && j.institution && j.institution.ownerId === req.user.id;
      if (isPrivileged || isOwnerOfThisJob) {
        return j;
      }
      return {
        ...j,
        institution: j.institution ? {
          ...j.institution,
          name: 'SikchaKhub',
          logoUrl: '/logo.jpeg',
          description: 'Verified educational opening coordinated via SikchaKhub teacher recruitment network.',
        } : {
          name: 'SikchaKhub',
          logoUrl: '/logo.jpeg',
          verificationStatus: 'VERIFIED',
          description: 'Verified educational opening coordinated via SikchaKhub teacher recruitment network.',
        },
        institutionName: 'SikchaKhub',
      };
    });

    return res.json({
      success: true,
      total,
      page: pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      jobs: sanitizedJobs,
    });
  } catch (error: any) {
    console.error('Jobs fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve vacancies.' });
  }
});

// GET /api/v1/jobs/:id - Single job detail
router.get('/:id', optionalJWT, async (req: Request, res: Response) => {
  try {
    let job: any = null;
    try {
      job = await JobVacancyModel.findOne({ id: req.params.id }).lean();
    } catch (e) {}

    if (!job) {
      job = dbStore.getJobById(req.params.id);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opening not found.' });
    }

    let institution: any = null;
    try {
      institution = await InstitutionModel.findOne({ id: job.institutionId }).lean();
    } catch (e) {}
    if (!institution) institution = dbStore.getInstitutionById(job.institutionId);

    let applicationsCount = 0;
    try {
      applicationsCount = await JobApplicationModel.countDocuments({ jobId: job.id });
    } catch (e) {}
    if (applicationsCount === 0) {
      applicationsCount = dbStore.applications.filter(a => a.jobId === job.id).length;
    }

    const isSuperAdmin = req.user && req.user.role === 'ADMIN';
    const isHr = req.user && (req.user.role === 'HR' || req.user.adminRole === 'HR');
    const isPrivileged = isSuperAdmin || isHr;
    const isInstitutionOwner = req.user && institution && institution.ownerId === req.user.id;

    if (!isPrivileged && !isInstitutionOwner) {
      if (job.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'This job vacancy is currently awaiting administrative approval and is not yet published.',
        });
      }
      if (institution && institution.verificationStatus !== 'VERIFIED') {
        return res.status(403).json({
          success: false,
          message: 'The hiring institution for this job opening is currently under administrative verification.',
        });
      }
    }

    // Public Display Masking for Single Job Details:
    // If not viewed by Super Admin, HR, or the institution owner, employer name is displayed as "SikchaKhub".
    const displayedInstitution = (isPrivileged || isInstitutionOwner)
      ? institution
      : (institution ? {
          ...institution,
          name: 'SikchaKhub',
          logoUrl: '/logo.jpeg',
          description: 'Verified educational opportunity coordinated through SikchaKhub recruitment network.',
        } : {
          name: 'SikchaKhub',
          logoUrl: '/logo.jpeg',
          verificationStatus: 'VERIFIED',
          description: 'Verified educational opportunity coordinated through SikchaKhub recruitment network.',
        });

    return res.json({
      success: true,
      job: {
        ...job,
        institution: displayedInstitution,
        institutionName: (isPrivileged || isInstitutionOwner) ? (institution?.name || 'SikchaKhub') : 'SikchaKhub',
        totalApplicants: applicationsCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve job details.' });
  }
});

// POST /api/v1/jobs - Create Job Opening (Recruiter / Admin)
router.post('/', authenticateJWT, requireVerifiedAccount, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  const parseResult = JobVacancySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  try {
    // Find user's institution
    let institution: any = null;
    try {
      institution = await InstitutionModel.findOne({ ownerId: req.user!.id }).lean();
    } catch (e) {}

    if (!institution) {
      institution = dbStore.institutions.find(i => i.ownerId === req.user!.id);
    }

    if (!institution) {
      institution = {
        id: `inst-${Date.now()}`,
        ownerId: req.user!.id,
        name: `${req.user!.fullName}'s Institution`,
        type: 'SCHOOL',
        logoUrl: '/logo.jpeg',
        website: '',
        description: 'Verified educational institution on SikchaKhub.',
        affiliationNumber: 'REG-PENDING',
        verificationStatus: 'PENDING',
        city: 'Delhi NCR',
        state: 'Delhi',
        address: 'Main Campus',
        pincode: '110001',
      };
      try {
        await InstitutionModel.create(institution);
      } catch (e) {}
      dbStore.institutions.push(institution);
    }

    const isSuperAdmin = req.user!.role === 'ADMIN';
    let initialStatus: any = 'DRAFT';
    let message = '';

    if (isSuperAdmin) {
      initialStatus = 'ACTIVE';
      message = 'Job vacancy published successfully in database!';
    } else {
      const hasVerificationDoc = Boolean(institution.certificateUrl);
      const isVerified = institution.verificationStatus === 'VERIFIED';

      if (req.body.status === 'DRAFT') {
        initialStatus = 'DRAFT';
        message = 'Job vacancy saved as draft in database.';
      } else if (!hasVerificationDoc) {
        initialStatus = 'DRAFT';
        message = 'Institutional registration/verification certificate is mandatory before vacancies can be published live. Saved as Draft until verified.';
      } else if (!isVerified) {
        initialStatus = 'PENDING_APPROVAL';
        message = 'Job vacancy submitted for review. It will appear on the public portal once approved by Super Admin.';
      } else {
        initialStatus = 'PENDING_APPROVAL';
        message = 'Job vacancy submitted for review. It will appear on the public portal once approved by Super Admin.';
      }
    }

    const newJob: any = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: institution.id,
      ...parseResult.data,
      requireResume: req.body.requireResume !== undefined ? Boolean(req.body.requireResume) : true,
      syllabusDocumentUrl: req.body.syllabusDocumentUrl || '',
      syllabusDocumentName: req.body.syllabusDocumentName || '',
      status: initialStatus,
      totalApplicants: 0,
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

    try {
      await JobVacancyModel.create(newJob);
    } catch (dbErr) {
      console.warn('MongoDB JobVacancyModel.create warning:', dbErr);
    }

    dbStore.jobs.unshift(newJob);
    logAuditEvent(
      req, 
      isSuperAdmin ? 'JOB_CREATED' : (initialStatus === 'DRAFT' ? 'JOB_SAVED_DRAFT' : 'JOB_SUBMITTED_FOR_APPROVAL'), 
      'JobVacancy', 
      newJob.id, 
      { title: newJob.title, status: initialStatus }
    );

    return res.status(201).json({
      success: true,
      message,
      job: {
        ...newJob,
        institution,
      },
    });
  } catch (error: any) {
    console.error('Job publication error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish job vacancy.' });
  }
});

// PUT /api/v1/jobs/:id - Update vacancy (Strict employer ownership + field whitelisting)
router.put('/:id', authenticateJWT, requireVerifiedAccount, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    let existingJob: any = null;
    try {
      existingJob = await JobVacancyModel.findOne({ id: req.params.id }).lean();
    } catch (e) {}
    if (!existingJob) existingJob = dbStore.getJobById(req.params.id);

    if (!existingJob) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    // Role-based authorization: Employer can only modify their own institution's vacancies
    if (req.user!.role === 'EMPLOYER') {
      let inst: any = null;
      try {
        inst = await InstitutionModel.findOne({ ownerId: req.user!.id }).lean();
      } catch (e) {}
      if (!inst) inst = dbStore.institutions.find(i => i.ownerId === req.user!.id);

      if (!inst || existingJob.institutionId !== inst.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to edit this vacancy.' });
      }
    }

    // Whitelist allowed fields to prevent mass-assignment
    const allowedFields = [
      'title', 'department', 'subject', 'additionalSubjects', 'teachingLevel',
      'board', 'employmentType', 'minExperienceYears', 'maxExperienceYears',
      'requiredQualification', 'description', 'responsibilities', 'benefits',
      'minSalaryLPA', 'maxSalaryLPA', 'city', 'state', 'vacanciesCount'
    ];
    const sanitizedUpdates: Record<string, any> = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) {
        sanitizedUpdates[f] = req.body[f];
      }
    }
    sanitizedUpdates.updatedAt = new Date().toISOString();

    let updatedJob: any = null;
    try {
      updatedJob = await JobVacancyModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: sanitizedUpdates },
        { new: true }
      ).lean();
    } catch (e) {}

    const index = dbStore.jobs.findIndex(j => j.id === req.params.id);
    if (index !== -1) {
      dbStore.jobs[index] = {
        ...dbStore.jobs[index],
        ...sanitizedUpdates,
      };
      if (!updatedJob) updatedJob = dbStore.jobs[index];
    }

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    logAuditEvent(req, 'JOB_UPDATED', 'JobVacancy', req.params.id);

    return res.json({
      success: true,
      message: 'Job vacancy updated successfully!',
      job: updatedJob,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update job vacancy.' });
  }
});

// PATCH /api/v1/jobs/:id/status - Change status (ACTIVE, PAUSED, CLOSED) with ownership verification
router.patch('/:id/status', authenticateJWT, requireVerifiedAccount, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!status || !['ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Must be ACTIVE, PAUSED, CLOSED, or DRAFT.' });
  }

  try {
    let existingJob: any = null;
    try {
      existingJob = await JobVacancyModel.findOne({ id: req.params.id }).lean();
    } catch (e) {}
    if (!existingJob) existingJob = dbStore.jobs.find(j => j.id === req.params.id);

    if (!existingJob) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    // Role-based authorization: Employer must own the vacancy
    if (req.user!.role === 'EMPLOYER') {
      let inst: any = null;
      try {
        inst = await InstitutionModel.findOne({ ownerId: req.user!.id }).lean();
      } catch (e) {}
      if (!inst) inst = dbStore.institutions.find(i => i.ownerId === req.user!.id);

      if (!inst || existingJob.institutionId !== inst.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to modify this vacancy.' });
      }
    }

    if (status === 'ACTIVE' && req.user!.role !== 'ADMIN') {
      let inst: any = null;
      try {
        inst = await InstitutionModel.findOne({ ownerId: req.user!.id }).lean();
      } catch (e) {}
      if (!inst) inst = dbStore.institutions.find(i => i.ownerId === req.user!.id);

      if (inst && !inst.certificateUrl) {
        return res.status(403).json({
          success: false,
          message: 'Registration/Affiliation verification document is mandatory before publishing live vacancies.',
        });
      }
      if (inst && inst.verificationStatus !== 'VERIFIED') {
        return res.status(403).json({
          success: false,
          message: 'Institution verification by Super Admin is required before publishing vacancies live.',
        });
      }
    }

    let updatedJob: any = null;
    try {
      updatedJob = await JobVacancyModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: { status, updatedAt: new Date().toISOString() } },
        { new: true }
      ).lean();
    } catch (e) {}

    const job = dbStore.jobs.find(j => j.id === req.params.id);
    if (job) {
      job.status = status;
      job.updatedAt = new Date().toISOString();
      if (!updatedJob) updatedJob = job;
    }

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    logAuditEvent(req, 'JOB_STATUS_CHANGED', 'JobVacancy', req.params.id, { status });

    return res.json({
      success: true,
      message: `Job status updated to ${status}.`,
      job: updatedJob,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to change job status.' });
  }
});

export default router;
