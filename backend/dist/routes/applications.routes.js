"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const store_1 = require("../db/store");
const mongodb_1 = require("../db/mongodb");
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditLogger_1 = require("../middleware/auditLogger");
const screeningEngine_1 = require("../services/screeningEngine");
const shared_validation_1 = require("@sikchakhub/shared-validation");
const router = (0, express_1.Router)();
// GET /api/v1/applications/stats/employer - Real database KPI metrics for logged-in employer
router.get('/stats/employer', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    try {
        const userId = req.user.id;
        let institution = null;
        try {
            institution = await mongodb_1.InstitutionModel.findOne({ ownerId: userId }).lean();
        }
        catch (e) { }
        if (!institution) {
            institution = store_1.dbStore.institutions.find(i => i.ownerId === userId) || null;
        }
        if (!institution) {
            return res.json({
                success: true,
                stats: {
                    activeOpenings: 0,
                    totalApplicants: 0,
                    shortlistedPool: 0,
                    interviewsAndDemos: 0,
                    stageCounts: {
                        ALL: 0,
                        APPLIED: 0,
                        SCREENING: 0,
                        SHORTLISTED: 0,
                        INTERVIEW_SCHEDULED: 0,
                        SELECTED: 0,
                        REJECTED: 0,
                    }
                }
            });
        }
        // Get all jobs belonging to this institution
        let jobs = [];
        try {
            jobs = await mongodb_1.JobVacancyModel.find({ institutionId: institution.id }).lean();
        }
        catch (e) { }
        if (jobs.length === 0 && store_1.dbStore.jobs.length > 0) {
            jobs = store_1.dbStore.jobs.filter(j => j.institutionId === institution.id);
        }
        const jobIds = jobs.map(j => j.id);
        // Count applications across employer's jobs
        let totalApplicants = 0;
        let shortlistedCount = 0;
        let interviewsCount = 0;
        let stageCounts = {
            ALL: 0,
            APPLIED: 0,
            SCREENING: 0,
            SHORTLISTED: 0,
            INTERVIEW_SCHEDULED: 0,
            SELECTED: 0,
            REJECTED: 0,
        };
        if (jobIds.length > 0) {
            try {
                const apps = await mongodb_1.JobApplicationModel.find({ jobId: { $in: jobIds } }).lean();
                totalApplicants = apps.length;
                apps.forEach(a => {
                    stageCounts.ALL++;
                    if (stageCounts[a.stage] !== undefined) {
                        stageCounts[a.stage]++;
                    }
                    if (a.stage === 'SHORTLISTED')
                        shortlistedCount++;
                    if (a.stage === 'INTERVIEW_SCHEDULED')
                        interviewsCount++;
                });
            }
            catch (e) { }
            if (totalApplicants === 0 && store_1.dbStore.applications.length > 0) {
                const fallbackApps = store_1.dbStore.applications.filter(a => jobIds.includes(a.jobId));
                totalApplicants = fallbackApps.length;
                fallbackApps.forEach(a => {
                    stageCounts.ALL++;
                    if (stageCounts[a.stage] !== undefined)
                        stageCounts[a.stage]++;
                    if (a.stage === 'SHORTLISTED')
                        shortlistedCount++;
                    if (a.stage === 'INTERVIEW_SCHEDULED')
                        interviewsCount++;
                });
            }
        }
        const activeOpenings = jobs.filter(j => j.status === 'ACTIVE').length;
        return res.json({
            success: true,
            stats: {
                activeOpenings,
                totalApplicants,
                shortlistedPool: shortlistedCount,
                interviewsAndDemos: interviewsCount,
                stageCounts: {
                    ALL: totalApplicants,
                    APPLIED: stageCounts.APPLIED,
                    SCREENING: stageCounts.SCREENING,
                    SHORTLISTED: shortlistedCount,
                    INTERVIEW_SCHEDULED: interviewsCount,
                    SELECTED: stageCounts.SELECTED,
                    REJECTED: stageCounts.REJECTED,
                }
            }
        });
    }
    catch (error) {
        console.error('Employer stats calculation error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve employer statistics.' });
    }
});
// POST /api/v1/applications - Submit Job Application directly to MongoDB Atlas
router.post('/', authMiddleware_1.authenticateJWT, async (req, res) => {
    const parseResult = shared_validation_1.SubmitApplicationSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }
    const { jobId, resumeUrl, coverLetter, customAnswers } = parseResult.data;
    const teacherId = req.user.id;
    try {
        // 1. Fetch job from MongoDB Atlas
        let job = null;
        try {
            job = await mongodb_1.JobVacancyModel.findOne({ id: jobId }).lean();
        }
        catch (e) { }
        if (!job) {
            job = store_1.dbStore.getJobById(jobId);
        }
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job opening not found.' });
        }
        // 2. Prevent applications on unapproved, paused, or closed vacancies
        if (job.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'This job vacancy is currently awaiting administrative approval and is not accepting applications.'
            });
        }
        let institution = null;
        try {
            institution = await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean();
        }
        catch (e) { }
        if (!institution)
            institution = store_1.dbStore.getInstitutionById(job.institutionId);
        if (institution && institution.verificationStatus !== 'VERIFIED') {
            return res.status(400).json({
                success: false,
                message: 'The hiring institution for this job opening is currently under administrative verification.',
            });
        }
        if (job.deadline && new Date(job.deadline) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'The application deadline for this opening has passed.'
            });
        }
        // 3. Prevent duplicate application
        let existingApp = null;
        try {
            existingApp = await mongodb_1.JobApplicationModel.findOne({ jobId, teacherId }).lean();
        }
        catch (e) { }
        if (!existingApp) {
            existingApp = store_1.dbStore.applications.find(a => a.jobId === jobId && a.teacherId === teacherId);
        }
        if (existingApp) {
            return res.status(400).json({
                success: false,
                alreadyApplied: true,
                message: 'You have already applied for this opening. You can track your status in your Job Seeker Dashboard.'
            });
        }
        // 4. Retrieve teacher user & profile from MongoDB Atlas
        let teacherUser = null;
        try {
            teacherUser = await mongodb_1.UserModel.findOne({ id: teacherId }).lean();
        }
        catch (e) { }
        if (!teacherUser)
            teacherUser = store_1.dbStore.getUserById(teacherId);
        let teacherProfile = null;
        try {
            teacherProfile = await mongodb_1.TeacherProfileModel.findOne({ userId: teacherId }).lean();
        }
        catch (e) { }
        if (!teacherProfile)
            teacherProfile = store_1.dbStore.getProfileByUserId(teacherId);
        const applicationResumeUrl = resumeUrl || teacherProfile?.resumeUrl || '';
        const applicationResumeFileName = req.body.resumeFileName || teacherProfile?.resumeFileName || (applicationResumeUrl ? 'Educator_CV.pdf' : '');
        // 5. Execute candidate screening engine with resume parsing
        const matchResult = await (0, screeningEngine_1.analyzeApplicationATS)(job, {
            fullName: teacherUser?.fullName || 'Applicant',
            profile: teacherProfile,
            resumeUrl: applicationResumeUrl,
            resumeFileName: applicationResumeFileName,
        }, customAnswers);
        const initialStage = matchResult.autoFilteredStatus === 'QUALIFIED' ? 'SCREENING' : 'APPLIED';
        const applicationId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newApplicationDoc = {
            id: applicationId,
            jobId,
            teacherId,
            resumeUrl: applicationResumeUrl,
            resumeFileName: applicationResumeFileName,
            coverLetter: coverLetter || '',
            stage: initialStage,
            customAnswers: customAnswers || {},
            matchResult,
            recruiterNotes: '',
            appliedAt: new Date(),
        };
        // 6. Save in MongoDB Atlas & increment job applicant count
        try {
            await mongodb_1.JobApplicationModel.create(newApplicationDoc);
            await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: jobId }, { $inc: { totalApplicants: 1 } });
        }
        catch (dbSaveErr) {
            console.warn('MongoDB JobApplication save warning:', dbSaveErr);
        }
        store_1.dbStore.applications.unshift({
            ...newApplicationDoc,
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        (0, auditLogger_1.logAuditEvent)(req, 'APPLICATION_SUBMITTED', 'JobApplication', applicationId, {
            jobId,
            score: matchResult.overallScore,
            status: matchResult.autoFilteredStatus,
        });
        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully to database!',
            application: {
                ...newApplicationDoc,
                job,
            },
        });
    }
    catch (error) {
        console.error('Application submission error:', error);
        return res.status(500).json({ success: false, message: 'Server error while submitting application.' });
    }
});
// GET /api/v1/applications/my-applications - For logged in teacher
router.get('/my-applications', authMiddleware_1.authenticateJWT, async (req, res) => {
    const teacherId = req.user.id;
    try {
        let apps = [];
        try {
            apps = await mongodb_1.JobApplicationModel.find({ teacherId }).sort({ appliedAt: -1 }).lean();
        }
        catch (e) {
            if (store_1.dbStore.applications.length > 0) {
                apps = store_1.dbStore.getApplicationsByTeacherId(teacherId);
            }
        }
        // Populate job and institution
        const populated = await Promise.all(apps.map(async (app) => {
            let job = null;
            try {
                job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
            }
            catch (e) { }
            if (!job)
                job = store_1.dbStore.getJobById(app.jobId);
            let institution = null;
            if (job) {
                try {
                    institution = await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean();
                }
                catch (e) { }
                if (!institution)
                    institution = store_1.dbStore.getInstitutionById(job.institutionId);
            }
            return {
                ...app,
                institutionName: 'SikshaHub',
                job: job ? {
                    ...job,
                    institution: institution ? {
                        ...institution,
                        name: 'SikshaHub',
                        logoUrl: '/logo.jpeg',
                    } : {
                        name: 'SikshaHub',
                        logoUrl: '/logo.jpeg',
                    },
                    institutionName: 'SikshaHub',
                } : undefined,
            };
        }));
        return res.json({ success: true, applications: populated });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve applications.' });
    }
});
// GET /api/v1/applications/job/:jobId - Recruiter pipeline candidate list with authorization & auto ATS ranking
router.get('/job/:jobId', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const { jobId } = req.params;
    const { stage, minScore, status, q, limit } = req.query;
    try {
        let employerInst = null;
        if (req.user.role === 'EMPLOYER') {
            try {
                employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: req.user.id }).lean();
            }
            catch (e) { }
            if (!employerInst) {
                employerInst = store_1.dbStore.institutions.find(i => i.ownerId === req.user.id);
            }
        }
        let targetJobIds = [];
        const jobsMap = new Map();
        if (jobId.toUpperCase() === 'ALL') {
            let employerJobs = [];
            try {
                const jobFilter = employerInst ? { institutionId: employerInst.id } : {};
                employerJobs = await mongodb_1.JobVacancyModel.find(jobFilter).lean();
            }
            catch (e) { }
            if (employerJobs.length === 0) {
                employerJobs = employerInst ? store_1.dbStore.jobs.filter(j => j.institutionId === employerInst.id) : store_1.dbStore.jobs;
            }
            targetJobIds = employerJobs.map(j => j.id);
            employerJobs.forEach(j => jobsMap.set(j.id, j));
        }
        else {
            let job = null;
            try {
                job = await mongodb_1.JobVacancyModel.findOne({ id: jobId }).lean();
            }
            catch (e) { }
            if (!job)
                job = store_1.dbStore.getJobById(jobId);
            if (!job) {
                return res.status(404).json({ success: false, message: 'Job opening not found.' });
            }
            if (req.user.role === 'EMPLOYER' && employerInst && job.institutionId !== employerInst.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized to view candidates for this vacancy.' });
            }
            targetJobIds = [job.id];
            jobsMap.set(job.id, job);
        }
        // 2. Fetch candidates from MongoDB Atlas
        let apps = [];
        try {
            const queryFilter = { jobId: { $in: targetJobIds } };
            if (stage && stage !== 'ALL') {
                queryFilter.stage = stage;
            }
            apps = await mongodb_1.JobApplicationModel.find(queryFilter).sort({ appliedAt: -1 }).lean();
        }
        catch (e) {
            if (store_1.dbStore.applications.length > 0) {
                apps = store_1.dbStore.applications.filter(a => targetJobIds.includes(a.jobId));
                if (stage && stage !== 'ALL') {
                    apps = apps.filter(a => a.stage === stage);
                }
            }
        }
        // 3. Populate complete teacher profiles & jobs
        let candidates = await Promise.all(apps.map(async (app) => {
            let teacher = null;
            try {
                teacher = await mongodb_1.UserModel.findOne({ id: app.teacherId }).lean();
            }
            catch (e) { }
            if (!teacher)
                teacher = store_1.dbStore.getUserById(app.teacherId);
            let profile = null;
            try {
                profile = await mongodb_1.TeacherProfileModel.findOne({ userId: app.teacherId }).lean();
            }
            catch (e) { }
            if (!profile)
                profile = store_1.dbStore.getProfileByUserId(app.teacherId);
            const relJob = jobsMap.get(app.jobId);
            return {
                ...app,
                job: relJob ? {
                    id: relJob.id,
                    title: relJob.title,
                    subject: relJob.subject,
                    teachingLevel: relJob.teachingLevel,
                    city: relJob.city,
                    state: relJob.state,
                    minSalaryLPA: relJob.minSalaryLPA,
                    maxSalaryLPA: relJob.maxSalaryLPA,
                } : undefined,
                teacher: teacher ? {
                    id: teacher.id,
                    fullName: teacher.fullName,
                    email: teacher.email,
                    avatarUrl: teacher.avatarUrl,
                    phone: teacher.phone,
                    profile: profile || undefined,
                } : undefined,
            };
        }));
        // Filtering by minimum score
        if (minScore) {
            candidates = candidates.filter(c => (c.matchResult?.overallScore || 0) >= Number(minScore));
        }
        // Filtering by search query (including new teacher details)
        if (q && typeof q === 'string') {
            const query = q.toLowerCase();
            candidates = candidates.filter(c => {
                const prof = c.teacher?.profile;
                return (c.teacher?.fullName?.toLowerCase().includes(query) ||
                    c.teacher?.email?.toLowerCase().includes(query) ||
                    prof?.subjects?.some((s) => s.toLowerCase().includes(query)) ||
                    prof?.currentCity?.toLowerCase().includes(query) ||
                    c.job?.title?.toLowerCase().includes(query) ||
                    c.job?.subject?.toLowerCase().includes(query) ||
                    prof?.previousSchool?.toLowerCase().includes(query) ||
                    prof?.boards?.some((b) => b.toLowerCase().includes(query)) ||
                    prof?.skills?.some((sk) => sk.toLowerCase().includes(query)) ||
                    prof?.teachingLevels?.some((lvl) => lvl.toLowerCase().includes(query)) ||
                    prof?.certifications?.some((ct) => ct.toLowerCase().includes(query)) ||
                    prof?.highestQualification?.toLowerCase().includes(query) ||
                    prof?.degree?.toLowerCase().includes(query) ||
                    prof?.languages?.some((lng) => lng.toLowerCase().includes(query)));
            });
        }
        // Sort strictly by ATS match score descending (highest ATS score first)
        candidates.sort((a, b) => (b.matchResult?.overallScore || 0) - (a.matchResult?.overallScore || 0));
        // Limit top results if requested (e.g. top 50 or top 60)
        const topLimit = limit ? Number(limit) : undefined;
        const returnedCandidates = topLimit ? candidates.slice(0, topLimit) : candidates;
        return res.json({
            success: true,
            total: candidates.length,
            candidates: returnedCandidates,
        });
    }
    catch (error) {
        console.error('Job applicants fetch error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve candidate applications.' });
    }
});
// POST /api/v1/applications/upload-candidate - Direct recruiter CV upload (PDF <= 1MB) with automated ATS ranking
router.post('/upload-candidate', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const { jobId, fullName, email, phone, experienceYears, highestQualification, subject, base64Data, fileName } = req.body;
    if (!jobId || !fullName || !email) {
        return res.status(400).json({ success: false, message: 'Job, candidate full name, and email are required.' });
    }
    try {
        let job = null;
        try {
            job = await mongodb_1.JobVacancyModel.findOne({ id: jobId }).lean();
        }
        catch (e) { }
        if (!job)
            job = store_1.dbStore.getJobById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Target job vacancy not found.' });
        }
        let resumeUrl = '';
        const safeFileName = (fileName || 'Candidate_Resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
        // Handle PDF upload if provided
        if (base64Data) {
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            const base64String = matches && matches.length === 3 ? matches[2] : base64Data;
            const buffer = Buffer.from(base64String, 'base64');
            if (buffer.length > 1024 * 1024) {
                return res.status(400).json({ success: false, message: 'Uploaded CV exceeds the 1MB limit. Please upload a PDF under 1MB.' });
            }
            const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'resumes');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const uniqueFileName = `cv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeFileName}`;
            const filePath = path_1.default.join(uploadDir, uniqueFileName);
            fs_1.default.writeFileSync(filePath, buffer);
            resumeUrl = `/uploads/resumes/${uniqueFileName}`;
        }
        const normalizedEmail = email.trim().toLowerCase();
        let candidateUser = null;
        try {
            candidateUser = await mongodb_1.UserModel.findOne({ email: normalizedEmail }).lean();
        }
        catch (e) { }
        if (!candidateUser)
            candidateUser = store_1.dbStore.getUserByEmail(normalizedEmail);
        let candidateId = candidateUser?.id;
        if (!candidateUser) {
            candidateId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            candidateUser = {
                id: candidateId,
                email: normalizedEmail,
                passwordHash: 'UPLOADED_CANDIDATE_NO_PASSWORD',
                fullName: fullName.trim(),
                role: 'TEACHER',
                avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
                phone: phone || '',
            };
            try {
                await mongodb_1.UserModel.create(candidateUser);
            }
            catch (e) { }
            store_1.dbStore.users.push(candidateUser);
        }
        const candidateProfile = {
            userId: candidateId,
            headline: `${subject || job.subject} Teacher`,
            bio: `Candidate profile for ${fullName}`,
            experienceYears: Number(experienceYears) || 0,
            highestQualification: highestQualification || 'B.Ed / Graduate',
            subjects: [subject || job.subject],
            teachingLevels: [job.teachingLevel],
            boards: [job.board],
            currentCity: job.city,
            isWillingToRelocate: true,
            expectedSalaryLPA: job.minSalaryLPA || 5,
            skills: ['Classroom Teaching', 'Curriculum Planning', 'Student Mentoring'],
            certifications: [],
            resumeUrl: resumeUrl || candidateUser?.profile?.resumeUrl || '',
            resumeFileName: safeFileName,
            profileCompletionScore: 85,
        };
        try {
            await mongodb_1.TeacherProfileModel.findOneAndUpdate({ userId: candidateId }, { $set: candidateProfile }, { upsert: true, new: true });
        }
        catch (e) { }
        // Run ATS screening engine to score candidate against job rules with resume parsing
        const matchResult = await (0, screeningEngine_1.analyzeApplicationATS)(job, {
            fullName: candidateUser.fullName,
            profile: candidateProfile,
            resumeUrl: resumeUrl || candidateProfile.resumeUrl || '',
            resumeFileName: safeFileName,
        });
        const applicationId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newApp = {
            id: applicationId,
            jobId,
            teacherId: candidateId,
            resumeUrl: resumeUrl || candidateProfile.resumeUrl || '',
            resumeFileName: safeFileName,
            coverLetter: `Direct recruiter candidate upload for ${job.title}.`,
            stage: matchResult.overallScore >= 75 ? 'SHORTLISTED' : 'APPLIED',
            customAnswers: {},
            matchResult,
            recruiterNotes: 'CV added via Recruiter Resume Upload.',
            appliedAt: new Date(),
        };
        try {
            await mongodb_1.JobApplicationModel.create(newApp);
            await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: jobId }, { $inc: { totalApplicants: 1 } });
        }
        catch (e) { }
        store_1.dbStore.applications.unshift({
            ...newApp,
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        (0, auditLogger_1.logAuditEvent)(req, 'CANDIDATE_CV_UPLOADED', 'JobApplication', applicationId, {
            jobId,
            score: matchResult.overallScore,
        });
        return res.status(201).json({
            success: true,
            message: 'Candidate CV uploaded and ranked by ATS successfully!',
            application: {
                ...newApp,
                teacher: {
                    ...candidateUser,
                    profile: candidateProfile,
                },
                job: {
                    id: job.id,
                    title: job.title,
                    subject: job.subject,
                },
            },
        });
    }
    catch (err) {
        console.error('Candidate CV upload error:', err);
        return res.status(500).json({ success: false, message: 'Server error processing candidate CV upload.' });
    }
});
// GET /api/v1/applications/:id - Single application detail & View Profile data with role authorization
router.get('/:id', authMiddleware_1.authenticateJWT, async (req, res) => {
    try {
        let app = null;
        try {
            app = await mongodb_1.JobApplicationModel.findOne({ id: req.params.id }).lean();
        }
        catch (e) { }
        if (!app) {
            app = store_1.dbStore.applications.find(a => a.id === req.params.id);
        }
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        let job = null;
        try {
            job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
        }
        catch (e) { }
        if (!job)
            job = store_1.dbStore.getJobById(app.jobId);
        // Enforce role-based authorization: Candidates view only own; Employers view only own vacancies
        if (req.user.role === 'TEACHER' && app.teacherId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own submitted application.' });
        }
        if (req.user.role === 'EMPLOYER') {
            let employerInst = null;
            try {
                employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: req.user.id }).lean();
            }
            catch (e) { }
            if (!employerInst)
                employerInst = store_1.dbStore.institutions.find(i => i.ownerId === req.user.id);
            if (job && employerInst && job.institutionId !== employerInst.id) {
                return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to access candidate profiles for this vacancy.' });
            }
        }
        let user = null;
        try {
            user = await mongodb_1.UserModel.findOne({ id: app.teacherId }).lean();
        }
        catch (e) { }
        if (!user)
            user = store_1.dbStore.getUserById(app.teacherId);
        let profile = null;
        try {
            profile = await mongodb_1.TeacherProfileModel.findOne({ userId: app.teacherId }).lean();
        }
        catch (e) { }
        if (!profile)
            profile = store_1.dbStore.getProfileByUserId(app.teacherId);
        let institution = null;
        if (job) {
            try {
                institution = await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean();
            }
            catch (e) { }
            if (!institution)
                institution = store_1.dbStore.getInstitutionById(job.institutionId);
        }
        // Auto-update ATS score with real resume text if not yet scanned
        const effectiveResumeUrl = app.resumeUrl || profile?.resumeUrl;
        if (effectiveResumeUrl && (!app.matchResult?.parsedResume || app.matchResult?.overallScore === 78)) {
            try {
                const freshAts = await (0, screeningEngine_1.analyzeApplicationATS)(job, {
                    fullName: user?.fullName || 'Applicant',
                    profile,
                    resumeUrl: effectiveResumeUrl,
                    resumeFileName: app.resumeFileName || profile?.resumeFileName,
                }, app.customAnswers || {});
                app.matchResult = freshAts;
                await mongodb_1.JobApplicationModel.findOneAndUpdate({ id: app.id }, { $set: { matchResult: freshAts } });
                const memApp = store_1.dbStore.applications.find(a => a.id === app.id);
                if (memApp)
                    memApp.matchResult = freshAts;
            }
            catch (atsErr) {
                console.warn('Auto ATS rescan notice:', atsErr);
            }
        }
        return res.json({
            success: true,
            application: {
                ...app,
                teacher: user ? { ...user, profile } : undefined,
                job: job ? { ...job, institution } : undefined,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve application details.' });
    }
});
// POST /api/v1/applications/:id/rescan-ats - On-demand 1-click ATS scan & keyword extraction
router.post('/:id/rescan-ats', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    try {
        let app = null;
        try {
            app = await mongodb_1.JobApplicationModel.findOne({ id: req.params.id }).lean();
        }
        catch (e) { }
        if (!app)
            app = store_1.dbStore.applications.find(a => a.id === req.params.id);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        let job = null;
        try {
            job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
        }
        catch (e) { }
        if (!job)
            job = store_1.dbStore.getJobById(app.jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Associated vacancy not found.' });
        }
        let user = null;
        try {
            user = await mongodb_1.UserModel.findOne({ id: app.teacherId }).lean();
        }
        catch (e) { }
        if (!user)
            user = store_1.dbStore.getUserById(app.teacherId);
        let profile = null;
        try {
            profile = await mongodb_1.TeacherProfileModel.findOne({ userId: app.teacherId }).lean();
        }
        catch (e) { }
        if (!profile)
            profile = store_1.dbStore.getProfileByUserId(app.teacherId);
        const effectiveResumeUrl = app.resumeUrl || profile?.resumeUrl;
        const freshAts = await (0, screeningEngine_1.analyzeApplicationATS)(job, {
            fullName: user?.fullName || 'Applicant',
            profile,
            resumeUrl: effectiveResumeUrl,
            resumeFileName: app.resumeFileName || profile?.resumeFileName,
        }, app.customAnswers || {});
        await mongodb_1.JobApplicationModel.findOneAndUpdate({ id: app.id }, { $set: { matchResult: freshAts } });
        const memApp = store_1.dbStore.applications.find(a => a.id === app.id);
        if (memApp)
            memApp.matchResult = freshAts;
        return res.json({
            success: true,
            message: 'ATS score and keyword breakdown refreshed directly from resume document.',
            matchResult: freshAts,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to re-scan ATS score.' });
    }
});
// GET /api/v1/applications/:id/resume - Authorized CV/Resume document access
router.get('/:id/resume', authMiddleware_1.authenticateJWT, async (req, res) => {
    try {
        let app = null;
        try {
            app = await mongodb_1.JobApplicationModel.findOne({ id: req.params.id }).lean();
        }
        catch (e) { }
        if (!app)
            app = store_1.dbStore.applications.find(a => a.id === req.params.id);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        if (req.user.role === 'TEACHER' && app.teacherId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only access your own CV.' });
        }
        if (req.user.role === 'EMPLOYER') {
            let job = null;
            try {
                job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
            }
            catch (e) { }
            if (!job)
                job = store_1.dbStore.getJobById(app.jobId);
            let employerInst = null;
            try {
                employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: req.user.id }).lean();
            }
            catch (e) { }
            if (!employerInst)
                employerInst = store_1.dbStore.institutions.find(i => i.ownerId === req.user.id);
            if (job && employerInst && job.institutionId !== employerInst.id) {
                return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to access CV for this vacancy.' });
            }
        }
        return res.json({
            success: true,
            resumeUrl: app.resumeUrl || null,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to access resume document.' });
    }
});
// PATCH /api/v1/applications/:id/stage - Update recruitment stage in database with verification
router.patch('/:id/stage', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const { stage } = req.body;
    if (!stage) {
        return res.status(400).json({ success: false, message: 'Stage value is required.' });
    }
    // Normalize stage names
    let normalizedStage = stage;
    const stageUpper = String(stage).toUpperCase().trim();
    if (stageUpper === 'UNDER REVIEW' || stageUpper === 'UNDER_REVIEW' || stageUpper === 'SCREENING') {
        normalizedStage = 'SCREENING';
    }
    else if (stageUpper === 'SHORTLISTED') {
        normalizedStage = 'SHORTLISTED';
    }
    else if (stageUpper === 'INTERVIEW SCHEDULED' || stageUpper === 'INTERVIEW_SCHEDULED') {
        normalizedStage = 'INTERVIEW_SCHEDULED';
    }
    else if (stageUpper === 'SELECTED') {
        normalizedStage = 'SELECTED';
    }
    else if (stageUpper === 'REJECTED') {
        normalizedStage = 'REJECTED';
    }
    else if (stageUpper === 'APPLIED') {
        normalizedStage = 'APPLIED';
    }
    else if (stageUpper === 'ON HOLD' || stageUpper === 'ON_HOLD') {
        normalizedStage = 'ON_HOLD';
    }
    try {
        // 1. Locate existing application
        let targetApp = null;
        try {
            targetApp = await mongodb_1.JobApplicationModel.findOne({ id: req.params.id }).lean();
        }
        catch (e) { }
        if (!targetApp) {
            targetApp = store_1.dbStore.applications.find(a => a.id === req.params.id);
        }
        // 2. Authorization: Employer must own the vacancy
        if (req.user.role === 'EMPLOYER' && targetApp) {
            let job = null;
            try {
                job = await mongodb_1.JobVacancyModel.findOne({ id: targetApp.jobId }).lean();
            }
            catch (e) { }
            if (!job)
                job = store_1.dbStore.getJobById(targetApp.jobId);
            let employerInst = null;
            try {
                employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: req.user.id }).lean();
            }
            catch (e) { }
            if (!employerInst)
                employerInst = store_1.dbStore.institutions.find(i => i.ownerId === req.user.id);
            if (job && employerInst && job.institutionId !== employerInst.id) {
                return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to update applications for this vacancy.' });
            }
        }
        // 3. Update in MongoDB Atlas
        let updatedApp = null;
        try {
            updatedApp = await mongodb_1.JobApplicationModel.findOneAndUpdate({ id: req.params.id }, { $set: { stage: normalizedStage, updatedAt: new Date() } }, { new: true }).lean();
        }
        catch (e) { }
        // Update in memory store
        const app = store_1.dbStore.applications.find(a => a.id === req.params.id);
        if (app) {
            app.stage = normalizedStage;
            app.updatedAt = new Date().toISOString();
            if (!updatedApp)
                updatedApp = app;
        }
        if (!updatedApp) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'APPLICATION_STAGE_CHANGED', 'JobApplication', req.params.id, { stage: normalizedStage });
        return res.json({
            success: true,
            message: `Application stage changed to ${normalizedStage}.`,
            application: updatedApp,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update application stage.' });
    }
});
// PATCH /api/v1/applications/:id/notes - Add internal recruiter notes in database
router.patch('/:id/notes', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const { notes } = req.body;
    try {
        let updatedApp = null;
        try {
            updatedApp = await mongodb_1.JobApplicationModel.findOneAndUpdate({ id: req.params.id }, { $set: { recruiterNotes: notes, updatedAt: new Date() } }, { new: true }).lean();
        }
        catch (e) { }
        const app = store_1.dbStore.applications.find(a => a.id === req.params.id);
        if (app) {
            app.recruiterNotes = notes;
            app.updatedAt = new Date().toISOString();
            if (!updatedApp)
                updatedApp = app;
        }
        if (!updatedApp) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        return res.json({
            success: true,
            message: 'Recruiter notes saved successfully.',
            application: updatedApp,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to save notes.' });
    }
});
exports.default = router;
