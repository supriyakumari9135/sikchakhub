import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole, requireVerifiedAccount } from '../middleware/authMiddleware';
import { 
  UserModel,
  SubscriptionModel, 
  SubscriptionRequestModel,
  PaymentRecordModel, 
  InstitutionModel, 
  JobVacancyModel, 
  JobApplicationModel,
  UserInboxNotificationModel,
  getOrInitEmployerSubscription, 
  getGlobalFreeApplicantLimit 
} from '../db/mongodb';
import { dbStore } from '../db/store';
import { logAuditEvent } from '../middleware/auditLogger';

const router = Router();

// Available subscription tiers & pricing
export const SUBSCRIPTION_PLANS = [
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
router.get('/plans', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    plans: SUBSCRIPTION_PLANS,
  });
});

// GET /api/v1/subscriptions/my-subscription - Get logged in job poster subscription details & statistics
router.get('/my-subscription', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let employerInst: any = null;
    try {
      employerInst = await InstitutionModel.findOne({ ownerId: userId }).lean();
    } catch (e) {}
    if (!employerInst) employerInst = dbStore.institutions.find(i => i.ownerId === userId);

    const subscription: any = await getOrInitEmployerSubscription(userId, employerInst?.id);
    const globalFreeLimit = await getGlobalFreeApplicantLimit();

    // Calculate vacancies and applicant statistics
    let employerJobs: any[] = [];
    try {
      const jobFilter = employerInst ? { institutionId: employerInst.id } : {};
      employerJobs = await JobVacancyModel.find(jobFilter).lean();
    } catch (e) {}
    if (employerJobs.length === 0) {
      employerJobs = employerInst ? dbStore.jobs.filter(j => j.institutionId === employerInst.id) : dbStore.jobs;
    }

    const jobIds = employerJobs.map(j => j.id);
    let totalApplicants = 0;
    let lockedApplicantsCount = 0;
    let unlockedApplicantsCount = 0;

    if (jobIds.length > 0) {
      const limit = subscription.freeLimitPerJob || globalFreeLimit;
      const isUnlimited = subscription.hasUnlimitedAccess === true && subscription.status === 'ACTIVE';

      for (const jId of jobIds) {
        let jobApps: any[] = [];
        try {
          jobApps = await JobApplicationModel.find({ jobId: jId }).sort({ appliedAt: 1 }).lean();
        } catch (e) {}
        if (jobApps.length === 0) {
          jobApps = dbStore.applications.filter(a => a.jobId === jId);
        }

        totalApplicants += jobApps.length;
        if (isUnlimited) {
          unlockedApplicantsCount += jobApps.length;
        } else {
          const unlockedForThisJob = Math.min(jobApps.length, limit);
          const lockedForThisJob = Math.max(0, jobApps.length - limit);
          unlockedApplicantsCount += unlockedForThisJob;
          lockedApplicantsCount += lockedForThisJob;
        }
      }
    }

    // Check if there is an active upgrade application pending admin approval
    let pendingReq: any = null;
    try {
      pendingReq = await SubscriptionRequestModel.findOne({ 
        userId, 
        status: { $in: ['PENDING', 'CONTACTED'] } 
      }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      pendingReq = dbStore.subscriptionRequests
        .filter(r => r.userId === userId && ['PENDING', 'CONTACTED'].includes(r.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }

    return res.json({
      success: true,
      subscription: {
        ...subscription,
        isPremium: subscription.hasUnlimitedAccess === true && subscription.status === 'ACTIVE',
        hasPendingRequest: Boolean(pendingReq),
        requestStatus: pendingReq ? pendingReq.status : (subscription.requestStatus || 'NONE'),
        requestedPlan: pendingReq ? pendingReq.requestedPlan : subscription.requestedPlan,
        pendingRequest: pendingReq || null,
      },
      stats: {
        totalJobs: employerJobs.length,
        totalApplicants,
        unlockedApplicants: unlockedApplicantsCount,
        lockedApplicants: lockedApplicantsCount,
        freeLimitPerJob: subscription.freeLimitPerJob || globalFreeLimit,
      },
      plans: SUBSCRIPTION_PLANS,
    });
  } catch (error: any) {
    console.error('Fetch my-subscription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscription status.' });
  }
});

