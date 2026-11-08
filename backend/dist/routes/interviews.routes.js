"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../db/store");
const mongodb_1 = require("../db/mongodb");
const authMiddleware_1 = require("../middleware/authMiddleware");
const auditLogger_1 = require("../middleware/auditLogger");
const shared_validation_1 = require("@sikchakhub/shared-validation");
const router = (0, express_1.Router)();
// POST /api/v1/interviews - Schedule an interview directly in MongoDB Atlas
router.post('/', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const parseResult = shared_validation_1.ScheduleInterviewSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ success: false, errors: parseResult.error.format() });
    }
    const { applicationId, interviewType, scheduledTime, durationMinutes, meetingLink, locationDetails } = parseResult.data;
    try {
        let app = null;
        try {
            app = await mongodb_1.JobApplicationModel.findOne({ id: applicationId }).lean();
        }
        catch (e) { }
        if (!app) {
            app = store_1.dbStore.applications.find(a => a.id === applicationId);
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
        // Employer ownership verification
        let employerInst = null;
        if (req.user.role === 'EMPLOYER') {
            try {
                employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: req.user.id }).lean();
            }
            catch (e) { }
            if (!employerInst)
                employerInst = store_1.dbStore.institutions.find(i => i.ownerId === req.user.id);
            if (job && employerInst && job.institutionId !== employerInst.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized to schedule interview for this vacancy.' });
            }
        }
        const interviewId = `interview-${Date.now()}`;
        const newInterview = {
            id: interviewId,
            applicationId,
            jobId: app.jobId,
            teacherId: app.teacherId,
            institutionId: job?.institutionId || employerInst?.id || '',
            interviewType,
            scheduledTime,
            durationMinutes: durationMinutes || 45,
            meetingLink: meetingLink || '',
            locationDetails: locationDetails || '',
            status: 'SCHEDULED',
            feedback: '',
            rating: undefined,
            createdAt: new Date().toISOString(),
        };
        // Save to MongoDB Atlas
        try {
            await mongodb_1.InterviewModel.create(newInterview);
            await mongodb_1.JobApplicationModel.findOneAndUpdate({ id: applicationId }, { $set: { stage: 'INTERVIEW_SCHEDULED', updatedAt: new Date() } });
        }
        catch (dbErr) {
            console.warn('MongoDB Interview save notice:', dbErr);
        }
        store_1.dbStore.interviews.unshift(newInterview);
        // Transition in-memory application if present
        const memApp = store_1.dbStore.applications.find(a => a.id === applicationId);
        if (memApp) {
            memApp.stage = 'INTERVIEW_SCHEDULED';
            memApp.updatedAt = new Date().toISOString();
        }
        (0, auditLogger_1.logAuditEvent)(req, 'INTERVIEW_SCHEDULED', 'Interview', newInterview.id, {
            applicationId,
            type: interviewType,
            scheduledTime,
        });
        return res.status(201).json({
            success: true,
            message: 'Interview round scheduled successfully in database!',
            interview: newInterview,
        });
    }
    catch (err) {
        console.error('Interview schedule error:', err);
        return res.status(500).json({ success: false, message: 'Server error scheduling interview.' });
    }
});
// GET /api/v1/interviews/my-interviews - For teacher or employer from MongoDB Atlas
router.get('/my-interviews', authMiddleware_1.authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    try {
        let mongoInterviews = [];
        try {
            const filter = {};
            if (role === 'TEACHER') {
                filter.teacherId = userId;
            }
            mongoInterviews = await mongodb_1.InterviewModel.find(filter).sort({ scheduledTime: 1 }).lean();
        }
        catch (e) {
            if (store_1.dbStore.interviews.length > 0) {
                mongoInterviews = store_1.dbStore.interviews;
            }
        }
        let sourceInterviews = mongoInterviews;
        if (role === 'TEACHER') {
            sourceInterviews = sourceInterviews.filter(i => i.teacherId === userId);
        }
        const populated = await Promise.all(sourceInterviews.map(async (i) => {
            let app = null;
            try {
                app = await mongodb_1.JobApplicationModel.findOne({ id: i.applicationId }).lean();
            }
            catch (e) { }
            if (!app)
                app = store_1.dbStore.applications.find(a => a.id === i.applicationId);
            let job = null;
            try {
                job = await mongodb_1.JobVacancyModel.findOne({ id: i.jobId }).lean();
            }
            catch (e) { }
            if (!job)
                job = store_1.dbStore.getJobById(i.jobId);
            let teacher = null;
            try {
                teacher = await mongodb_1.UserModel.findOne({ id: i.teacherId }).lean();
            }
            catch (e) { }
            if (!teacher)
                teacher = store_1.dbStore.getUserById(i.teacherId);
            let inst = null;
            try {
                inst = await mongodb_1.InstitutionModel.findOne({ id: i.institutionId }).lean();
            }
            catch (e) { }
            if (!inst)
                inst = store_1.dbStore.getInstitutionById(i.institutionId);
            return {
                ...i,
                application: app,
                job,
                teacher: teacher ? { id: teacher.id, fullName: teacher.fullName, email: teacher.email } : undefined,
                institution: inst,
            };
        }));
        return res.json({ success: true, interviews: populated });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve interviews.' });
    }
});
// PATCH /api/v1/interviews/:id - Update interview status or feedback
router.patch('/:id', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    try {
        let updated = null;
        try {
            updated = await mongodb_1.InterviewModel.findOneAndUpdate({ id: req.params.id }, { $set: { ...req.body, updatedAt: new Date() } }, { new: true }).lean();
        }
        catch (e) { }
        const interview = store_1.dbStore.interviews.find(i => i.id === req.params.id);
        if (interview) {
            if (req.body.status)
                interview.status = req.body.status;
            if (req.body.feedback)
                interview.feedback = req.body.feedback;
            if (req.body.rating)
                interview.rating = req.body.rating;
            if (req.body.scheduledTime)
                interview.scheduledTime = req.body.scheduledTime;
            if (!updated)
                updated = interview;
        }
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Interview record not found.' });
        }
        (0, auditLogger_1.logAuditEvent)(req, 'INTERVIEW_UPDATED', 'Interview', req.params.id, req.body);
        return res.json({
            success: true,
            message: 'Interview details updated successfully.',
            interview: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update interview.' });
    }
});
exports.default = router;
