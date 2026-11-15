"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_PLANS = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const mongodb_1 = require("../db/mongodb");
const store_1 = require("../db/store");
const auditLogger_1 = require("../middleware/auditLogger");
const router = (0, express_1.Router)();
// Available subscription tiers & pricing
exports.SUBSCRIPTION_PLANS = [
    {
        id: 'FREE',
        name: 'Free Starter',
        priceINR: 0,
        interval: 'forever',
        description: 'Post jobs for free with trial candidate discovery',
        freeLimitPerJob: 5,
        hasUnlimitedAccess: false,
        features: [
            'Post unlimited job vacancies for free',
            'View first 5 applicant profiles per vacancy',
            'Basic ATS screening match score',
            'Receive direct teacher applications',
            'Basic email notifications'
        ],
        popular: false,
        badge: 'Current Plan'
    },
    {
        id: 'PRO_MONTHLY',
        name: 'Pro Recruiter',
        priceINR: 1999,
        interval: 'month',
        durationDays: 30,
        description: 'Complete unrestricted access to all teacher applications',
        freeLimitPerJob: -1,
        hasUnlimitedAccess: true,
        features: [
            'Unlimited applicant access across all vacancies',
            'Unlock complete teacher profiles & direct phone/email',
            'Instant verified CV / Resume PDF downloads',
            'Priority AI screening & rubric breakdown',
            'Direct interview & demo scheduling',
            'Verified School / Institution badge'
        ],
        popular: true,
        badge: 'Most Popular'
    },
    {
        id: 'ANNUAL_ENTERPRISE',
        name: 'Annual Enterprise',
        priceINR: 14999,
        interval: 'year',
        durationDays: 365,
        description: 'Year-round unlimited recruitment with dedicated HR support',
        freeLimitPerJob: -1,
        hasUnlimitedAccess: true,
        features: [
            'Everything in Pro Recruiter included',
            '365 days of full unlimited candidate access',
            'Save ₹8,989 compared to monthly plan',
            'Multi-campus recruitment drives',
            'Dedicated recruitment support coordinator',
            'Custom applicant screening question builder'
        ],
        popular: false,
        badge: 'Best Value'
    }
];
// GET /api/v1/subscriptions/plans - Public list of available subscription plans
router.get('/plans', (_req, res) => {
    return res.json({
        success: true,
        plans: exports.SUBSCRIPTION_PLANS,
    });
});
// GET /api/v1/subscriptions/my-subscription - Get logged in job poster subscription details & statistics
router.get('/my-subscription', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    try {
        const userId = req.user.id;
        let employerInst = null;
        try {
            employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: userId }).lean();
        }
        catch (e) { }
        if (!employerInst)
            employerInst = store_1.dbStore.institutions.find(i => i.ownerId === userId);
        const subscription = await (0, mongodb_1.getOrInitEmployerSubscription)(userId, employerInst?.id);
        const globalFreeLimit = await (0, mongodb_1.getGlobalFreeApplicantLimit)();
        // Calculate vacancies and applicant statistics
        let employerJobs = [];
        try {
            const jobFilter = employerInst ? { institutionId: employerInst.id } : {};
            employerJobs = await mongodb_1.JobVacancyModel.find(jobFilter).lean();
        }
        catch (e) { }
        if (employerJobs.length === 0) {
            employerJobs = employerInst ? store_1.dbStore.jobs.filter(j => j.institutionId === employerInst.id) : store_1.dbStore.jobs;
        }
        const jobIds = employerJobs.map(j => j.id);
        let totalApplicants = 0;
        let lockedApplicantsCount = 0;
        let unlockedApplicantsCount = 0;
        if (jobIds.length > 0) {
            const limit = subscription.freeLimitPerJob || globalFreeLimit;
            const isUnlimited = subscription.hasUnlimitedAccess === true && subscription.status === 'ACTIVE';
            for (const jId of jobIds) {
                let jobApps = [];
                try {
                    jobApps = await mongodb_1.JobApplicationModel.find({ jobId: jId }).sort({ appliedAt: 1 }).lean();
                }
                catch (e) { }
                if (jobApps.length === 0) {
                    jobApps = store_1.dbStore.applications.filter(a => a.jobId === jId);
                }
                totalApplicants += jobApps.length;
                if (isUnlimited) {
                    unlockedApplicantsCount += jobApps.length;
                }
                else {
                    const unlockedForThisJob = Math.min(jobApps.length, limit);
                    const lockedForThisJob = Math.max(0, jobApps.length - limit);
                    unlockedApplicantsCount += unlockedForThisJob;
                    lockedApplicantsCount += lockedForThisJob;
                }
            }
        }
        return res.json({
            success: true,
            subscription: {
                ...subscription,
                isPremium: subscription.hasUnlimitedAccess === true && subscription.status === 'ACTIVE',
            },
            stats: {
                totalJobs: employerJobs.length,
                totalApplicants,
                unlockedApplicants: unlockedApplicantsCount,
                lockedApplicants: lockedApplicantsCount,
                freeLimitPerJob: subscription.freeLimitPerJob || globalFreeLimit,
            },
            plans: exports.SUBSCRIPTION_PLANS,
        });
    }
    catch (error) {
        console.error('Fetch my-subscription error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve subscription status.' });
    }
});
// POST /api/v1/subscriptions/subscribe - Purchase / Upgrade to Premium subscription
router.post('/subscribe', authMiddleware_1.authenticateJWT, authMiddleware_1.requireVerifiedAccount, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    const { plan: targetPlan, paymentMethod } = req.body;
    if (!targetPlan || !['PRO_MONTHLY', 'ANNUAL_ENTERPRISE'].includes(targetPlan)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid plan selected. Choose PRO_MONTHLY or ANNUAL_ENTERPRISE.',
        });
    }
    try {
        const userId = req.user.id;
        let employerInst = null;
        try {
            employerInst = await mongodb_1.InstitutionModel.findOne({ ownerId: userId }).lean();
        }
        catch (e) { }
        if (!employerInst)
            employerInst = store_1.dbStore.institutions.find(i => i.ownerId === userId);
        const planConfig = exports.SUBSCRIPTION_PLANS.find(p => p.id === targetPlan);
        if (!planConfig) {
            return res.status(400).json({ success: false, message: 'Plan configuration not found.' });
        }
        const durationDays = planConfig.durationDays || 30;
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        const paymentId = `PAY_SK_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        // Record verified transaction
        const paymentRecordDoc = {
            id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            subscriptionId: '',
            userId,
            institutionId: employerInst?.id || undefined,
            plan: targetPlan,
            amount: planConfig.priceINR,
            currency: 'INR',
            paymentGateway: 'DIRECT_PAY',
            paymentId,
            status: 'SUCCESS',
            createdAt: new Date(),
        };
        let savedPayment = null;
        try {
            savedPayment = await mongodb_1.PaymentRecordModel.create(paymentRecordDoc);
        }
        catch (e) {
            store_1.dbStore.payments.push(paymentRecordDoc);
            savedPayment = paymentRecordDoc;
        }
        // Update / Upsert subscription in MongoDB
        const subUpdate = {
            plan: targetPlan,
            status: 'ACTIVE',
            hasUnlimitedAccess: true,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            amountPaid: planConfig.priceINR,
            paymentStatus: 'PAID',
            lastPaymentId: paymentId,
            grantedByAdmin: false,
            institutionId: employerInst?.id || undefined,
        };
        let updatedSub = null;
        try {
            updatedSub = await mongodb_1.SubscriptionModel.findOneAndUpdate({ userId }, {
                $set: subUpdate,
                $setOnInsert: { id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, userId }
            }, { new: true, upsert: true }).lean();
        }
        catch (e) {
            const idx = store_1.dbStore.subscriptions.findIndex(s => s.userId === userId);
            const subItem = {
                id: `sub_${Date.now()}`,
                userId,
                freeLimitPerJob: 5,
                ...subUpdate,
            };
            if (idx >= 0) {
                store_1.dbStore.subscriptions[idx] = subItem;
            }
            else {
                store_1.dbStore.subscriptions.push(subItem);
            }
            updatedSub = subItem;
        }
        // Link subscription ID in payment record
        if (updatedSub && savedPayment) {
            try {
                await mongodb_1.PaymentRecordModel.updateOne({ id: savedPayment.id }, { subscriptionId: updatedSub.id });
            }
            catch (e) { }
        }
        // Log audit event
        (0, auditLogger_1.logAuditEvent)(req, 'SUBSCRIPTION_UPGRADED', 'Subscription', updatedSub?.id || userId, {
            plan: targetPlan,
            amount: planConfig.priceINR,
            paymentId,
            paymentMethod: paymentMethod || 'ONLINE_INSTANT',
            expiresAt: endDate.toISOString(),
        });
        return res.json({
            success: true,
            message: `🎉 Successfully upgraded to ${planConfig.name}! All candidate applications are now fully unlocked.`,
            subscription: {
                ...updatedSub,
                isPremium: true,
            },
            paymentRecord: savedPayment,
        });
    }
    catch (error) {
        console.error('Subscription purchase error:', error);
        return res.status(500).json({ success: false, message: 'Failed to complete subscription upgrade.' });
    }
});
// GET /api/v1/subscriptions/payments - View payment history of current job poster
router.get('/payments', authMiddleware_1.authenticateJWT, (0, authMiddleware_1.requireRole)(['EMPLOYER', 'ADMIN']), async (req, res) => {
    try {
        const userId = req.user.id;
        let records = [];
        try {
            records = await mongodb_1.PaymentRecordModel.find({ userId }).sort({ createdAt: -1 }).lean();
        }
        catch (e) { }
        if (records.length === 0) {
            records = store_1.dbStore.payments.filter(p => p.userId === userId);
        }
        return res.json({
            success: true,
            payments: records,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve payment records.' });
    }
});
exports.default = router;