// Handler for submitting premium upgrade applications
const handleUpgradeApplication = async (req: Request, res: Response) => {
  const { plan: targetPlan, notes, contactPhone, contactPerson } = req.body;

  if (!targetPlan || !['PRO_MONTHLY', 'ANNUAL_ENTERPRISE'].includes(targetPlan)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan selected. Choose PRO_MONTHLY or ANNUAL_ENTERPRISE.',
    });
  }

  try {
    const userId = req.user!.id;
    let employerUser: any = null;
    try {
      employerUser = await UserModel.findOne({ id: userId }).lean();
    } catch (e) {}
    if (!employerUser) employerUser = dbStore.users.find(u => u.id === userId);

    let employerInst: any = null;
    try {
      employerInst = await InstitutionModel.findOne({ ownerId: userId }).lean();
    } catch (e) {}
    if (!employerInst) employerInst = dbStore.institutions.find(i => i.ownerId === userId);

    const subscription: any = await getOrInitEmployerSubscription(userId, employerInst?.id);
    if (subscription.hasUnlimitedAccess === true && subscription.status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Your institution already has an active Unlimited Premium membership!',
      });
    }

    // Check if an existing pending request is already waiting
    let existingPendingReq: any = null;
    try {
      existingPendingReq = await SubscriptionRequestModel.findOne({ 
        userId, 
        status: { $in: ['PENDING', 'CONTACTED'] } 
      }).lean();
    } catch (e) {
      existingPendingReq = dbStore.subscriptionRequests.find(r => r.userId === userId && ['PENDING', 'CONTACTED'].includes(r.status));
    }

    const planConfig = SUBSCRIPTION_PLANS.find(p => p.id === targetPlan) || SUBSCRIPTION_PLANS[1];

    if (existingPendingReq) {
      return res.json({
        success: true,
        alreadyPending: true,
        message: 'You already have a pending Premium upgrade application under review. The SikshaHub administration team will connect with you directly to assist with payment and activation.',
        request: existingPendingReq,
      });
    }

    // Create new request
    const requestDoc = {
      id: `subreq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      institutionId: employerInst?.id || undefined,
      institutionName: employerInst?.name || employerUser?.organizationName || 'Institution',
      institutionCity: employerInst?.city || employerUser?.city || 'India',
      contactPerson: contactPerson || employerInst?.contactPerson || employerUser?.fullName || 'Recruiter',
      contactEmail: employerUser?.email || '',
      contactPhone: contactPhone || employerInst?.phone || employerUser?.phone || 'N/A',
      requestedPlan: targetPlan,
      amount: planConfig.priceINR,
      status: 'PENDING',
      requestNotes: notes || '',
      createdAt: new Date(),
    };

    let savedReq: any = null;
    try {
      savedReq = await SubscriptionRequestModel.create(requestDoc);
    } catch (e) {
      dbStore.subscriptionRequests.push(requestDoc);
      savedReq = requestDoc;
    }

    // Update Subscription status to PENDING
    try {
      await SubscriptionModel.updateOne(
        { userId },
        { 
          $set: { 
            requestStatus: 'PENDING',
            requestedPlan: targetPlan,
            requestedAt: new Date().toISOString(),
            requestNotes: notes || '',
          } 
        }
      );
    } catch (e) {
      const idx = dbStore.subscriptions.findIndex(s => s.userId === userId);
      if (idx >= 0) {
        dbStore.subscriptions[idx].requestStatus = 'PENDING' as any;
        dbStore.subscriptions[idx].requestedPlan = targetPlan as any;
      }
    }

    // Notify Super Admin in-app
    try {
      await UserInboxNotificationModel.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: 'admin',
        title: '👑 New Premium Upgrade Application',
        message: `${requestDoc.institutionName} (${requestDoc.contactPerson}) applied for ${planConfig.name} (₹${planConfig.priceINR}). Phone: ${requestDoc.contactPhone}`,
        type: 'SUBSCRIPTION_REQUEST',
        isRead: false,
        createdAt: new Date(),
      });
    } catch (e) {}

    logAuditEvent(
      req,
      'SUBSCRIPTION_UPGRADE_REQUESTED',
      'SubscriptionRequest',
      savedReq.id,
      {
        plan: targetPlan,
        amount: planConfig.priceINR,
        institution: requestDoc.institutionName,
        phone: requestDoc.contactPhone,
      }
    );

    return res.json({
      success: true,
      message: 'Your Premium Upgrade application has been submitted successfully! The SikshaHub administration team has received your details and will connect with you directly to complete payment and unlock your premium unlimited access.',
      request: savedReq,
    });
  } catch (error: any) {
    console.error('Submit subscription upgrade request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit premium upgrade request.' });
  }
};

// POST /api/v1/subscriptions/request-upgrade - Apply for Premium subscription
router.post('/request-upgrade', authenticateJWT, requireVerifiedAccount, requireRole(['EMPLOYER', 'ADMIN']), handleUpgradeApplication);

// POST /api/v1/subscriptions/subscribe - Unified with upgrade application (Admin manual review & approval)
router.post('/subscribe', authenticateJWT, requireVerifiedAccount, requireRole(['EMPLOYER', 'ADMIN']), handleUpgradeApplication);

// GET /api/v1/subscriptions/payments - View payment history of current job poster
router.get('/payments', authenticateJWT, requireRole(['EMPLOYER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let records: any[] = [];
    try {
      records = await PaymentRecordModel.find({ userId }).sort({ createdAt: -1 }).lean();
    } catch (e) {}
    if (records.length === 0) {
      records = dbStore.payments.filter(p => p.userId === userId);
    }

    return res.json({
      success: true,
      payments: records,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment records.' });
  }
});

export default router;
