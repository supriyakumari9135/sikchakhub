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
const fcmService_1 = require("../services/fcmService");
const router = (0, express_1.Router)();
// =========================================================================
// 1. DASHBOARD OVERVIEW & COMPREHENSIVE KPIS
// =========================================================================
router.get('/kpis', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
router.get('/analytics', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
router.get('/recent-activities', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
                        details: `Teacher ${teacher.fullName} registered on SikchaKhub network`,
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
router.get('/teachers', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
        // Batch resolve teacher profiles and applications count in O(1) queries (Eliminates N+1 bottleneck)
        const teacherIds = teachers.map((t) => t.id);
        let profilesList = [];
        try {
            profilesList = await mongodb_1.TeacherProfileModel.find({ userId: { $in: teacherIds } }).lean();
        }
        catch (e) { }
        const profilesMap = new Map();
        profilesList.forEach(p => profilesMap.set(p.userId, p));
        const appCountMap = new Map();
        try {
            const counts = await mongodb_1.JobApplicationModel.aggregate([
                { $match: { teacherId: { $in: teacherIds } } },
                { $group: { _id: '$teacherId', count: { $sum: 1 } } }
            ]);
            counts.forEach((c) => appCountMap.set(c._id, c.count));
        }
        catch (e) { }
        const populated = teachers.map((t) => {
            let profile = profilesMap.get(t.id);
            if (!profile)
                profile = store_1.dbStore.getProfileByUserId(t.id);
            let appCount = appCountMap.get(t.id) || 0;
            if (appCount === 0 && store_1.dbStore.applications.length > 0) {
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
        });
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
router.get('/teachers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
router.get('/employers', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
                ownerName: inst.contactPerson || owner?.fullName || 'Institutional Representative',
                ownerEmail: inst.email || owner?.email || 'email not listed',
                ownerPhone: inst.phone || owner?.phone || 'phone not listed',
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
router.get('/employers/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
    const { name, type, website, description, affiliationNumber, address, city, state, pincode, contactPerson, phone, email, board, udiseCode, registrationNumber } = req.body;
    try {
        const updated = await mongodb_1.InstitutionModel.findOneAndUpdate({ id: req.params.id }, {
            $set: {
                name, type, website, description, affiliationNumber, address, city, state, pincode,
                contactPerson, phone, email, board, udiseCode, registrationNumber,
                updatedAt: new Date()
            }
        }, { new: true }).lean();
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
router.get('/jobs', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
        // Batch resolve institutions and application counts in O(1) queries (Eliminates N+1 bottleneck)
        const uniqueInstIds = Array.from(new Set(jobs.map((j) => j.institutionId).filter(Boolean)));
        const allJobIds = jobs.map((j) => j.id);
        let institutionsList = [];
        try {
            institutionsList = await mongodb_1.InstitutionModel.find({ id: { $in: uniqueInstIds } }).lean();
        }
        catch (e) { }
        const instMap = new Map();
        institutionsList.forEach(inst => instMap.set(inst.id, inst));
        const appCountMap = new Map();
        try {
            const counts = await mongodb_1.JobApplicationModel.aggregate([
                { $match: { jobId: { $in: allJobIds } } },
                { $group: { _id: '$jobId', count: { $sum: 1 } } }
            ]);
            counts.forEach((c) => appCountMap.set(c._id, c.count));
        }
        catch (e) { }
        const populated = jobs.map((job) => {
            let institution = instMap.get(job.institutionId);
            if (!institution)
                institution = store_1.dbStore.getInstitutionById(job.institutionId);
            let totalApplicants = job.totalApplicants || appCountMap.get(job.id) || 0;
            if (totalApplicants === 0 && store_1.dbStore.applications.length > 0) {
                totalApplicants = store_1.dbStore.applications.filter(a => a.jobId === job.id).length;
            }
            return {
                ...job,
                institutionName: institution?.name || 'Educational Institution',
                institutionLogo: institution?.logoUrl || '/logo.jpeg',
                totalApplicants,
            };
        });
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
router.get('/applications', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
        // Batch resolve teachers, jobs, and institutions in O(1) queries (Eliminates N+1 bottleneck)
        const teacherIds = Array.from(new Set(apps.map((a) => a.teacherId).filter(Boolean)));
        const jobIds = Array.from(new Set(apps.map((a) => a.jobId).filter(Boolean)));
        let teachersList = [];
        try {
            teachersList = await mongodb_1.UserModel.find({ id: { $in: teacherIds } }).lean();
        }
        catch (e) { }
        const teachersMap = new Map();
        teachersList.forEach(t => teachersMap.set(t.id, t));
        let jobsList = [];
        try {
            jobsList = await mongodb_1.JobVacancyModel.find({ id: { $in: jobIds } }).lean();
        }
        catch (e) { }
        const jobsMap = new Map();
        jobsList.forEach(j => jobsMap.set(j.id, j));
        const instIds = Array.from(new Set(jobsList.map(j => j.institutionId).filter(Boolean)));
        let institutionsList = [];
        try {
            institutionsList = await mongodb_1.InstitutionModel.find({ id: { $in: instIds } }).lean();
        }
        catch (e) { }
        const instMap = new Map();
        institutionsList.forEach(i => instMap.set(i.id, i));
        const populated = apps.map((app) => {
            let teacher = teachersMap.get(app.teacherId);
            if (!teacher)
                teacher = store_1.dbStore.getUserById(app.teacherId);
            let job = jobsMap.get(app.jobId);
            if (!job)
                job = store_1.dbStore.getJobById(app.jobId);
            let institution = null;
            if (job) {
                institution = instMap.get(job.institutionId);
                if (!institution)
                    institution = store_1.dbStore.getInstitutionById(job.institutionId);
            }
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
        });
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
router.patch('/applications/:id/stage', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
router.get('/documents', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
router.get('/master-data', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
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
// GET /api/v1/admin/notifications - Broadcast history with delivery statistics
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
// GET /api/v1/admin/notifications/stats - Notification KPIs & FCM status
router.get('/notifications/stats', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const totalBroadcasts = await mongodb_1.PlatformNotificationModel.countDocuments();
        const notifications = await mongodb_1.PlatformNotificationModel.find().lean();
        let totalAudienceReached = 0;
        let totalDelivered = 0;
        let totalFailed = 0;
        notifications.forEach((n) => {
            totalAudienceReached += (n.totalMatchedAudience || 0);
            totalDelivered += (n.successDeliveries || 0);
            totalFailed += (n.failedDeliveries || 0);
        });
        const activeTokensCount = await mongodb_1.DeviceTokenModel.countDocuments({ isActive: true });
        const isFcmActive = fcmService_1.fcmService.isFcmActive();
        return res.json({
            success: true,
            stats: {
                totalBroadcasts,
                totalAudienceReached,
                totalDelivered,
                totalFailed,
                activeTokensCount,
                isFcmActive,
                fcmMode: isFcmActive ? 'FCM_CLOUD_GATEWAY' : 'SMART_PUSH_HYBRID_INBOX',
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load notification stats' });
    }
});
// POST /api/v1/admin/notifications/target-count - Live audience estimator based on smart filters
router.post('/notifications/target-count', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const filters = req.body.filters || {};
        const result = await fcmService_1.fcmService.findEligibleJobSeekers(filters);
        return res.json({
            success: true,
            totalMatchedAudience: result.totalMatchedCount,
            tokenCount: result.tokenCount,
            sampleMatches: result.matchedProfiles.slice(0, 5).map(p => ({
                id: p.id,
                userId: p.userId,
                headline: p.headline,
                currentCity: p.currentCity,
                experienceYears: p.experienceYears,
                expectedSalaryLPA: p.expectedSalaryLPA,
                subjects: p.subjects,
                teachingLevels: p.teachingLevels,
            })),
        });
    }
    catch (err) {
        console.error('Target count calculation error:', err);
        return res.status(500).json({ success: false, message: 'Failed to calculate target audience.' });
    }
});
// POST /api/v1/admin/notifications/send-smart-push - Dispatch Smart Push Notification via FCM
router.post('/notifications/send-smart-push', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { title, message, actionUrl, filters = {}, priority = 'HIGH', targetAudience = 'TEACHERS' } = req.body;
    if (!title?.trim() || !message?.trim()) {
        return res.status(400).json({ success: false, message: 'Notification title and message are required.' });
    }
    try {
        const result = await fcmService_1.fcmService.dispatchNotification({
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl?.trim() || '/teacher-dashboard',
            priority,
            filters,
            sentBy: req.user?.fullName || req.user?.email || 'Super Admin',
            targetAudience,
        });
        (0, auditLogger_1.logAuditEvent)(req, 'SMART_PUSH_DISPATCHED', 'PlatformNotification', result.notification.id, {
            title,
            targetAudience,
            audienceCount: result.audienceCount,
            tokensCount: result.tokensCount,
            successDeliveries: result.successDeliveries,
            failedDeliveries: result.failedDeliveries,
            filters,
        });
        return res.status(201).json({
            success: true,
            message: `Notification successfully dispatched to ${result.audienceCount} matched educators (${result.successDeliveries} delivered).`,
            notification: result.notification,
            delivery: {
                audienceCount: result.audienceCount,
                tokensCount: result.tokensCount,
                successDeliveries: result.successDeliveries,
                failedDeliveries: result.failedDeliveries,
                fcmSent: result.fcmSent,
            },
        });
    }
    catch (err) {
        console.error('Smart push dispatch error:', err);
        return res.status(500).json({ success: false, message: 'Failed to dispatch smart push notification.' });
    }
});
// POST /api/v1/admin/notifications - Legacy broadcast alias routed to Smart Push
router.post('/notifications', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { title, message, targetAudience = 'ALL', actionUrl, filters } = req.body;
    if (!title?.trim() || !message?.trim()) {
        return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }
    try {
        const result = await fcmService_1.fcmService.dispatchNotification({
            title: title.trim(),
            message: message.trim(),
            actionUrl: actionUrl || (targetAudience === 'EMPLOYERS' ? '/employer-dashboard' : '/teacher-dashboard'),
            targetAudience,
            filters: filters || {},
            sentBy: req.user?.fullName || 'Super Admin',
        });
        return res.status(201).json({
            success: true,
            message: `Announcement broadcast to ${result.audienceCount} users.`,
            notification: result.notification,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
    }
});
// DELETE /api/v1/admin/notifications/:id - Remove notification from history
router.delete('/notifications/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const deleted = await mongodb_1.PlatformNotificationModel.findOneAndDelete({ id: req.params.id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Notification record not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'NOTIFICATION_DELETED', 'PlatformNotification', req.params.id);
        return res.json({ success: true, message: 'Notification record removed from history.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete notification record.' });
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
// =========================================================================
// 14. HR RECRUITMENT & CANDIDATE SHORTLISTING MODULE
// =========================================================================
// POST /api/v1/admin/cv-screening - Advanced multi-filter candidate & CV screening for HR/Admin
router.post('/cv-screening', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const { q, state, city, minSalaryLPA, maxSalaryLPA, teachingLevels, subjects, qualification, minExperience, maxExperience, boardExperience, certifications, languages, joiningAvailability } = req.body;
        // Fetch teachers with profiles
        const teachers = await mongodb_1.UserModel.find({ role: 'TEACHER', status: { $ne: 'DEACTIVATED' } }).lean();
        const profiles = await mongodb_1.TeacherProfileModel.find().lean();
        const profileMap = new Map();
        profiles.forEach((p) => profileMap.set(p.userId, p));
        // Also get candidate groups to know which groups each candidate belongs to
        const groups = await mongodb_1.CandidateGroupModel.find({ status: 'ACTIVE' }).lean();
        const results = teachers.map((teacher) => {
            const prof = profileMap.get(teacher.id) || {};
            const candidateGroups = groups.filter((g) => g.candidateIds?.includes(teacher.id)).map((g) => ({
                id: g.id,
                name: g.name,
            }));
            return {
                id: teacher.id,
                fullName: teacher.fullName,
                email: teacher.email,
                phone: teacher.phone || prof.phone || '',
                avatarUrl: teacher.avatarUrl,
                headline: prof.headline || 'Teaching Professional',
                currentCity: prof.currentCity || teacher.city || '',
                state: teacher.state || prof.preferredStates?.[0] || '',
                preferredCities: prof.preferredCities || [],
                experienceYears: prof.experienceYears ?? 0,
                expectedSalaryLPA: prof.expectedSalaryLPA ?? 0,
                highestQualification: prof.highestQualification || 'Graduate',
                teachingLevels: prof.teachingLevels || [],
                subjects: prof.subjects || [],
                boardExperience: prof.boardExperience || [],
                certifications: prof.certifications || [],
                languages: prof.languages || [],
                joiningAvailability: prof.joiningAvailability || 'Immediate',
                previousSchool: prof.previousSchool || '',
                skills: prof.skills || [],
                resumeUrl: prof.resumeUrl || '',
                resumeFileName: prof.resumeFileName || '',
                profileCompletionScore: prof.profileCompletionScore || 75,
                registeredAt: teacher.createdAt,
                groups: candidateGroups,
            };
        }).filter((cand) => {
            // 1. Text Search query
            if (q && typeof q === 'string' && q.trim()) {
                const query = q.trim().toLowerCase();
                const matchesQ = cand.fullName.toLowerCase().includes(query) ||
                    cand.email.toLowerCase().includes(query) ||
                    cand.phone.toLowerCase().includes(query) ||
                    cand.headline.toLowerCase().includes(query) ||
                    cand.subjects.some((s) => s.toLowerCase().includes(query));
                if (!matchesQ)
                    return false;
            }
            // 2. Location: State
            if (state && state !== 'ALL') {
                const stateLower = state.toLowerCase();
                const matchState = (cand.state && cand.state.toLowerCase().includes(stateLower)) ||
                    cand.preferredCities.some((c) => c.toLowerCase().includes(stateLower));
                if (!matchState)
                    return false;
            }
            // 3. Location: City
            if (city && typeof city === 'string' && city.trim()) {
                const cityLower = city.trim().toLowerCase();
                const matchCity = (cand.currentCity && cand.currentCity.toLowerCase().includes(cityLower)) ||
                    cand.preferredCities.some((c) => c.toLowerCase().includes(cityLower));
                if (!matchCity)
                    return false;
            }
            // 4. Expected Salary
            if (minSalaryLPA !== undefined && minSalaryLPA !== null && minSalaryLPA !== '') {
                const minLpa = Number(minSalaryLPA);
                if (!isNaN(minLpa) && minLpa > 0 && cand.expectedSalaryLPA < minLpa)
                    return false;
            }
            if (maxSalaryLPA !== undefined && maxSalaryLPA !== null && maxSalaryLPA !== '') {
                const maxLpa = Number(maxSalaryLPA);
                if (!isNaN(maxLpa) && maxLpa > 0 && cand.expectedSalaryLPA > maxLpa)
                    return false;
            }
            // 5. Teaching Level
            if (Array.isArray(teachingLevels) && teachingLevels.length > 0) {
                const hasLevel = teachingLevels.some(lvl => cand.teachingLevels.some((cl) => cl.toUpperCase() === lvl.toUpperCase()));
                if (!hasLevel)
                    return false;
            }
            // 6. Subject
            if (Array.isArray(subjects) && subjects.length > 0) {
                const hasSub = subjects.some(sub => cand.subjects.some((cs) => cs.toLowerCase().includes(sub.toLowerCase())));
                if (!hasSub)
                    return false;
            }
            // 7. Qualification
            if (qualification && typeof qualification === 'string' && qualification.trim()) {
                const qLower = qualification.trim().toLowerCase();
                if (!cand.highestQualification.toLowerCase().includes(qLower))
                    return false;
            }
            // 8. Experience
            if (minExperience !== undefined && minExperience !== null && minExperience !== '') {
                const minExp = Number(minExperience);
                if (!isNaN(minExp) && cand.experienceYears < minExp)
                    return false;
            }
            if (maxExperience !== undefined && maxExperience !== null && maxExperience !== '') {
                const maxExp = Number(maxExperience);
                if (!isNaN(maxExp) && cand.experienceYears > maxExp)
                    return false;
            }
            // 9. Board Experience
            if (Array.isArray(boardExperience) && boardExperience.length > 0) {
                const hasBoard = boardExperience.some(b => cand.boardExperience.some((cb) => cb.toLowerCase().includes(b.toLowerCase())));
                if (!hasBoard)
                    return false;
            }
            // 10. Certifications
            if (Array.isArray(certifications) && certifications.length > 0) {
                const hasCert = certifications.some(cert => cand.certifications.some((cc) => cc.toLowerCase().includes(cert.toLowerCase())));
                if (!hasCert)
                    return false;
            }
            // 11. Languages
            if (Array.isArray(languages) && languages.length > 0) {
                const hasLang = languages.some(l => cand.languages.some((cl) => cl.toLowerCase().includes(l.toLowerCase())));
                if (!hasLang)
                    return false;
            }
            // 12. Availability
            if (joiningAvailability && joiningAvailability !== 'ALL') {
                if (!cand.joiningAvailability.toLowerCase().includes(joiningAvailability.toLowerCase()))
                    return false;
            }
            return true;
        });
        (0, auditLogger_1.logAuditEvent)(req, 'HR_CV_SCREENING', 'TeacherProfile', 'SEARCH', {
            matchesFound: results.length,
            filters: req.body
        });
        return res.json({
            success: true,
            totalMatches: results.length,
            candidates: results,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'CV Screening search failed' });
    }
});
// GET /api/v1/admin/candidate-groups - List all shortlisted candidate groups
router.get('/candidate-groups', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const groups = await mongodb_1.CandidateGroupModel.find().sort({ createdAt: -1 }).lean();
        // Enrich groups with candidate details
        const allCandidateIds = Array.from(new Set(groups.flatMap((g) => g.candidateIds || [])));
        const teachers = await mongodb_1.UserModel.find({ id: { $in: allCandidateIds } }).lean();
        const profiles = await mongodb_1.TeacherProfileModel.find({ userId: { $in: allCandidateIds } }).lean();
        const teacherMap = new Map();
        teachers.forEach((t) => teacherMap.set(t.id, t));
        profiles.forEach((p) => {
            const existing = teacherMap.get(p.userId) || {};
            teacherMap.set(p.userId, { ...existing, profile: p });
        });
        const enrichedGroups = groups.map((g) => {
            const groupCandidates = (g.candidateIds || []).map((cid) => {
                const cand = teacherMap.get(cid);
                return {
                    id: cid,
                    fullName: cand?.fullName || 'Educator',
                    email: cand?.email || '',
                    phone: cand?.phone || '',
                    currentCity: cand?.profile?.currentCity || cand?.city || '',
                    highestQualification: cand?.profile?.highestQualification || '',
                    experienceYears: cand?.profile?.experienceYears ?? 0,
                    expectedSalaryLPA: cand?.profile?.expectedSalaryLPA ?? 0,
                    subjects: cand?.profile?.subjects || [],
                    teachingLevels: cand?.profile?.teachingLevels || [],
                    resumeUrl: cand?.profile?.resumeUrl || '',
                    resumeFileName: cand?.profile?.resumeFileName || '',
                };
            });
            return {
                ...g,
                candidatesCount: (g.candidateIds || []).length,
                candidates: groupCandidates,
            };
        });
        return res.json({
            success: true,
            total: enrichedGroups.length,
            groups: enrichedGroups,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve candidate groups' });
    }
});
// POST /api/v1/admin/candidate-groups - Create named candidate group
router.post('/candidate-groups', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    const { name, description, targetVacancyId, targetVacancyTitle, targetSubject, targetLevel, targetLocation, candidateIds = [], notes, tags = [] } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Group name is required (e.g., "PGT Physics – Delhi Vacancy").' });
    }
    try {
        const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newGroup = {
            id: groupId,
            name: name.trim(),
            description: description?.trim() || '',
            targetVacancyId: targetVacancyId || '',
            targetVacancyTitle: targetVacancyTitle?.trim() || '',
            targetSubject: targetSubject?.trim() || '',
            targetLevel: targetLevel?.trim() || '',
            targetLocation: targetLocation?.trim() || '',
            candidateIds: Array.isArray(candidateIds) ? candidateIds : [],
            notes: notes?.trim() || '',
            status: 'ACTIVE',
            createdBy: req.user.id,
            createdByName: req.user.fullName || 'HR Recruiter',
            createdByRole: req.user.role,
            tags: Array.isArray(tags) ? tags : [],
        };
        await mongodb_1.CandidateGroupModel.create(newGroup);
        (0, auditLogger_1.logAuditEvent)(req, 'HR_GROUP_CREATED', 'CandidateGroup', groupId, {
            name: newGroup.name,
            candidatesCount: newGroup.candidateIds.length,
            createdByName: newGroup.createdByName,
            createdByRole: newGroup.createdByRole,
        });
        return res.status(201).json({
            success: true,
            message: `Candidate group "${name}" created successfully with ${newGroup.candidateIds.length} candidate(s).`,
            group: newGroup,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to create candidate group' });
    }
});
// GET /api/v1/admin/candidate-groups/:id - View full group dossier
router.get('/candidate-groups/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const group = await mongodb_1.CandidateGroupModel.findOne({ id: req.params.id }).lean();
        if (!group) {
            return res.status(404).json({ success: false, message: 'Candidate group not found' });
        }
        const teachers = await mongodb_1.UserModel.find({ id: { $in: group.candidateIds || [] } }).lean();
        const profiles = await mongodb_1.TeacherProfileModel.find({ userId: { $in: group.candidateIds || [] } }).lean();
        const profileMap = new Map();
        profiles.forEach((p) => profileMap.set(p.userId, p));
        const enrichedCandidates = teachers.map((t) => {
            const p = profileMap.get(t.id) || {};
            return {
                id: t.id,
                fullName: t.fullName,
                email: t.email,
                phone: t.phone || '',
                currentCity: p.currentCity || t.city || '',
                highestQualification: p.highestQualification || '',
                experienceYears: p.experienceYears ?? 0,
                expectedSalaryLPA: p.expectedSalaryLPA ?? 0,
                teachingLevels: p.teachingLevels || [],
                subjects: p.subjects || [],
                boardExperience: p.boardExperience || [],
                certifications: p.certifications || [],
                languages: p.languages || [],
                joiningAvailability: p.joiningAvailability || 'Immediate',
                previousSchool: p.previousSchool || '',
                resumeUrl: p.resumeUrl || '',
                resumeFileName: p.resumeFileName || '',
                profileCompletionScore: p.profileCompletionScore || 80,
            };
        });
        return res.json({
            success: true,
            group: {
                ...group,
                candidates: enrichedCandidates,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to load group details' });
    }
});
// PATCH /api/v1/admin/candidate-groups/:id - Modify group & add/remove candidates
router.patch('/candidate-groups/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    const { name, notes, status, targetVacancyTitle, targetLocation, addCandidateIds, removeCandidateId } = req.body;
    try {
        const group = await mongodb_1.CandidateGroupModel.findOne({ id: req.params.id });
        if (!group) {
            return res.status(404).json({ success: false, message: 'Candidate group not found' });
        }
        if (name)
            group.name = name.trim();
        if (notes !== undefined)
            group.notes = notes.trim();
        if (status)
            group.status = status;
        if (targetVacancyTitle !== undefined)
            group.targetVacancyTitle = targetVacancyTitle.trim();
        if (targetLocation !== undefined)
            group.targetLocation = targetLocation.trim();
        if (Array.isArray(addCandidateIds) && addCandidateIds.length > 0) {
            const currentSet = new Set(group.candidateIds || []);
            addCandidateIds.forEach((id) => currentSet.add(id));
            group.candidateIds = Array.from(currentSet);
            (0, auditLogger_1.logAuditEvent)(req, 'HR_GROUP_CANDIDATE_ADDED', 'CandidateGroup', group.id, { addedIds: addCandidateIds });
        }
        if (removeCandidateId) {
            group.candidateIds = (group.candidateIds || []).filter((id) => id !== removeCandidateId);
            (0, auditLogger_1.logAuditEvent)(req, 'HR_GROUP_CANDIDATE_REMOVED', 'CandidateGroup', group.id, { removedId: removeCandidateId });
        }
        group.updatedAt = new Date();
        await group.save();
        return res.json({
            success: true,
            message: 'Candidate group updated successfully.',
            group,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update candidate group' });
    }
});
// DELETE /api/v1/admin/candidate-groups/:id - Remove candidate group
router.delete('/candidate-groups/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const deleted = await mongodb_1.CandidateGroupModel.findOneAndDelete({ id: req.params.id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Candidate group not found' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'HR_GROUP_DELETED', 'CandidateGroup', req.params.id, { name: deleted.name });
        return res.json({
            success: true,
            message: `Candidate group "${deleted.name}" removed successfully.`,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete candidate group' });
    }
});
// GET /api/v1/admin/candidate-groups/:id/export - Export shortlisted candidates to CSV
router.get('/candidate-groups/:id/export', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const group = await mongodb_1.CandidateGroupModel.findOne({ id: req.params.id }).lean();
        if (!group) {
            return res.status(404).json({ success: false, message: 'Candidate group not found' });
        }
        const teachers = await mongodb_1.UserModel.find({ id: { $in: group.candidateIds || [] } }).lean();
        const profiles = await mongodb_1.TeacherProfileModel.find({ userId: { $in: group.candidateIds || [] } }).lean();
        const profileMap = new Map();
        profiles.forEach((p) => profileMap.set(p.userId, p));
        const csvRows = [
            'Candidate Name,Email,Phone,Current City,Highest Qualification,Experience (Years),Expected Salary (LPA),Teaching Subjects,Teaching Levels,Board Experience,Certifications,Availability,CV File URL'
        ];
        teachers.forEach((t) => {
            const p = profileMap.get(t.id) || {};
            const subjectsStr = (p.subjects || []).join('; ');
            const levelsStr = (p.teachingLevels || []).join('; ');
            const boardsStr = (p.boardExperience || []).join('; ');
            const certsStr = (p.certifications || []).join('; ');
            const resumeUrl = p.resumeUrl ? `https://sikchakhub.ai${p.resumeUrl}` : 'No CV uploaded';
            csvRows.push(`"${t.fullName}","${t.email}","${t.phone || ''}","${p.currentCity || t.city || ''}","${p.highestQualification || ''}","${p.experienceYears || 0}","${p.expectedSalaryLPA || 0}","${subjectsStr}","${levelsStr}","${boardsStr}","${certsStr}","${p.joiningAvailability || 'Immediate'}","${resumeUrl}"`);
        });
        (0, auditLogger_1.logAuditEvent)(req, 'HR_GROUP_EXPORTED', 'CandidateGroup', group.id, {
            groupName: group.name,
            candidatesCount: teachers.length,
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="Shortlist_${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.csv"`);
        return res.send(csvRows.join('\n'));
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Export failed' });
    }
});
// POST /api/v1/admin/log-cv-view - Log authorized CV review for compliance
router.post('/log-cv-view', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    const { candidateId, candidateName, fileName } = req.body;
    try {
        (0, auditLogger_1.logAuditEvent)(req, 'HR_CV_VIEWED', 'TeacherProfile', candidateId || 'UNKNOWN', {
            candidateName,
            fileName,
            viewedByRole: req.user.role,
            viewedByName: req.user.fullName,
        });
        return res.json({ success: true });
    }
    catch (err) {
        return res.json({ success: true });
    }
});
// =========================================================================
// 15. HR ACCOUNTS MANAGEMENT (SUPER ADMIN GOVERNANCE)
// =========================================================================
// GET /api/v1/admin/hr-accounts - List all HR recruiter accounts
router.get('/hr-accounts', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const hrUsers = await mongodb_1.UserModel.find({
            $or: [{ role: 'HR' }, { adminRole: 'HR' }]
        }).select('-passwordHash').sort({ createdAt: -1 }).lean();
        const groups = await mongodb_1.CandidateGroupModel.find().lean();
        const enriched = hrUsers.map((hr) => {
            const hrGroups = groups.filter((g) => g.createdBy === hr.id);
            return {
                ...hr,
                createdGroupsCount: hrGroups.length,
            };
        });
        return res.json({
            success: true,
            total: enriched.length,
            hrAccounts: enriched,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve HR accounts' });
    }
});
// POST /api/v1/admin/hr-accounts - Super Admin provisions new HR Recruiter
router.post('/hr-accounts', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await mongodb_1.UserModel.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
        }
        const passwordHash = bcryptjs_1.default.hashSync(password, 10);
        const newHr = {
            id: `hr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            email: normalizedEmail,
            passwordHash,
            fullName: fullName.trim(),
            role: 'HR',
            adminRole: 'HR',
            adminPermissions: ['CANDIDATE_SCREENING', 'SHORTLISTING', 'VIEW_RECORDS'],
            phone: phone?.trim() || '',
            status: 'ACTIVE',
            isVerified: true,
        };
        await mongodb_1.UserModel.create(newHr);
        (0, auditLogger_1.logAuditEvent)(req, 'HR_ACCOUNT_CREATED', 'User', newHr.id, { email: normalizedEmail, fullName });
        return res.status(201).json({
            success: true,
            message: `HR recruiter account for "${fullName}" registered successfully.`,
            hrAccount: {
                id: newHr.id,
                email: newHr.email,
                fullName: newHr.fullName,
                role: newHr.role,
                adminRole: newHr.adminRole,
                phone: newHr.phone,
                status: newHr.status,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to create HR account' });
    }
});
// PATCH /api/v1/admin/hr-accounts/:id/status - Activate/Deactivate/Suspend HR account
router.patch('/hr-accounts/:id/status', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { status } = req.body;
    if (!['ACTIVE', 'DEACTIVATED', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    try {
        const updated = await mongodb_1.UserModel.findOneAndUpdate({ id: req.params.id, $or: [{ role: 'HR' }, { adminRole: 'HR' }] }, { $set: { status, updatedAt: new Date() } }, { new: true }).select('-passwordHash').lean();
        if (!updated) {
            return res.status(404).json({ success: false, message: 'HR account not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'HR_ACCOUNT_STATUS_CHANGED', 'User', req.params.id, { status });
        return res.json({
            success: true,
            message: `HR account marked as ${status}.`,
            hrAccount: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update HR status' });
    }
});
// DELETE /api/v1/admin/hr-accounts/:id - Remove HR account
router.delete('/hr-accounts/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const deleted = await mongodb_1.UserModel.findOneAndDelete({
            id: req.params.id,
            $or: [{ role: 'HR' }, { adminRole: 'HR' }]
        });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'HR account not found' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'HR_ACCOUNT_DELETED', 'User', req.params.id, { email: deleted.email });
        return res.json({
            success: true,
            message: `HR account "${deleted.fullName}" removed.`,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete HR account' });
    }
});
// =========================================================================
// SUBSCRIPTION & ACCESS MANAGEMENT (SUPER ADMIN)
// =========================================================================
// GET /api/v1/admin/subscriptions/summary - Overview KPI statistics
router.get('/subscriptions/summary', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (_req, res) => {
    try {
        const totalPosters = await mongodb_1.UserModel.countDocuments({ role: 'EMPLOYER' });
        const globalFreeLimit = await (0, mongodb_1.getGlobalFreeApplicantLimit)();
        let allSubscriptions = [];
        try {
            allSubscriptions = await mongodb_1.SubscriptionModel.find().lean();
        }
        catch (e) {
            allSubscriptions = store_1.dbStore.subscriptions;
        }
        let premiumActiveCount = 0;
        let freeTierCount = 0;
        let totalRevenue = 0;
        allSubscriptions.forEach(sub => {
            if (sub.hasUnlimitedAccess === true && sub.status === 'ACTIVE') {
                premiumActiveCount++;
            }
            else {
                freeTierCount++;
            }
        });
        // Calculate posters without a subscription record yet as Free tier
        if (totalPosters > (premiumActiveCount + freeTierCount)) {
            freeTierCount += (totalPosters - (premiumActiveCount + freeTierCount));
        }
        try {
            const payments = await mongodb_1.PaymentRecordModel.find({ status: 'SUCCESS' }).lean();
            totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        }
        catch (e) {
            totalRevenue = store_1.dbStore.payments
                .filter(p => p.status === 'SUCCESS')
                .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        }
        return res.json({
            success: true,
            summary: {
                totalPosters,
                premiumActiveCount,
                freeTierCount,
                totalRevenue,
                globalFreeLimit,
            }
        });
    }
    catch (err) {
        console.error('Subscription summary fetch error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve subscription summary.' });
    }
});
// GET /api/v1/admin/subscriptions/posters - List all job posters with subscription status & applicant access counts
router.get('/subscriptions/posters', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const { q, plan, status } = req.query;
        const globalFreeLimit = await (0, mongodb_1.getGlobalFreeApplicantLimit)();
        // 1. Fetch all employers
        let employers = [];
        try {
            employers = await mongodb_1.UserModel.find({ role: 'EMPLOYER' }).sort({ createdAt: -1 }).lean();
        }
        catch (e) {
            employers = store_1.dbStore.users.filter(u => u.role === 'EMPLOYER');
        }
        // 2. Fetch institutions
        let institutions = [];
        try {
            institutions = await mongodb_1.InstitutionModel.find().lean();
        }
        catch (e) {
            institutions = store_1.dbStore.institutions;
        }
        const instMap = new Map();
        institutions.forEach(inst => instMap.set(inst.ownerId, inst));
        // 3. For each employer, construct subscription & access profile
        const posterList = await Promise.all(employers.map(async (emp) => {
            const inst = instMap.get(emp.id);
            const sub = await (0, mongodb_1.getOrInitEmployerSubscription)(emp.id, inst?.id);
            let jobsCount = 0;
            let totalApplicants = 0;
            let targetJobIds = [];
            if (inst) {
                try {
                    const jobs = await mongodb_1.JobVacancyModel.find({ institutionId: inst.id }).select('id').lean();
                    jobsCount = jobs.length;
                    targetJobIds = jobs.map(j => j.id);
                }
                catch (e) {
                    const jobs = store_1.dbStore.jobs.filter(j => j.institutionId === inst.id);
                    jobsCount = jobs.length;
                    targetJobIds = jobs.map(j => j.id);
                }
                if (targetJobIds.length > 0) {
                    try {
                        totalApplicants = await mongodb_1.JobApplicationModel.countDocuments({ jobId: { $in: targetJobIds } });
                    }
                    catch (e) {
                        totalApplicants = store_1.dbStore.applications.filter(a => targetJobIds.includes(a.jobId)).length;
                    }
                }
            }
            const isUnlimited = sub.hasUnlimitedAccess === true && sub.status === 'ACTIVE';
            const freeLimit = sub.freeLimitPerJob || globalFreeLimit;
            const accessibleApplicants = isUnlimited ? 'Unlimited (All)' : `${freeLimit} per vacancy`;
            return {
                id: emp.id,
                fullName: emp.fullName,
                email: emp.email,
                phone: emp.phone || 'N/A',
                userStatus: emp.status,
                institutionName: inst?.name || 'Institution Pending',
                institutionCity: inst?.city || 'N/A',
                institutionVerified: inst?.verificationStatus === 'VERIFIED',
                jobsCount,
                totalApplicants,
                subscription: {
                    id: sub.id,
                    plan: sub.plan,
                    status: sub.status,
                    freeLimitPerJob: freeLimit,
                    hasUnlimitedAccess: isUnlimited,
                    startDate: sub.startDate,
                    endDate: sub.endDate,
                    amountPaid: sub.amountPaid,
                    paymentStatus: sub.paymentStatus,
                    lastPaymentId: sub.lastPaymentId,
                    grantedByAdmin: sub.grantedByAdmin,
                    adminNotes: sub.adminNotes,
                    accessibleApplicants,
                }
            };
        }));
        // 4. Apply filtering
        let filtered = posterList;
        if (q && typeof q === 'string') {
            const query = q.toLowerCase();
            filtered = filtered.filter(p => p.fullName?.toLowerCase().includes(query) ||
                p.email?.toLowerCase().includes(query) ||
                p.institutionName?.toLowerCase().includes(query) ||
                p.phone?.toLowerCase().includes(query));
        }
        if (plan && plan !== 'ALL') {
            filtered = filtered.filter(p => p.subscription.plan === plan);
        }
        if (status && status !== 'ALL') {
            if (status === 'PREMIUM_ACTIVE') {
                filtered = filtered.filter(p => p.subscription.hasUnlimitedAccess === true);
            }
            else if (status === 'FREE') {
                filtered = filtered.filter(p => !p.subscription.hasUnlimitedAccess);
            }
            else {
                filtered = filtered.filter(p => p.subscription.status === status);
            }
        }
        return res.json({
            success: true,
            total: filtered.length,
            posters: filtered,
        });
    }
    catch (err) {
        console.error('Fetch posters subscriptions error:', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve job poster subscriptions.' });
    }
});
// PATCH /api/v1/admin/subscriptions/:userId/grant-access - Manually grant or revoke full application access
router.patch('/subscriptions/:userId/grant-access', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { userId } = req.params;
    const { hasUnlimitedAccess, adminNotes } = req.body;
    if (typeof hasUnlimitedAccess !== 'boolean') {
        return res.status(400).json({ success: false, message: 'hasUnlimitedAccess (boolean) is required.' });
    }
    try {
        const user = await mongodb_1.UserModel.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Job poster user not found.' });
        }
        const newPlan = hasUnlimitedAccess ? 'CUSTOM_ADMIN' : 'FREE';
        const newStatus = 'ACTIVE';
        const now = new Date();
        const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        const updateDoc = {
            plan: newPlan,
            status: newStatus,
            hasUnlimitedAccess,
            grantedByAdmin: hasUnlimitedAccess,
            startDate: now.toISOString(),
            endDate: hasUnlimitedAccess ? expiry.toISOString() : new Date(now.getTime() + 10 * 365 * 24 * 3600 * 1000).toISOString(),
            adminNotes: adminNotes || (hasUnlimitedAccess ? 'Full access granted by Super Admin' : 'Full access revoked by Super Admin'),
            paymentStatus: hasUnlimitedAccess ? 'PAID' : 'N/A',
        };
        let updatedSub = await mongodb_1.SubscriptionModel.findOneAndUpdate({ userId }, {
            $set: updateDoc,
            $setOnInsert: { id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, userId }
        }, { new: true, upsert: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, hasUnlimitedAccess ? 'ADMIN_ACCESS_GRANTED' : 'ADMIN_ACCESS_REVOKED', 'Subscription', updatedSub?.id || userId, {
            userId,
            userEmail: user.email,
            hasUnlimitedAccess,
            adminNotes,
        });
        return res.json({
            success: true,
            message: hasUnlimitedAccess
                ? `Full application access granted to ${user.fullName}. All candidates unlocked.`
                : `Full application access revoked for ${user.fullName}. Reverted to Free tier.`,
            subscription: updatedSub,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update access permissions.' });
    }
});
// PATCH /api/v1/admin/subscriptions/:userId/plan - Upgrade or downgrade a Job Poster's plan
router.patch('/subscriptions/:userId/plan', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { userId } = req.params;
    const { plan, durationDays, adminNotes } = req.body;
    if (!plan || !['FREE', 'PRO_MONTHLY', 'ANNUAL_ENTERPRISE', 'CUSTOM_ADMIN'].includes(plan)) {
        return res.status(400).json({ success: false, message: 'Valid plan (FREE, PRO_MONTHLY, ANNUAL_ENTERPRISE, CUSTOM_ADMIN) is required.' });
    }
    try {
        const user = await mongodb_1.UserModel.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Job poster not found.' });
        }
        const hasUnlimitedAccess = plan !== 'FREE';
        const days = durationDays || (plan === 'ANNUAL_ENTERPRISE' ? 365 : (plan === 'PRO_MONTHLY' ? 30 : 365));
        const now = new Date();
        const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const updateDoc = {
            plan,
            status: 'ACTIVE',
            hasUnlimitedAccess,
            grantedByAdmin: true,
            startDate: now.toISOString(),
            endDate: hasUnlimitedAccess ? expiry.toISOString() : new Date(now.getTime() + 10 * 365 * 24 * 3600 * 1000).toISOString(),
            adminNotes: adminNotes || `Plan modified to ${plan} by Admin`,
            paymentStatus: hasUnlimitedAccess ? 'PAID' : 'N/A',
        };
        const updatedSub = await mongodb_1.SubscriptionModel.findOneAndUpdate({ userId }, {
            $set: updateDoc,
            $setOnInsert: { id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, userId }
        }, { new: true, upsert: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'ADMIN_SUBSCRIPTION_PLAN_CHANGED', 'Subscription', updatedSub?.id || userId, {
            userId,
            userEmail: user.email,
            plan,
            adminNotes,
        });
        return res.json({
            success: true,
            message: `Job poster ${user.fullName} successfully updated to ${plan}.`,
            subscription: updatedSub,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update subscription plan.' });
    }
});
// PATCH /api/v1/admin/subscriptions/:userId/free-limit - Custom free limit for specific poster
router.patch('/subscriptions/:userId/free-limit', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { userId } = req.params;
    const { freeLimitPerJob } = req.body;
    if (typeof freeLimitPerJob !== 'number' || freeLimitPerJob < 0) {
        return res.status(400).json({ success: false, message: 'freeLimitPerJob must be a non-negative number.' });
    }
    try {
        const updatedSub = await mongodb_1.SubscriptionModel.findOneAndUpdate({ userId }, { $set: { freeLimitPerJob } }, { new: true, upsert: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'ADMIN_FREE_LIMIT_UPDATED', 'Subscription', updatedSub?.id || userId, {
            userId,
            freeLimitPerJob,
        });
        return res.json({
            success: true,
            message: `Free application limit updated to ${freeLimitPerJob} per vacancy for this user.`,
            subscription: updatedSub,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update free applicant limit.' });
    }
});
// PATCH /api/v1/admin/subscriptions/:userId/status - Enable, suspend, or activate access
router.patch('/subscriptions/:userId/status', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    if (!status || !['ACTIVE', 'SUSPENDED', 'EXPIRED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Choose ACTIVE, SUSPENDED, or EXPIRED.' });
    }
    try {
        const currentSub = await mongodb_1.SubscriptionModel.findOne({ userId });
        const hasUnlimited = (status === 'ACTIVE') && (currentSub ? currentSub.plan !== 'FREE' : false);
        const updatedSub = await mongodb_1.SubscriptionModel.findOneAndUpdate({ userId }, {
            $set: {
                status,
                hasUnlimitedAccess: hasUnlimited,
                updatedAt: new Date()
            }
        }, { new: true }).lean();
        (0, auditLogger_1.logAuditEvent)(req, 'ADMIN_SUBSCRIPTION_STATUS_CHANGED', 'Subscription', updatedSub?.id || userId, {
            userId,
            status,
        });
        return res.json({
            success: true,
            message: `Subscription access set to ${status}.`,
            subscription: updatedSub,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update subscription status.' });
    }
});
// GET & PUT /api/v1/admin/subscriptions/settings/free-limit - Platform-wide default free application limit
router.get('/subscriptions/settings/free-limit', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (_req, res) => {
    try {
        const limit = await (0, mongodb_1.getGlobalFreeApplicantLimit)();
        return res.json({ success: true, freeLimitPerJob: limit });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve limit setting.' });
    }
});
router.put('/subscriptions/settings/free-limit', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN']), async (req, res) => {
    const { freeLimitPerJob } = req.body;
    if (typeof freeLimitPerJob !== 'number' || freeLimitPerJob < 1) {
        return res.status(400).json({ success: false, message: 'freeLimitPerJob must be at least 1.' });
    }
    try {
        await mongodb_1.PlatformSettingModel.findOneAndUpdate({ key: 'freeApplicantLimitPerJob' }, {
            $set: {
                value: freeLimitPerJob,
                description: 'Default free application view limit per job vacancy',
                category: 'SUBSCRIPTION',
                updatedBy: req.user.email,
                updatedAt: new Date()
            },
            $setOnInsert: { id: `set-free-limit-${Date.now()}`, key: 'freeApplicantLimitPerJob' }
        }, { upsert: true });
        (0, auditLogger_1.logAuditEvent)(req, 'GLOBAL_FREE_LIMIT_UPDATED', 'PlatformSetting', 'freeApplicantLimitPerJob', {
            freeLimitPerJob,
        });
        return res.json({
            success: true,
            message: `Platform default free applicant limit updated to ${freeLimitPerJob} applications per vacancy.`,
            freeLimitPerJob,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to save global free applicant limit.' });
    }
});
// GET /api/v1/admin/subscriptions/payments - View all subscription payments & transactions
router.get('/subscriptions/payments', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['ADMIN', 'HR']), async (req, res) => {
    try {
        const { q } = req.query;
        let payments = [];
        try {
            payments = await mongodb_1.PaymentRecordModel.find().sort({ createdAt: -1 }).lean();
        }
        catch (e) {
            payments = store_1.dbStore.payments;
        }
        // Populate user and institution details
        const populated = await Promise.all(payments.map(async (p) => {
            let user = null;
            try {
                user = await mongodb_1.UserModel.findOne({ id: p.userId }).select('fullName email phone').lean();
            }
            catch (e) { }
            if (!user)
                user = store_1.dbStore.getUserById(p.userId);
            let inst = null;
            if (p.institutionId) {
                try {
                    inst = await mongodb_1.InstitutionModel.findOne({ id: p.institutionId }).select('name city').lean();
                }
                catch (e) { }
                if (!inst)
                    inst = store_1.dbStore.getInstitutionById(p.institutionId);
            }
            return {
                ...p,
                userName: user?.fullName || 'Job Poster',
                userEmail: user?.email || 'N/A',
                userPhone: user?.phone || 'N/A',
                institutionName: inst?.name || 'N/A',
            };
        }));
        let results = populated;
        if (q && typeof q === 'string') {
            const query = q.toLowerCase();
            results = results.filter(r => r.paymentId?.toLowerCase().includes(query) ||
                r.userName?.toLowerCase().includes(query) ||
                r.userEmail?.toLowerCase().includes(query) ||
                r.plan?.toLowerCase().includes(query) ||
                r.institutionName?.toLowerCase().includes(query));
        }
        return res.json({
            success: true,
            total: results.length,
            payments: results,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve payment records.' });
    }
});
exports.default = router;
