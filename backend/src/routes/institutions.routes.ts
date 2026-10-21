import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { authenticateJWT, optionalJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { InstitutionSchema } from '@sikchakhub/shared-validation';

const router = Router();

// GET /api/v1/institutions - Public list of verified institutions
router.get('/', optionalJWT, (req: Request, res: Response) => {
  const { type, city, q } = req.query;

  let list = dbStore.institutions.filter(i => i.verificationStatus === 'VERIFIED');

  if (type && typeof type === 'string') {
    list = list.filter(i => i.type === type);
  }

  if (city && typeof city === 'string') {
    list = list.filter(i => i.city.toLowerCase().includes(city.toLowerCase()));
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(query) || i.city.toLowerCase().includes(query));
  }

  const enriched = list.map(inst => ({
    ...inst,
    activeJobsCount: dbStore.jobs.filter(j => j.institutionId === inst.id && j.status === 'ACTIVE').length,
  }));

  return res.json({ success: true, institutions: enriched });
});

// GET /api/v1/institutions/:id - Institution profile & active jobs
router.get('/:id', optionalJWT, (req: Request, res: Response) => {
  const inst = dbStore.getInstitutionById(req.params.id);
  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution not found.' });
  }

  const jobs = dbStore.jobs.filter(j => j.institutionId === inst.id && j.status === 'ACTIVE');

  return res.json({
    success: true,
    institution: {
      ...inst,
      jobs,
    },
  });
});

// POST /api/v1/institutions - Register institution (requires verification)
router.post('/', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), (req: Request, res: Response) => {
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
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=160&h=160&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.institutions.unshift(newInst as any);
  logAuditEvent(req, 'INSTITUTION_REGISTERED', 'Institution', newInst.id, { name: newInst.name });

  return res.status(201).json({
    success: true,
    message: 'Institution submitted for verification review!',
    institution: newInst,
  });
});

export default router;
