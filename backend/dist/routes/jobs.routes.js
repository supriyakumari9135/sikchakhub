"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const mongodb_1 = require("../db/mongodb");
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditLogger_1 = require("../middleware/auditLogger");
const shared_validation_1 = require("@sikchakhub/shared-validation");
const router = (0, express_1.Router)();
// GET /api/v1/jobs - Public Search & Filtering directly from database
router.get('/', authMiddleware_1.optionalJWT, async (req, res) => {
    const { q, subject, teachingLevel, board, employmentType, city, minSalary, maxSalary, minExp, status = 'ACTIVE', institutionId, page = '1', limit = '50', } = req.query;
    try {
        // 1. Fetch from MongoDB Atlas
        let mongoJobs = [];
        try {
            const queryFilter = {};
            if (status && status !== 'ALL') {
                queryFilter.status = status;
            }
            if (institutionId) {
                queryFilter.institutionId = institutionId;
            }
            if (subject) {
                queryFilter.subject = new RegExp(String(subject), 'i');
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
                queryFilter.city = new RegExp(String(city), 'i');
            }
            if (minSalary) {
                queryFilter.maxSalaryLPA = { $gte: Number(minSalary) };
            }
            if (minExp) {
                queryFilter.minExperienceYears = { $lte: Number(minExp) };
            }
            mongoJobs = await mongodb_1.JobVacancyModel.find(queryFilter).sort({ createdAt: -1 }).lean();
        }
        catch (dbErr) {
            console.warn('MongoDB JobVacancyModel.find error, falling back to memory store:', dbErr);
            mongoJobs = store_1.dbStore.jobs;
        }
        const combined = mongoJobs;
        // Attach real institutions and count real applications
        let results = await Promise.all(combined.map(async (j) => {
            let inst = null;
            try {
                inst = await mongodb_1.InstitutionModel.findOne({ id: j.institutionId }).lean();
            }
            catch (e) { }
            if (!inst)
                inst = store_1.dbStore.getInstitutionById(j.institutionId) || null;
            let appCount = 0;
            try {
                appCount = await mongodb_1.JobApplicationModel.countDocuments({ jobId: j.id });
            }
            catch (e) { }
            if (appCount === 0 && store_1.dbStore.applications.length > 0) {
                appCount = store_1.dbStore.applications.filter(a => a.jobId === j.id).length;
            }
            return {
                ...j,
                institution: inst,
                totalApplicants: appCount,
            };
        }));
        // Moderation & Approval Filter:
        // Only approved vacancies ('ACTIVE') from verified institutions ('VERIFIED') show on the public portal.
        // Super Admin can view all jobs.
        // An employer can view all jobs for their own institution.
        const isSuperAdmin = req.user && req.user.role === 'ADMIN';
        let isInstitutionOwner = false;
        if (req.user && institutionId) {
            try {
                const inst = await mongodb_1.InstitutionModel.findOne({ id: institutionId, ownerId: req.user.id }).lean();
                if (inst)
                    isInstitutionOwner = true;
            }
            catch (e) { }
        }
        if (!isSuperAdmin && !isInstitutionOwner) {
            results = results.filter(j => j.status === 'ACTIVE' && j.institution?.verificationStatus === 'VERIFIED');
        }
        else {
            if (status && status !== 'ALL') {
                results = results.filter(j => j.status === status);
            }
        }
        // Free text search query
        if (q && typeof q === 'string') {
            const query = q.toLowerCase();
            results = results.filter(j => j.title.toLowerCase().includes(query) ||
                j.subject.toLowerCase().includes(query) ||
                (j.description && j.description.toLowerCase().includes(query)) ||
                (j.institution?.name && j.institution.name.toLowerCase().includes(query)) ||
                j.city.toLowerCase().includes(query));
        }
        const pageNum = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 50;
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
    }
    catch (error) {
        console.error('Jobs fetch error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve vacancies.' });
    }
});
// GET /api/v1/jobs/:id - Single job detail
router.get('/:id', authMiddleware_1.optionalJWT, async (req, res) => {
    try {
        let job = null;
        try {
            job = await mongodb_1.JobVacancyModel.findOne({ id: req.params.id }).lean();
        }
        catch (e) { }
        if (!job) {
            job = store_1.dbStore.getJobById(req.params.id);
        }
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job opening not found.' });
        }
        let institution = null;
        try {
            institution = await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean();
        }
        catch (e) { }
        if (!institution)
            institution = store_1.dbStore.getInstitutionById(job.institutionId);
        let applicationsCount = 0;
        try {
            applicationsCount = await mongodb_1.JobApplicationModel.countDocuments({ jobId: job.id });
        }
        catch (e) { }
        if (applicationsCount === 0) {
            applicationsCount = store_1.dbStore.applications.filter(a => a.jobId === job.id).length;
        }
        const isSuperAdmin = req.user && req.user.role === 'ADMIN';
        const isInstitutionOwner = req.user && institution && institution.ownerId === req.user.id;
        if (!isSuperAdmin && !isInstitutionOwner) {
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
        return res.json({
            success: true,
            job: {
                ...job,
                institution,
                totalApplicants: applicationsCount,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve job details.' });
    }
});
// POST /api/v1/jobs - Create Job Opening (Recruiter / Admin)
router.post('/', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const parseResult = shared_validation_1.JobVacancySchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }
    try {
        // Find user's institution
        let institution = null;
        try {
            institution = await mongodb_1.InstitutionModel.findOne({ ownerId: req.user.id }).lean();
        }
        catch (e) { }
        if (!institution) {
            institution = store_1.dbStore.institutions.find(i => i.ownerId === req.user.id);
        }
        if (!institution) {
            institution = {
                id: `inst-${Date.now()}`,
                ownerId: req.user.id,
                name: `${req.user.fullName}'s Institution`,
                type: 'SCHOOL',
                logoUrl: '/logo.jpeg',
                website: '',
                description: 'Verified educational institution on SikshaHub.',
                affiliationNumber: 'REG-PENDING',
                verificationStatus: 'PENDING',
                city: 'Delhi NCR',
                state: 'Delhi',
                address: 'Main Campus',
                pincode: '110001',
            };
            try {
                await mongodb_1.InstitutionModel.create(institution);
            }
            catch (e) { }
            store_1.dbStore.institutions.push(institution);
        }
        const isSuperAdmin = req.user.role === 'ADMIN';
        const initialStatus = isSuperAdmin ? 'ACTIVE' : 'PENDING_APPROVAL';
        const newJob = {
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
            await mongodb_1.JobVacancyModel.create(newJob);
        }
        catch (dbErr) {
            console.warn('MongoDB JobVacancyModel.create warning:', dbErr);
        }
        store_1.dbStore.jobs.unshift(newJob);
        (0, auditLogger_1.logAuditEvent)(req, isSuperAdmin ? 'JOB_CREATED' : 'JOB_SUBMITTED_FOR_APPROVAL', 'JobVacancy', newJob.id, { title: newJob.title, status: initialStatus });
        const message = isSuperAdmin
            ? 'Job vacancy published successfully in database!'
            : 'Job vacancy submitted for review. It will appear on the public portal once approved by Super Admin.';
        return res.status(201).json({
            success: true,
            message,
            job: {
                ...newJob,
                institution,
            },
        });
    }
    catch (error) {
        console.error('Job publication error:', error);
        return res.status(500).json({ success: false, message: 'Failed to publish job vacancy.' });
    }
});
// PUT /api/v1/jobs/:id - Update vacancy
router.put('/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    try {
        let updatedJob = null;
        try {
            updatedJob = await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: req.params.id }, { $set: { ...req.body, updatedAt: new Date().toISOString() } }, { new: true }).lean();
        }
        catch (e) { }
        const index = store_1.dbStore.jobs.findIndex(j => j.id === req.params.id);
        if (index !== -1) {
            store_1.dbStore.jobs[index] = {
                ...store_1.dbStore.jobs[index],
                ...req.body,
                updatedAt: new Date().toISOString(),
            };
            if (!updatedJob)
                updatedJob = store_1.dbStore.jobs[index];
        }
        if (!updatedJob) {
            return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'JOB_UPDATED', 'JobVacancy', req.params.id);
        return res.json({
            success: true,
            message: 'Job vacancy updated successfully!',
            job: updatedJob,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update job vacancy.' });
    }
});
// PATCH /api/v1/jobs/:id/status - Change status (ACTIVE, PAUSED, CLOSED)
router.patch('/:id/status', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const { status } = req.body;
    try {
        let updatedJob = null;
        try {
            updatedJob = await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: req.params.id }, { $set: { status, updatedAt: new Date().toISOString() } }, { new: true }).lean();
        }
        catch (e) { }
        const job = store_1.dbStore.jobs.find(j => j.id === req.params.id);
        if (job) {
            job.status = status;
            job.updatedAt = new Date().toISOString();
            if (!updatedJob)
                updatedJob = job;
        }
        if (!updatedJob) {
            return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'JOB_STATUS_CHANGED', 'JobVacancy', req.params.id, { status });
        return res.json({
            success: true,
            message: `Job status updated to ${status}.`,
            job: updatedJob,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to change job status.' });
    }
});
exports.default = router;
