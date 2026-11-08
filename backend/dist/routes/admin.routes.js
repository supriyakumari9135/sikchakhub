"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const store_1 = require("../db/store");
const mongodb_1 = require("../db/mongodb");
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditLogger_1 = require("../middleware/auditLogger");
const router = (0, express_1.Router)();
// =========================================================================
// 1. DASHBOARD OVERVIEW & COMPREHENSIVE KPIS
// =========================================================================
router.get('/kpis', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        let totalTeachers = 0;
        let totalEmployers = 0;
        let totalVerifiedInstitutions = 0;
        let pendingInstitutions = 0;
        let totalActiveVacancies = 0;
        let pendingJobApprovals = 0;
        let totalApplications = 0;
        let shortlistedCandidates = 0;
        let interviewsScheduled = 0;
        let selectedCandidates = 0;
        try {
            totalTeachers = await mongodb_1.UserModel.countDocuments({ role: 'TEACHER' });
            totalEmployers = await mongodb_1.UserModel.countDocuments({ role: 'EMPLOYER' });
            totalVerifiedInstitutions = await mongodb_1.InstitutionModel.countDocuments({ verificationStatus: 'VERIFIED' });
            pendingInstitutions = await mongodb_1.InstitutionModel.countDocuments({ verificationStatus: 'PENDING' });
            totalActiveVacancies = await mongodb_1.JobVacancyModel.countDocuments({ status: 'ACTIVE' });
            pendingJobApprovals = await mongodb_1.JobVacancyModel.countDocuments({ status: { $in: ['PENDING_APPROVAL', 'DRAFT'] } });
            totalApplications = await mongodb_1.JobApplicationModel.countDocuments();
            shortlistedCandidates = await mongodb_1.JobApplicationModel.countDocuments({ stage: 'SHORTLISTED' });
            interviewsScheduled = await mongodb_1.InterviewModel.countDocuments();
            selectedCandidates = await mongodb_1.JobApplicationModel.countDocuments({ stage: 'SELECTED' });
        }
        catch (e) {
            totalTeachers = store_1.dbStore.users.filter(u => u.role === 'TEACHER').length;
            totalEmployers = store_1.dbStore.users.filter(u => u.role === 'EMPLOYER').length;
            totalVerifiedInstitutions = store_1.dbStore.institutions.filter(i => i.verificationStatus === 'VERIFIED').length;
            pendingInstitutions = store_1.dbStore.institutions.filter(i => i.verificationStatus === 'PENDING').length;
            totalActiveVacancies = store_1.dbStore.jobs.filter(j => j.status === 'ACTIVE').length;
            pendingJobApprovals = store_1.dbStore.jobs.filter(j => j.status === 'PENDING_APPROVAL' || j.status === 'DRAFT').length;
            pendingJobApprovals = store_1.dbStore.jobs.filter(j => j.status === 'DRAFT').length;
            totalApplications = store_1.dbStore.applications.length;
            shortlistedCandidates = store_1.dbStore.applications.filter(a => a.stage === 'SHORTLISTED').length;
            interviewsScheduled = store_1.dbStore.interviews.length;
            selectedCandidates = store_1.dbStore.applications.filter(a => a.stage === 'SELECTED').length;
        }
        return res.json({
            success: true,
            kpis: {
                totalTeachers,
                totalEmployers,
                totalVerifiedInstitutions,
                pendingInstitutions,
                totalActiveVacancies,
                pendingJobApprovals,
                totalApplications,
                shortlistedCandidates,
                interviewsScheduled,
                selectedCandidates,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve admin KPIs' });
    }
});
// GET /api/v1/admin/analytics - Comprehensive growth & distribution statistics
router.get('/analytics', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        let jobs = [];
        let applications = [];
        let teachers = [];
        let institutions = [];
        try {
            jobs = await mongodb_1.JobVacancyModel.find().lean();
            applications = await mongodb_1.JobApplicationModel.find().lean();
            teachers = await mongodb_1.UserModel.find({ role: 'TEACHER' }).lean();
            institutions = await mongodb_1.InstitutionModel.find().lean();
        }
        catch (e) {
            jobs = store_1.dbStore.jobs;
            applications = store_1.dbStore.applications;
            teachers = store_1.dbStore.users.filter(u => u.role === 'TEACHER');
            institutions = store_1.dbStore.institutions;
        }
        // 1. Applications Stage Distribution Funnel
        const stageCounts = {
            APPLIED: 0,
            SCREENING: 0,
            SHORTLISTED: 0,
            INTERVIEW_SCHEDULED: 0,
            SELECTED: 0,
            REJECTED: 0,
        };
        applications.forEach(a => {
            if (stageCounts[a.stage] !== undefined) {
                stageCounts[a.stage]++;
            }
            else {
                stageCounts[a.stage] = 1;
            }
        });
        // 2. Jobs by Teaching Level
        const levelCounts = {};
        jobs.forEach(j => {
            levelCounts[j.teachingLevel] = (levelCounts[j.teachingLevel] || 0) + 1;
        });
        // 3. Applications by Subject
        const subjectCounts = {};
        applications.forEach(a => {
            const job = jobs.find(j => j.id === a.jobId) || store_1.dbStore.getJobById(a.jobId);
            const sub = job?.subject || 'Other Subject';
            subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
        });
        // 4. Recruitment by State / Major Cities
        const cityCounts = {};
        jobs.forEach(j => {
            const c = j.city || 'Other';
            cityCounts[c] = (cityCounts[c] || 0) + 1;
        });
        // 5. Institution Vacancy Statistics
        const instCounts = {};
        jobs.forEach(j => {
            const inst = institutions.find(i => i.id === j.institutionId);
            const name = inst?.name || 'Partner Academy';
            instCounts[name] = (instCounts[name] || 0) + 1;
        });
        return res.json({
            success: true,
            analytics: {
                stageFunnel: Object.entries(stageCounts).map(([stage, count]) => ({ stage, count })),
                jobsByLevel: Object.entries(levelCounts).map(([name, count]) => ({ name, count })),
                applicationsBySubject: Object.entries(subjectCounts).map(([name, count]) => ({ name, count })),
                topHiringCities: Object.entries(cityCounts).map(([name, count]) => ({ name, count })),
                institutionVacancies: Object.entries(instCounts).map(([name, count]) => ({ name, count })),
                totalVacancies: jobs.length,
                totalTeachers: teachers.length,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve analytics' });
    }
});
// GET /api/v1/admin/recent-activities - Live chronological activity stream
router.get('/recent-activities', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        let logs = [];
        try {
            logs = await mongodb_1.AuditLogModel.find().sort({ createdAt: -1 }).limit(25).lean();
            // If no explicit audit logs are recorded yet, synthesize live stream from real MongoDB events
            if (logs.length === 0) {
                const [recentApps, recentJobs, recentInsts, recentTeachers] = await Promise.all([
                    mongodb_1.JobApplicationModel.find().sort({ createdAt: -1 }).limit(10).lean(),
                    mongodb_1.JobVacancyModel.find().sort({ createdAt: -1 }).limit(10).lean(),
                    mongodb_1.InstitutionModel.find().sort({ createdAt: -1 }).limit(10).lean(),
                    mongodb_1.UserModel.find({ role: 'TEACHER' }).sort({ createdAt: -1 }).limit(10).lean(),
                ]);
                const syntheticActivities = [];
                await Promise.all(recentApps.map(async (app) => {
                    let candidateName = app.candidateName;
                    let jobTitle = app.jobTitle;
                    if (!candidateName) {
                        const user = await mongodb_1.UserModel.findOne({ id: app.teacherId }).lean();
                        candidateName = user?.fullName || 'Educator';
                    }
                    if (!jobTitle) {
                        const job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
                        jobTitle = job?.title || 'teaching vacancy';
                    }
                    syntheticActivities.push({
                        id: `act-${app.id}`,
                        action: 'APPLICATION_SUBMITTED',
                        userEmail: app.candidateEmail || 'Candidate',
                        resourceType: 'APPLICATION',
                        resourceId: app.id,
                        details: `${candidateName} submitted application for "${jobTitle}" (${app.stage})`,
                        createdAt: app.createdAt || app.appliedAt || new Date().toISOString(),
                    });
                }));
                recentJobs.forEach((job) => {
                    syntheticActivities.push({
                        id: `act-${job.id}`,
                        action: 'VACANCY_PUBLISHED',
                        userEmail: 'School Recruiter',
                        resourceType: 'JOB',
                        resourceId: job.id,
                        details: `Vacancy "${job.title}" published for ${job.subject} (${job.teachingLevel})`,
                        createdAt: job.createdAt || new Date().toISOString(),
                    });
                });
                recentInsts.forEach((inst) => {
                    syntheticActivities.push({
                        id: `act-${inst.id}`,
                        action: 'INSTITUTION_REGISTERED',
                        userEmail: inst.name,
                        resourceType: 'INSTITUTION',
                        resourceId: inst.id,
                        details: `Educational institution "${inst.name}" onboarded in ${inst.city || 'India'} (${inst.verificationStatus})`,
                        createdAt: inst.createdAt || new Date().toISOString(),
                    });
                });
                recentTeachers.forEach((teacher) => {
                    syntheticActivities.push({
                        id: `act-${teacher.id}`,
                        action: 'TEACHER_REGISTERED',
                        userEmail: teacher.email,
                        resourceType: 'TEACHER',
                        resourceId: teacher.id,
                        details: `Teacher ${teacher.fullName} registered on SikshaHub network`,
                        createdAt: teacher.createdAt || new Date().toISOString(),
                    });
                });
                syntheticActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                logs = syntheticActivities.slice(0, 25);
            }
        }
        catch (e) {
            logs = store_1.dbStore.auditLogs.slice(0, 25);
        }
        return res.json({
            success: true,
            activities: logs.map(l => ({
                id: l.id,
                action: l.action,
                userEmail: l.userEmail || 'System Operation',
                resourceType: l.resourceType || 'General',
                resourceId: l.resourceId,
                details: l.details,
                createdAt: l.createdAt,
            })),
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve recent activities' });
    }
});
// =========================================================================
// 2. TEACHER / JOB SEEKER MANAGEMENT
// =========================================================================
// GET /api/v1/admin/teachers - List educators with search & filters
router.get('/teachers', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { q, subject, qualification, status, page = 1, limit = 50 } = req.query;
    try {
        let teachers = [];
        try {
            const filter = { role: 'TEACHER' };
            if (status && status !== 'ALL') {
                filter.status = status;
            }
            if (q && typeof q === 'string') {
                filter.$or = [
                    { fullName: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } },
                    { phone: { $regex: q, $options: 'i' } },
                ];
            }
            teachers = await mongodb_1.UserModel.find(filter).sort({ createdAt: -1 }).lean();
        }
        catch (e) {
            teachers = store_1.dbStore.users.filter(u => u.role === 'TEACHER');
        }
        // Populate profile and applications count for each teacher
        const populated = await Promise.all(teachers.map(async (t) => {
            let profile = null;
            let appCount = 0;
            try {
                profile = await mongodb_1.TeacherProfileModel.findOne({ userId: t.id }).lean();
                appCount = await mongodb_1.JobApplicationModel.countDocuments({ teacherId: t.id });
            }
            catch (err) {
                profile = store_1.dbStore.getProfileByUserId(t.id);
                appCount = store_1.dbStore.getApplicationsByTeacherId(t.id).length;
            }
            return {
                id: t.id,
                fullName: t.fullName,
                email: t.email,
                phone: t.phone || profile?.phone || 'Not provided',
                age: t.age || profile?.age,
                avatarUrl: t.avatarUrl,
                status: t.status || 'ACTIVE',
                isVerified: t.isVerified ?? true,
                createdAt: t.createdAt,
                profile: profile ? {
                    highestQualification: profile.highestQualification,
                    subjects: profile.subjects || [],
                    experienceYears: profile.experienceYears ?? 0,
                    currentCity: profile.currentCity,
                    headline: profile.headline,
                    resumeUrl: profile.resumeUrl,
                    resumeFileName: profile.resumeFileName,
                    profileCompletionScore: profile.profileCompletionScore ?? 75,
                } : null,
                totalApplications: appCount,
            };
        }));
        // In-memory filter on populated fields if requested
        let result = populated;
        if (subject && subject !== 'ALL') {
            result = result.filter(t => t.profile?.subjects?.some((s) => s.toLowerCase() === String(subject).toLowerCase()));
        }
        if (qualification && qualification !== 'ALL') {
            result = result.filter(t => t.profile?.highestQualification?.toLowerCase().includes(String(qualification).toLowerCase()));
        }
        return res.json({
            success: true,
            total: result.length,
            teachers: result,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve teachers list' });
    }
});
// GET /api/v1/admin/teachers/:id - Complete teacher dossier & application history
router.get('/teachers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const user = await mongodb_1.UserModel.findOne({ id: req.params.id, role: 'TEACHER' }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'Teacher record not found' });
        }
        const profile = await mongodb_1.TeacherProfileModel.findOne({ userId: user.id }).lean();
        const applications = await mongodb_1.JobApplicationModel.find({ teacherId: user.id }).sort({ appliedAt: -1 }).lean();
        const enrichedApps = await Promise.all(applications.map(async (app) => {
            const job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
            const institution = job ? await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean() : null;
            return {
                ...app,
                jobTitle: job?.title || 'Teaching Vacancy',
                institutionName: institution?.name || 'Educational Institution',
                city: job?.city,
            };
        }));
        return res.json({
            success: true,
            teacher: {
                ...user,
                profile,
                applications: enrichedApps,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load teacher dossier' });
    }
});
// PATCH /api/v1/admin/teachers/:id - Edit teacher administrative details
router.patch('/teachers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { fullName, phone, age, status, isVerified, headline, highestQualification, currentCity, experienceYears } = req.body;
    try {
        const updatedUser = await mongodb_1.UserModel.findOneAndUpdate({ id: req.params.id }, { $set: { fullName, phone, age, status, isVerified } }, { new: true }).lean();
        if (headline !== undefined || highestQualification !== undefined || currentCity !== undefined || experienceYears !== undefined) {
            await mongodb_1.TeacherProfileModel.findOneAndUpdate({ userId: req.params.id }, { $set: { headline, highestQualification, currentCity, experienceYears: Number(experienceYears) || 0 } });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'TEACHER_ADMIN_UPDATED', 'User', req.params.id, { fullName, status });
        return res.json({
            success: true,
            message: 'Teacher profile administratively updated.',
            user: updatedUser,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update teacher profile' });
    }
});
// PATCH /api/v1/admin/teachers/:id/status - Activate / Suspend / Reactivate account
router.patch('/teachers/:id/status', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { status, reason } = req.body; // status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
    try {
        const user = await mongodb_1.UserModel.findOneAndUpdate({ id: req.params.id }, { $set: { status, updatedAt: new Date() } }, { new: true }).lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'Teacher record not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, `TEACHER_STATUS_${status}`, 'User', user.id, {
            previousStatus: user.status,
            newStatus: status,
            reason: reason || 'Administrative action',
        });
        return res.json({
            success: true,
            message: `Teacher account is now ${status}.`,
            user,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update teacher status' });
    }
});
// DELETE /api/v1/admin/teachers/:id - Controlled deletion / safe archival
router.delete('/teachers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const teacher = await mongodb_1.UserModel.findOne({ id: req.params.id }).lean();
        if (!teacher) {
            return res.status(404).json({ success: false, message: 'Teacher record not found.' });
        }
        // Safe archival: Mark as DEACTIVATED to preserve historical recruitment integrity
        await mongodb_1.UserModel.findOneAndUpdate({ id: req.params.id }, { $set: { status: 'DEACTIVATED' } });
        (0, auditLogger_1.logAuditEvent)(req, 'TEACHER_ARCHIVED', 'User', req.params.id, {
            email: teacher.email,
            name: teacher.fullName,
        });
        return res.json({
            success: true,
            message: 'Teacher record securely archived and deactivated from platform.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete/archive teacher' });
    }
});
// =========================================================================
// 3. EMPLOYER / INSTITUTION MANAGEMENT
// =========================================================================
// GET /api/v1/admin/employers - List all employers & institutions
router.get('/employers', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { q, type, verificationStatus, state } = req.query;
    try {
        let institutions = [];
        try {
            const filter = {};
            if (verificationStatus && verificationStatus !== 'ALL') {
                filter.verificationStatus = verificationStatus;
            }
            if (type && type !== 'ALL') {
                filter.type = type;
            }
            if (q && typeof q === 'string') {
                filter.$or = [
                    { name: { $regex: q, $options: 'i' } },
                    { city: { $regex: q, $options: 'i' } },
                    { state: { $regex: q, $options: 'i' } },
                ];
            }
            institutions = await mongodb_1.InstitutionModel.find(filter).sort({ createdAt: -1 }).lean();
        }
        catch (e) {
            institutions = store_1.dbStore.institutions;
        }
        // Populate owner details and total vacancies count
        const populated = await Promise.all(institutions.map(async (inst) => {
            let owner = null;
            let jobsCount = 0;
            let appsCount = 0;
            try {
                owner = await mongodb_1.UserModel.findOne({ id: inst.ownerId }).lean();
                jobsCount = await mongodb_1.JobVacancyModel.countDocuments({ institutionId: inst.id });
                const jobIds = (await mongodb_1.JobVacancyModel.find({ institutionId: inst.id }, 'id').lean()).map(j => j.id);
                appsCount = await mongodb_1.JobApplicationModel.countDocuments({ jobId: { $in: jobIds } });
            }
            catch (err) {
                owner = store_1.dbStore.getUserById(inst.ownerId);
                jobsCount = store_1.dbStore.jobs.filter(j => j.institutionId === inst.id).length;
            }
            return {
                ...inst,
                ownerName: owner?.fullName || 'Institutional Representative',
                ownerEmail: owner?.email || 'email not listed',
                ownerPhone: owner?.phone || 'phone not listed',
                ownerStatus: owner?.status || 'ACTIVE',
                totalJobs: jobsCount,
                totalApplicationsReceived: appsCount,
            };
        }));
        return res.json({
            success: true,
            total: populated.length,
            employers: populated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve employers' });
    }
});
// GET /api/v1/admin/employers/:id - Full institution dossier & vacancy list
router.get('/employers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const inst = await mongodb_1.InstitutionModel.findOne({ id: req.params.id }).lean();
        if (!inst) {
            return res.status(404).json({ success: false, message: 'Institution record not found' });
        }
        const owner = await mongodb_1.UserModel.findOne({ id: inst.ownerId }).lean();
        const jobs = await mongodb_1.JobVacancyModel.find({ institutionId: inst.id }).sort({ createdAt: -1 }).lean();
        return res.json({
            success: true,
            institution: {
                ...inst,
                owner,
                jobs,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve institution dossier' });
    }
});
// PATCH /api/v1/admin/employers/:id - Update institution details
router.patch('/employers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { name, type, website, description, affiliationNumber, address, city, state, pincode } = req.body;
    try {
        const updated = await mongodb_1.InstitutionModel.findOneAndUpdate({ id: req.params.id }, { $set: { name, type, website, description, affiliationNumber, address, city, state, pincode, updatedAt: new Date() } }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'INSTITUTION_ADMIN_UPDATED', 'Institution', req.params.id, { name, city, state });
        return res.json({
            success: true,
            message: 'Institution profile updated successfully.',
            institution: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update institution' });
    }
});
// PATCH /api/v1/admin/employers/:id/status - Suspend / Reactivate institution
router.patch('/employers/:id/status', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { verificationStatus, reason } = req.body; // 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED'
    try {
        const inst = await mongodb_1.InstitutionModel.findOneAndUpdate({ id: req.params.id }, { $set: { verificationStatus, verificationNotes: reason || '', updatedAt: new Date() } }, { new: true }).lean();
        if (!inst) {
            return res.status(404).json({ success: false, message: 'Institution record not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, `INSTITUTION_STATUS_${verificationStatus}`, 'Institution', inst.id, {
            status: verificationStatus,
            reason,
        });
        return res.json({
            success: true,
            message: `Institution status updated to ${verificationStatus}.`,
            institution: inst,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});
// POST /api/v1/admin/verify-institution - Approve / Reject institution
router.post('/verify-institution', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { institutionId, status, notes } = req.body; // status: 'VERIFIED' | 'REJECTED'
    try {
        const inst = await mongodb_1.InstitutionModel.findOneAndUpdate({ id: institutionId }, { $set: { verificationStatus: status, verificationNotes: notes || '', updatedAt: new Date() } }, { new: true }).lean();
        if (!inst) {
            return res.status(404).json({ success: false, message: 'Institution record not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, `INSTITUTION_${status}`, 'Institution', inst.id, {
            institutionName: inst.name,
            decision: status,
            notes,
        });
        return res.json({
            success: true,
            message: `Institution verification status updated to ${status}.`,
            institution: inst,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to verify institution' });
    }
});
// DELETE /api/v1/admin/employers/:id - Controlled deletion / suspension
router.delete('/employers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const inst = await mongodb_1.InstitutionModel.findOneAndUpdate({ id: req.params.id }, { $set: { verificationStatus: 'SUSPENDED' } }, { new: true });
        (0, auditLogger_1.logAuditEvent)(req, 'INSTITUTION_SUSPENDED', 'Institution', req.params.id, { name: inst?.name });
        return res.json({
            success: true,
            message: 'Institution suspended and withdrawn from public recruitment listings.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to suspend institution' });
    }
});
// =========================================================================
// 4. JOB POSTING MANAGEMENT
// =========================================================================
// GET /api/v1/admin/jobs - List all vacancies across institutions
router.get('/jobs', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { q, subject, teachingLevel, city, status } = req.query;
    try {
        let jobs = [];
        try {
            const filter = {};
            if (status && status !== 'ALL') {
                filter.status = status;
            }
            if (subject && subject !== 'ALL') {
                filter.subject = subject;
            }
            if (teachingLevel && teachingLevel !== 'ALL') {
                filter.teachingLevel = teachingLevel;
            }
            if (q && typeof q === 'string') {
                filter.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { subject: { $regex: q, $options: 'i' } },
                    { city: { $regex: q, $options: 'i' } },
                ];
            }
            jobs = await mongodb_1.JobVacancyModel.find(filter).sort({ createdAt: -1 }).lean();
        }
        catch (e) {
            jobs = store_1.dbStore.jobs;
        }
        const populated = await Promise.all(jobs.map(async (job) => {
            let institution = null;
            let totalApplicants = job.totalApplicants || 0;
            try {
                institution = await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean();
                if (!totalApplicants) {
                    totalApplicants = await mongodb_1.JobApplicationModel.countDocuments({ jobId: job.id });
                }
            }
            catch (e) {
                institution = store_1.dbStore.getInstitutionById(job.institutionId);
            }
            return {
                ...job,
                institutionName: institution?.name || 'Educational Institution',
                institutionLogo: institution?.logoUrl || '/logo.jpeg',
                totalApplicants,
            };
        }));
        return res.json({
            success: true,
            total: populated.length,
            jobs: populated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
    }
});
// PATCH /api/v1/admin/jobs/:id - Edit job administrative details
router.patch('/jobs/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { title, subject, teachingLevel, minSalaryLPA, maxSalaryLPA, deadline, vacanciesCount, status } = req.body;
    try {
        const updated = await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: req.params.id }, { $set: { title, subject, teachingLevel, minSalaryLPA, maxSalaryLPA, deadline, vacanciesCount, status, updatedAt: new Date() } }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'JOB_ADMIN_MODERATED', 'JobVacancy', req.params.id, { title, status });
        return res.json({
            success: true,
            message: 'Job posting moderated and saved.',
            job: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update job' });
    }
});
// PATCH /api/v1/admin/jobs/:id/status - Toggle status (ACTIVE / PAUSED / CLOSED / REJECTED)
router.patch('/jobs/:id/status', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { status, reason } = req.body;
    try {
        const updated = await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: req.params.id }, { $set: { status, updatedAt: new Date() } }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, `JOB_STATUS_${status}`, 'JobVacancy', req.params.id, { status, reason });
        return res.json({
            success: true,
            message: `Vacancy status changed to ${status}.`,
            job: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to change job status' });
    }
});
// DELETE /api/v1/admin/jobs/:id - Remove policy-violating vacancy
router.delete('/jobs/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        await mongodb_1.JobVacancyModel.findOneAndUpdate({ id: req.params.id }, { $set: { status: 'CLOSED' } });
        (0, auditLogger_1.logAuditEvent)(req, 'JOB_REMOVED', 'JobVacancy', req.params.id, { reason: 'Policy violation' });
        return res.json({
            success: true,
            message: 'Vacancy closed and removed from active public listings.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to remove job' });
    }
});
// =========================================================================
// 5. APPLICATION MANAGEMENT & CANDIDATE DOSSIERS
// =========================================================================
// GET /api/v1/admin/applications - Monitor all platform job applications
router.get('/applications', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { q, stage, jobId } = req.query;
    try {
        let apps = [];
        try {
            const filter = {};
            if (stage && stage !== 'ALL') {
                filter.stage = stage;
            }
            if (jobId && jobId !== 'ALL') {
                filter.jobId = jobId;
            }
            apps = await mongodb_1.JobApplicationModel.find(filter).sort({ appliedAt: -1 }).lean();
        }
        catch (e) {
            apps = store_1.dbStore.applications;
        }
        const populated = await Promise.all(apps.map(async (app) => {
            let teacher = null;
            let job = null;
            let institution = null;
            try {
                teacher = await mongodb_1.UserModel.findOne({ id: app.teacherId }).lean();
                job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
                if (job) {
                    institution = await mongodb_1.InstitutionModel.findOne({ id: job.institutionId }).lean();
                }
            }
            catch (e) { }
            return {
                id: app.id,
                candidateName: teacher?.fullName || 'Educator Applicant',
                candidateEmail: teacher?.email,
                candidatePhone: teacher?.phone,
                jobTitle: job?.title || 'Teaching Vacancy',
                institutionName: institution?.name || 'Educational Institution',
                subject: job?.subject || 'Teaching',
                stage: app.stage,
                score: app.matchResult?.overallScore || 75,
                appliedAt: app.appliedAt,
                resumeUrl: app.resumeUrl,
                resumeFileName: app.resumeFileName || 'Resume.pdf',
            };
        }));
        return res.json({
            success: true,
            total: populated.length,
            applications: populated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load applications' });
    }
});
// PATCH /api/v1/admin/applications/:id/stage - Exceptional stage correction with reason
router.patch('/applications/:id/stage', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { stage, reason } = req.body;
    if (!reason) {
        return res.status(400).json({ success: false, message: 'Administrative reason is required for exceptional stage corrections.' });
    }
    try {
        const updated = await mongodb_1.JobApplicationModel.findOneAndUpdate({ id: req.params.id }, { $set: { stage, updatedAt: new Date() } }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'APPLICATION_STAGE_CORRECTED', 'JobApplication', req.params.id, {
            newStage: stage,
            reason,
        });
        return res.json({
            success: true,
            message: `Application stage administratively updated to ${stage}.`,
            application: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update application stage' });
    }
});
// =========================================================================
// 6. CV & DOCUMENT MANAGEMENT
// =========================================================================
// GET /api/v1/admin/documents - List verified candidate CV files
router.get('/documents', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const apps = await mongodb_1.JobApplicationModel.find({ resumeUrl: { $exists: true, $ne: '' } }).sort({ appliedAt: -1 }).lean();
        const profiles = await mongodb_1.TeacherProfileModel.find({ resumeUrl: { $exists: true, $ne: '' } }).sort({ updatedAt: -1 }).lean();
        const appDocs = await Promise.all(apps.map(async (app) => {
            const teacher = await mongodb_1.UserModel.findOne({ id: app.teacherId }).lean();
            const job = await mongodb_1.JobVacancyModel.findOne({ id: app.jobId }).lean();
            return {
                id: app.id,
                applicationId: app.id,
                candidateName: teacher?.fullName || 'Educator Applicant',
                candidateEmail: teacher?.email,
                fileName: app.resumeFileName || 'Educator_Resume.pdf',
                fileUrl: app.resumeUrl,
                jobTitle: job?.title || 'General Vacancy',
                uploadedAt: app.appliedAt,
                atsScore: app.matchResult?.overallScore || 70,
                parsedDegree: app.matchResult?.parsedResume?.degree || 'Verified Degree',
            };
        }));
        // Also include teachers who uploaded a CV to their profile but may not have applied yet
        const existingUrls = new Set(appDocs.map(d => d.fileUrl));
        const profileDocs = [];
        for (const prof of profiles) {
            if (prof.resumeUrl && !existingUrls.has(prof.resumeUrl)) {
                existingUrls.add(prof.resumeUrl);
                const teacher = await mongodb_1.UserModel.findOne({ id: prof.userId }).lean();
                profileDocs.push({
                    id: `cv-prof-${prof.id || prof.userId}`,
                    applicationId: null,
                    candidateName: teacher?.fullName || 'Educator Profile',
                    candidateEmail: teacher?.email,
                    fileName: prof.resumeFileName || 'Educator_CV.pdf',
                    fileUrl: prof.resumeUrl,
                    jobTitle: prof.headline || 'Profile CV',
                    uploadedAt: prof.updatedAt || new Date(),
                    atsScore: prof.profileCompletionScore || 85,
                    parsedDegree: prof.highestQualification || 'Verified Degree',
                });
            }
        }
        const allDocs = [...appDocs, ...profileDocs];
        return res.json({
            success: true,
            total: allDocs.length,
            documents: allDocs,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load documents' });
    }
});
// =========================================================================
// 7. CATEGORY AND MASTER DATA MANAGEMENT
// =========================================================================
// GET /api/v1/admin/master-data - Fetch platform categories
router.get('/master-data', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { category } = req.query;
    try {
        const filter = {};
        if (category) {
            filter.category = category;
        }
        const items = await mongodb_1.MasterDataModel.find(filter).sort({ category: 1, order: 1 }).lean();
        return res.json({
            success: true,
            items,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve master data' });
    }
});
// POST /api/v1/admin/master-data - Add new master category entry
router.post('/master-data', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { category, label, value, order } = req.body;
    if (!category || !label || !value) {
        return res.status(400).json({ success: false, message: 'Category, label, and value are required.' });
    }
    try {
        const newItem = {
            id: `md-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            category,
            label,
            value,
            isActive: true,
            order: Number(order) || 0,
        };
        await mongodb_1.MasterDataModel.create(newItem);
        (0, auditLogger_1.logAuditEvent)(req, 'MASTER_DATA_CREATED', 'MasterData', newItem.id, { category, label, value });
        return res.status(201).json({
            success: true,
            message: `New ${category} "${label}" added to platform.`,
            item: newItem,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to create master data item' });
    }
});
// PATCH /api/v1/admin/master-data/:id - Edit item / toggle active
router.patch('/master-data/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { label, value, isActive, order } = req.body;
    try {
        const updated = await mongodb_1.MasterDataModel.findOneAndUpdate({ id: req.params.id }, { $set: { label, value, isActive, order } }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'MASTER_DATA_UPDATED', 'MasterData', req.params.id, { label, isActive });
        return res.json({
            success: true,
            message: 'Master data option updated.',
            item: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update master data' });
    }
});
// DELETE /api/v1/admin/master-data/:id - Safe deletion (toggle deactivation)
router.delete('/master-data/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        await mongodb_1.MasterDataModel.findOneAndUpdate({ id: req.params.id }, { $set: { isActive: false } });
        (0, auditLogger_1.logAuditEvent)(req, 'MASTER_DATA_DEACTIVATED', 'MasterData', req.params.id, {});
        return res.json({
            success: true,
            message: 'Master data option deactivated to preserve historical consistency.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to deactivate master data' });
    }
});
// =========================================================================
// 8. USER REPORTS & CONTENT MODERATION
// =========================================================================
// GET /api/v1/admin/reports - Queue of reported content
router.get('/reports', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const reports = await mongodb_1.UserReportModel.find().sort({ createdAt: -1 }).lean();
        return res.json({
            success: true,
            total: reports.length,
            reports,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve reports' });
    }
});
// POST /api/v1/admin/reports - File a moderation report
router.post('/reports', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { targetType, targetId, targetTitle, reason, details } = req.body;
    try {
        const report = {
            id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            reporterEmail: req.user?.email || 'anonymous@platform',
            targetType,
            targetId,
            targetTitle: targetTitle || targetId,
            reason,
            details,
            status: 'PENDING',
        };
        await mongodb_1.UserReportModel.create(report);
        (0, auditLogger_1.logAuditEvent)(req, 'CONTENT_REPORTED', 'UserReport', report.id, { targetType, targetId, reason });
        return res.status(201).json({
            success: true,
            message: 'Report submitted for administrator review.',
            report,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to file report' });
    }
});
// PATCH /api/v1/admin/reports/:id - Resolve or dismiss report
router.patch('/reports/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { status, resolutionNotes } = req.body; // 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
    try {
        const updated = await mongodb_1.UserReportModel.findOneAndUpdate({ id: req.params.id }, { $set: { status, resolutionNotes, resolvedBy: req.user?.email } }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, `REPORT_${status}`, 'UserReport', req.params.id, { status, resolutionNotes });
        return res.json({
            success: true,
            message: `Report marked as ${status}.`,
            report: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update report' });
    }
});
// =========================================================================
// 9. PLATFORM NOTIFICATIONS MANAGEMENT
// =========================================================================
// GET /api/v1/admin/notifications - Broadcast history
router.get('/notifications', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const notifications = await mongodb_1.PlatformNotificationModel.find().sort({ createdAt: -1 }).lean();
        return res.json({
            success: true,
            notifications,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load notifications' });
    }
});
// POST /api/v1/admin/notifications - Send platform announcement
router.post('/notifications', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { title, message, targetAudience = 'ALL', type = 'ANNOUNCEMENT', priority = 'MEDIUM' } = req.body;
    if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }
    try {
        const newNotif = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title,
            message,
            targetAudience,
            type,
            priority,
            sentBy: req.user?.fullName || req.user?.email || 'Super Admin',
            status: 'SENT',
        };
        await mongodb_1.PlatformNotificationModel.create(newNotif);
        (0, auditLogger_1.logAuditEvent)(req, 'BROADCAST_NOTIFICATION_SENT', 'PlatformNotification', newNotif.id, { title, targetAudience });
        return res.status(201).json({
            success: true,
            message: `Platform announcement broadcast to ${targetAudience}.`,
            notification: newNotif,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to broadcast notification' });
    }
});
// =========================================================================
// 10. ADMIN USERS & PERMISSION MANAGEMENT
// =========================================================================
// GET /api/v1/admin/staff - List administrative staff members
router.get('/staff', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const admins = await mongodb_1.UserModel.find({ role: 'ADMIN' }).select('-passwordHash').sort({ createdAt: -1 }).lean();
        return res.json({
            success: true,
            staff: admins,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve admin staff' });
    }
});
// POST /api/v1/admin/staff - Add new administrator staff member
router.post('/staff', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { fullName, email, password, adminRole = 'ADMIN', adminPermissions = ['VIEW', 'EDIT'] } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    try {
        const existing = await mongodb_1.UserModel.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
        }
        const passwordHash = bcryptjs_1.default.hashSync(password, 10);
        const newStaff = {
            id: `admin-${Date.now()}`,
            email: email.trim().toLowerCase(),
            passwordHash,
            fullName,
            role: 'ADMIN',
            adminRole,
            adminPermissions,
            phone: req.body.phone || '',
            isVerified: true,
            status: 'ACTIVE',
        };
        await mongodb_1.UserModel.create(newStaff);
        (0, auditLogger_1.logAuditEvent)(req, 'ADMIN_STAFF_CREATED', 'User', newStaff.id, { email, adminRole });
        return res.status(201).json({
            success: true,
            message: `Administrator "${fullName}" provisioned with ${adminRole} privileges.`,
            staff: {
                id: newStaff.id,
                email: newStaff.email,
                fullName: newStaff.fullName,
                role: newStaff.role,
                adminRole: newStaff.adminRole,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to create admin staff' });
    }
});
// PATCH /api/v1/admin/staff/:id - Update admin permissions or status
router.patch('/staff/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { adminRole, adminPermissions, status } = req.body;
    try {
        const updated = await mongodb_1.UserModel.findOneAndUpdate({ id: req.params.id, role: 'ADMIN' }, { $set: { adminRole, adminPermissions, status, updatedAt: new Date() } }, { new: true }).select('-passwordHash').lean();
        (0, auditLogger_1.logAuditEvent)(req, 'ADMIN_PERMISSIONS_UPDATED', 'User', req.params.id, { adminRole, status });
        return res.json({
            success: true,
            message: 'Administrator staff permissions updated.',
            staff: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update admin permissions' });
    }
});
// =========================================================================
// 11. PLATFORM SETTINGS
// =========================================================================
// GET /api/v1/admin/settings - Read global platform configuration
router.get('/settings', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const settings = await mongodb_1.PlatformSettingModel.find().lean();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        return res.json({
            success: true,
            settings: settingsMap,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve platform settings' });
    }
});
// PUT /api/v1/admin/settings - Save global platform configuration
router.put('/settings', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const updates = req.body; // Key-value map
    try {
        for (const [key, value] of Object.entries(updates)) {
            await mongodb_1.PlatformSettingModel.findOneAndUpdate({ key }, { $set: { value, updatedBy: req.user?.email } }, { upsert: true, new: true });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'PLATFORM_SETTINGS_SAVED', 'PlatformSetting', 'global', updates);
        return res.json({
            success: true,
            message: 'Platform configuration updated successfully.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to save settings' });
    }
});
// =========================================================================
// 12. AUDIT LOGS
// =========================================================================
router.get('/audit-logs', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        let logs = [];
        try {
            logs = await mongodb_1.AuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
        }
        catch (e) {
            logs = store_1.dbStore.auditLogs;
        }
        return res.json({
            success: true,
            total: logs.length,
            logs,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
    }
});
// =========================================================================
// 13. DATA EXPORTS (CSV / REPORTS)
// =========================================================================
router.get('/export/:type', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { type } = req.params;
    try {
        let csvData = '';
        const now = new Date().toISOString();
        if (type === 'teachers') {
            const teachers = await mongodb_1.UserModel.find({ role: 'TEACHER' }).lean();
            csvData = 'ID,Full Name,Email,Phone,Status,Registration Date\n' +
                teachers.map(t => `"${t.id}","${t.fullName}","${t.email}","${t.phone || ''}","${t.status || 'ACTIVE'}","${t.createdAt}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=teachers_report_${Date.now()}.csv`);
            return res.send(csvData);
        }
        if (type === 'employers') {
            const institutions = await mongodb_1.InstitutionModel.find().lean();
            csvData = 'ID,Institution Name,Type,City,State,Verification Status,Affiliation\n' +
                institutions.map(i => `"${i.id}","${i.name}","${i.type}","${i.city}","${i.state}","${i.verificationStatus}","${i.affiliationNumber || ''}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=institutions_report_${Date.now()}.csv`);
            return res.send(csvData);
        }
        if (type === 'jobs') {
            const jobs = await mongodb_1.JobVacancyModel.find().lean();
            csvData = 'ID,Title,Subject,Level,City,Min Salary,Max Salary,Status,Total Applicants\n' +
                jobs.map(j => `"${j.id}","${j.title}","${j.subject}","${j.teachingLevel}","${j.city}","${j.minSalaryLPA}","${j.maxSalaryLPA}","${j.status}","${j.totalApplicants || 0}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=jobs_report_${Date.now()}.csv`);
            return res.send(csvData);
        }
        if (type === 'applications') {
            const apps = await mongodb_1.JobApplicationModel.find().lean();
            csvData = 'ID,Job ID,Teacher ID,Stage,ATS Score,Applied Date\n' +
                apps.map((a) => `"${a.id}","${a.jobId}","${a.teacherId}","${a.stage}","${a.matchResult?.overallScore || 0}","${a.appliedAt}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=applications_report_${Date.now()}.csv`);
            return res.send(csvData);
        }
        if (type === 'audit-logs' || type === 'audit') {
            const logs = await mongodb_1.AuditLogModel.find().lean();
            csvData = 'ID,Action,User Email,Resource Type,Resource ID,Details,Timestamp\n' +
                logs.map((l) => `"${l.id}","${l.action}","${l.userEmail || ''}","${l.resourceType || ''}","${l.resourceId || ''}","${(l.details || '').replace(/"/g, '""')}","${l.createdAt}"`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=audit_logs_report_${Date.now()}.csv`);
            return res.send(csvData);
        }
        return res.status(400).json({ success: false, message: 'Invalid export type requested' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Export generation failed' });
    }
});
exports.default = router;
