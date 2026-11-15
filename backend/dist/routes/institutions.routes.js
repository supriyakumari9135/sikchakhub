"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const mongodb_1 = require("../db/mongodb");
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditLogger_1 = require("../middleware/auditLogger");
const shared_validation_1 = require("@sikchakhub/shared-validation");
const router = (0, express_1.Router)();
// GET /api/v1/institutions - Public list of verified institutions
router.get('/', authMiddleware_1.optionalJWT, async (req, res) => {
    const { type, city, q } = req.query;
    try {
        let list = [];
        try {
            const filter = { verificationStatus: 'VERIFIED' };
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
            list = await mongodb_1.InstitutionModel.find(filter).lean();
        }
        catch (e) {
            list = store_1.dbStore.institutions.filter(i => i.verificationStatus === 'VERIFIED');
        }
        const enriched = await Promise.all(list.map(async (inst) => {
            let activeJobsCount = 0;
            try {
                activeJobsCount = await mongodb_1.JobVacancyModel.countDocuments({ institutionId: inst.id, status: 'ACTIVE' });
            }
            catch (e) {
                activeJobsCount = store_1.dbStore.jobs.filter(j => j.institutionId === inst.id && j.status === 'ACTIVE').length;
            }
            return {
                ...inst,
                activeJobsCount,
            };
        }));
        return res.json({ success: true, institutions: enriched });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve institutions' });
    }
});
// GET /api/v1/institutions/:id - Institution profile & active jobs
router.get('/:id', authMiddleware_1.optionalJWT, async (req, res) => {
    try {
        let inst = null;
        try {
            inst = await mongodb_1.InstitutionModel.findOne({ id: req.params.id }).lean();
        }
        catch (e) { }
        if (!inst) {
            inst = store_1.dbStore.getInstitutionById(req.params.id);
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
        let jobs = [];
        try {
            jobs = await mongodb_1.JobVacancyModel.find({ institutionId: inst.id, status: 'ACTIVE' }).lean();
        }
        catch (e) {
            jobs = store_1.dbStore.jobs.filter(j => j.institutionId === inst.id && j.status === 'ACTIVE');
        }
        return res.json({
            success: true,
            institution: {
                ...inst,
                jobs,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve institution profile' });
    }
});
// POST /api/v1/institutions - Register institution (requires full account verification)
router.post('/', authMiddleware_1.authenticateJWT, authMiddleware_1.requireVerifiedAccount, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const parseResult = shared_validation_1.InstitutionSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }
    const newInst = {
        id: `inst-${Date.now()}`,
        ownerId: req.user.id,
        ...parseResult.data,
        verificationStatus: 'PENDING',
        verificationNotes: 'Under compliance and affiliation review',
        logoUrl: '/logo.jpeg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    try {
        await mongodb_1.InstitutionModel.create(newInst);
    }
    catch (e) { }
    store_1.dbStore.institutions.unshift(newInst);
    (0, auditLogger_1.logAuditEvent)(req, 'INSTITUTION_REGISTERED', 'Institution', newInst.id, { name: newInst.name });
    return res.status(201).json({
        success: true,
        message: 'Institution submitted for verification review!',
        institution: newInst,
    });
});
exports.default = router;
