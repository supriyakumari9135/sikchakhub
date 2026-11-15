import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { InstitutionModel, JobVacancyModel } from '../db/mongodb';
import { authenticateJWT, optionalJWT, requireRole, requireVerifiedAccount } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { InstitutionSchema } from '@sikchakhub/shared-validation';

const router = Router();

// GET /api/v1/institutions - Public list of verified institutions
router.get('/', optionalJWT, async (req: Request, res: Response) => {
  const { type, city, q } = req.query;

  try {
    let list: any[] = [];
    try {
      const filter: any = { verificationStatus: 'VERIFIED' };
      if (type && typeof type === 'string') {
        filter.type = type;
      }
      if (city && typeof city === 'string') {
        filter.city = new RegExp(city, 'i');
      }
      if (q && typeof q === 'string') {
        filter.$or = [
          { name: new RegExp(q, 'i') },
          { city: new RegExp(q, 'i') }
        ];
      }
      list = await InstitutionModel.find(filter).lean();
    } catch (e) {
      list = dbStore.institutions.filter(i => i.verificationStatus === 'VERIFIED');
    }

    const enriched = await Promise.all(list.map(async inst => {
      let activeJobsCount = 0;
      try {
        activeJobsCount = await JobVacancyModel.countDocuments({ institutionId: inst.id, status: 'ACTIVE' });
      } catch (e) {
        activeJobsCount = dbStore.jobs.filter(j => j.institutionId === inst.id && j.status === 'ACTIVE').length;
      }
      return {
        ...inst,
        activeJobsCount,
      };
    }));

    return res.json({ success: true, institutions: enriched });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve institutions' });
  }
});

// GET /api/v1/institutions/:id - Institution profile & active jobs
router.get('/:id', optionalJWT, async (req: Request, res: Response) => {
  try {
    let inst: any = null;
    try {
      inst = await InstitutionModel.findOne({ id: req.params.id }).lean();
    } catch (e) {}
    if (!inst) {
      inst = dbStore.getInstitutionById(req.params.id);
    }

    if (!inst) {
      return res.status(404).json({ success: false, message: 'Institution not found.' });
    }

    const isSuperAdmin = req.user && req.user.role === 'ADMIN';
    const isOwner = req.user && inst.ownerId === req.user.id;

    if (!isSuperAdmin && !isOwner && inst.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'This institution is currently awaiting administrative approval and is not publicly listed.',
      });
    }

    let jobs: any[] = [];
    try {
      jobs = await JobVacancyModel.find({ institutionId: inst.id, status: 'ACTIVE' }).lean();
    } catch (e) {
      jobs = dbStore.jobs.filter(j => j.institutionId === inst.id && j.status === 'ACTIVE');
    }

    return res.json({
      success: true,
      institution: {
        ...inst,
        jobs,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve institution profile' });
  }
});

// POST /api/v1/institutions - Register institution (requires full account verification)
router.post('/', authenticateJWT, requireVerifiedAccount, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  const parseResult = InstitutionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, errors: parseResult.error.format() });
  }

  const newInst = {
    id: `inst-${Date.now()}`,
    ownerId: req.user!.id,
    ...parseResult.data,
    verificationStatus: 'PENDING' as const,
    verificationNotes: 'Under compliance and affiliation review',
    logoUrl: '/logo.jpeg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await InstitutionModel.create(newInst);
  } catch (e) {}

  dbStore.institutions.unshift(newInst as any);
  logAuditEvent(req, 'INSTITUTION_REGISTERED', 'Institution', newInst.id, { name: newInst.name });

  return res.status(201).json({
    success: true,
    message: 'Institution submitted for verification review!',
    institution: newInst,
  });
});

export default router;
