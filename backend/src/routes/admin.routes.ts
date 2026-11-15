import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { dbStore } from '../db/store';
import { 
  UserModel, 
  TeacherProfileModel,
  InstitutionModel, 
  JobVacancyModel, 
  JobApplicationModel, 
  InterviewModel, 
  AuditLogModel,
  MasterDataModel,
  PlatformNotificationModel,
  DeviceTokenModel,
  UserReportModel,
  PlatformSettingModel,
  CandidateGroupModel,
  SubscriptionModel,
  PaymentRecordModel,
  getOrInitEmployerSubscription,
  getGlobalFreeApplicantLimit
} from '../db/mongodb';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditLogger';
import { fcmService } from '../services/fcmService';

const router = Router();

// =========================================================================
// 1. DASHBOARD OVERVIEW & COMPREHENSIVE KPIS
// =========================================================================

router.get('/kpis', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
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
      totalTeachers = await UserModel.countDocuments({ role: 'TEACHER' });
      totalEmployers = await UserModel.countDocuments({ role: 'EMPLOYER' });
      totalVerifiedInstitutions = await InstitutionModel.countDocuments({ verificationStatus: 'VERIFIED' });
      pendingInstitutions = await InstitutionModel.countDocuments({ verificationStatus: 'PENDING' });
      totalActiveVacancies = await JobVacancyModel.countDocuments({ status: 'ACTIVE' });
      pendingJobApprovals = await JobVacancyModel.countDocuments({ status: { $in: ['PENDING_APPROVAL', 'DRAFT'] } });
      totalApplications = await JobApplicationModel.countDocuments();
      shortlistedCandidates = await JobApplicationModel.countDocuments({ stage: 'SHORTLISTED' });
      interviewsScheduled = await InterviewModel.countDocuments();
      selectedCandidates = await JobApplicationModel.countDocuments({ stage: 'SELECTED' });
    } catch (e) {
      totalTeachers = dbStore.users.filter(u => u.role === 'TEACHER').length;
      totalEmployers = dbStore.users.filter(u => u.role === 'EMPLOYER').length;
      totalVerifiedInstitutions = dbStore.institutions.filter(i => i.verificationStatus === 'VERIFIED').length;
      pendingInstitutions = dbStore.institutions.filter(i => i.verificationStatus === 'PENDING').length;
      totalActiveVacancies = dbStore.jobs.filter(j => j.status === 'ACTIVE').length;
      pendingJobApprovals = dbStore.jobs.filter(j => j.status === 'PENDING_APPROVAL' || j.status === 'DRAFT').length;
      pendingJobApprovals = dbStore.jobs.filter(j => j.status === 'DRAFT').length;
      totalApplications = dbStore.applications.length;
      shortlistedCandidates = dbStore.applications.filter(a => a.stage === 'SHORTLISTED').length;
      interviewsScheduled = dbStore.interviews.length;
      selectedCandidates = dbStore.applications.filter(a => a.stage === 'SELECTED').length;
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin KPIs' });
  }
});

// GET /api/v1/admin/analytics - Comprehensive growth & distribution statistics
router.get('/analytics', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    let jobs: any[] = [];
    let applications: any[] = [];
    let teachers: any[] = [];
    let institutions: any[] = [];

    try {
      jobs = await JobVacancyModel.find().lean();
      applications = await JobApplicationModel.find().lean();
      teachers = await UserModel.find({ role: 'TEACHER' }).lean();
      institutions = await InstitutionModel.find().lean();
    } catch (e) {
      jobs = dbStore.jobs;
      applications = dbStore.applications;
      teachers = dbStore.users.filter(u => u.role === 'TEACHER');
      institutions = dbStore.institutions;
    }

    // 1. Applications Stage Distribution Funnel
    const stageCounts: Record<string, number> = {
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
      } else {
        stageCounts[a.stage] = 1;
      }
    });

    // 2. Jobs by Teaching Level
    const levelCounts: Record<string, number> = {};
    jobs.forEach(j => {
      levelCounts[j.teachingLevel] = (levelCounts[j.teachingLevel] || 0) + 1;
    });

    // 3. Applications by Subject
    const subjectCounts: Record<string, number> = {};
    applications.forEach(a => {
      const job = jobs.find(j => j.id === a.jobId) || dbStore.getJobById(a.jobId);
      const sub = job?.subject || 'Other Subject';
      subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
    });

    // 4. Recruitment by State / Major Cities
    const cityCounts: Record<string, number> = {};
    jobs.forEach(j => {
      const c = j.city || 'Other';
      cityCounts[c] = (cityCounts[c] || 0) + 1;
    });

    // 5. Institution Vacancy Statistics
    const instCounts: Record<string, number> = {};
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics' });
  }
});

// GET /api/v1/admin/recent-activities - Live chronological activity stream
router.get('/recent-activities', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    let logs: any[] = [];
    try {
      logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(25).lean();
      
      // If no explicit audit logs are recorded yet, synthesize live stream from real MongoDB events
      if (logs.length === 0) {
        const [recentApps, recentJobs, recentInsts, recentTeachers] = await Promise.all([
          JobApplicationModel.find().sort({ createdAt: -1 }).limit(10).lean(),
          JobVacancyModel.find().sort({ createdAt: -1 }).limit(10).lean(),
          InstitutionModel.find().sort({ createdAt: -1 }).limit(10).lean(),
          UserModel.find({ role: 'TEACHER' }).sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        const syntheticActivities: any[] = [];
        await Promise.all(recentApps.map(async (app: any) => {
          let candidateName = app.candidateName;
          let jobTitle = app.jobTitle;
          if (!candidateName) {
            const user: any = await UserModel.findOne({ id: app.teacherId }).lean();
            candidateName = user?.fullName || 'Educator';
          }
          if (!jobTitle) {
            const job: any = await JobVacancyModel.findOne({ id: app.jobId }).lean();
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

        recentJobs.forEach((job: any) => {
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

        recentInsts.forEach((inst: any) => {
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

        recentTeachers.forEach((teacher: any) => {
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
    } catch (e) {
      logs = dbStore.auditLogs.slice(0, 25);
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve recent activities' });
  }
});

// =========================================================================
// 2. TEACHER / JOB SEEKER MANAGEMENT
// =========================================================================

// GET /api/v1/admin/teachers - List educators with search & filters
router.get('/teachers', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { q, subject, qualification, status, page = 1, limit = 50 } = req.query;

  try {
    let teachers: any[] = [];
    try {
      const filter: any = { role: 'TEACHER' };
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
      teachers = await UserModel.find(filter).sort({ createdAt: -1 }).lean();
    } catch (e) {
      teachers = dbStore.users.filter(u => u.role === 'TEACHER');
    }

    // Batch resolve teacher profiles and applications count in O(1) queries (Eliminates N+1 bottleneck)
    const teacherIds = teachers.map((t: any) => t.id);

    let profilesList: any[] = [];
    try {
      profilesList = await TeacherProfileModel.find({ userId: { $in: teacherIds } }).lean();
    } catch (e) {}
    const profilesMap = new Map<string, any>();
    profilesList.forEach(p => profilesMap.set(p.userId, p));

    const appCountMap = new Map<string, number>();
    try {
      const counts = await JobApplicationModel.aggregate([
        { $match: { teacherId: { $in: teacherIds } } },
        { $group: { _id: '$teacherId', count: { $sum: 1 } } }
      ]);
      counts.forEach((c: any) => appCountMap.set(c._id, c.count));
    } catch (e) {}

    const populated = teachers.map((t: any) => {
      let profile = profilesMap.get(t.id);
      if (!profile) profile = dbStore.getProfileByUserId(t.id);

      let appCount = appCountMap.get(t.id) || 0;
      if (appCount === 0 && dbStore.applications.length > 0) {
        appCount = dbStore.getApplicationsByTeacherId(t.id).length;
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
      result = result.filter(t => t.profile?.subjects?.some((s: string) => s.toLowerCase() === String(subject).toLowerCase()));
    }
    if (qualification && qualification !== 'ALL') {
      result = result.filter(t => t.profile?.highestQualification?.toLowerCase().includes(String(qualification).toLowerCase()));
    }

    return res.json({
      success: true,
      total: result.length,
      teachers: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve teachers list' });
  }
});

// GET /api/v1/admin/teachers/:id - Complete teacher dossier & application history
router.get('/teachers/:id', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const user: any = await UserModel.findOne({ id: req.params.id, role: 'TEACHER' }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Teacher record not found' });
    }

    const profile: any = await TeacherProfileModel.findOne({ userId: user.id }).lean();
    const applications = await JobApplicationModel.find({ teacherId: user.id }).sort({ appliedAt: -1 }).lean();

    const enrichedApps = await Promise.all(applications.map(async (app) => {
      const job: any = await JobVacancyModel.findOne({ id: app.jobId }).lean();
      const institution: any = job ? await InstitutionModel.findOne({ id: job.institutionId }).lean() : null;
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load teacher dossier' });
  }
});

// PATCH /api/v1/admin/teachers/:id - Edit teacher administrative details
router.patch('/teachers/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { fullName, phone, age, status, isVerified, headline, highestQualification, currentCity, experienceYears } = req.body;

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { fullName, phone, age, status, isVerified } },
      { new: true }
    ).lean();

    if (headline !== undefined || highestQualification !== undefined || currentCity !== undefined || experienceYears !== undefined) {
      await TeacherProfileModel.findOneAndUpdate(
        { userId: req.params.id },
        { $set: { headline, highestQualification, currentCity, experienceYears: Number(experienceYears) || 0 } }
      );
    }

    logAuditEvent(req, 'TEACHER_ADMIN_UPDATED', 'User', req.params.id, { fullName, status });

    return res.json({
      success: true,
      message: 'Teacher profile administratively updated.',
      user: updatedUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update teacher profile' });
  }
});

// PATCH /api/v1/admin/teachers/:id/status - Activate / Suspend / Reactivate account
router.patch('/teachers/:id/status', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { status, reason } = req.body; // status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'

  try {
    const user: any = await UserModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Teacher record not found.' });
    }

    logAuditEvent(req, `TEACHER_STATUS_${status}`, 'User', user.id, {
      previousStatus: user.status,
      newStatus: status,
      reason: reason || 'Administrative action',
    });

    return res.json({
      success: true,
      message: `Teacher account is now ${status}.`,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update teacher status' });
  }
});

// DELETE /api/v1/admin/teachers/:id - Controlled deletion / safe archival
router.delete('/teachers/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const teacher: any = await UserModel.findOne({ id: req.params.id }).lean();
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher record not found.' });
    }

    // Safe archival: Mark as DEACTIVATED to preserve historical recruitment integrity
    await UserModel.findOneAndUpdate({ id: req.params.id }, { $set: { status: 'DEACTIVATED' } });

    logAuditEvent(req, 'TEACHER_ARCHIVED', 'User', req.params.id, {
      email: teacher.email,
      name: teacher.fullName,
    });

    return res.json({
      success: true,
      message: 'Teacher record securely archived and deactivated from platform.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete/archive teacher' });
  }
});

// =========================================================================
// 3. EMPLOYER / INSTITUTION MANAGEMENT
// =========================================================================

// GET /api/v1/admin/employers - List all employers & institutions
router.get('/employers', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { q, type, verificationStatus, state } = req.query;

  try {
    let institutions: any[] = [];
    try {
      const filter: any = {};
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
      institutions = await InstitutionModel.find(filter).sort({ createdAt: -1 }).lean();
    } catch (e) {
      institutions = dbStore.institutions;
    }

    // Populate owner details and total vacancies count
    const populated = await Promise.all(institutions.map(async (inst) => {
      let owner: any = null;
      let jobsCount = 0;
      let appsCount = 0;

      try {
        owner = await UserModel.findOne({ id: inst.ownerId }).lean();
        jobsCount = await JobVacancyModel.countDocuments({ institutionId: inst.id });
        const jobIds = (await JobVacancyModel.find({ institutionId: inst.id }, 'id').lean()).map(j => j.id);
        appsCount = await JobApplicationModel.countDocuments({ jobId: { $in: jobIds } });
      } catch (err) {
        owner = dbStore.getUserById(inst.ownerId);
        jobsCount = dbStore.jobs.filter(j => j.institutionId === inst.id).length;
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve employers' });
  }
});

// GET /api/v1/admin/employers/:id - Full institution dossier & vacancy list
router.get('/employers/:id', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const inst: any = await InstitutionModel.findOne({ id: req.params.id }).lean();
    if (!inst) {
      return res.status(404).json({ success: false, message: 'Institution record not found' });
    }

    const owner = await UserModel.findOne({ id: inst.ownerId }).lean();
    const jobs = await JobVacancyModel.find({ institutionId: inst.id }).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      institution: {
        ...inst,
        owner,
        jobs,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve institution dossier' });
  }
});

// PATCH /api/v1/admin/employers/:id - Update institution details
router.patch('/employers/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { 
    name, type, website, description, affiliationNumber, address, city, state, pincode,
    contactPerson, phone, email, board, udiseCode, registrationNumber
  } = req.body;

  try {
    const updated = await InstitutionModel.findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: { 
          name, type, website, description, affiliationNumber, address, city, state, pincode,
          contactPerson, phone, email, board, udiseCode, registrationNumber,
          updatedAt: new Date() 
        } 
      },
      { new: true }
    ).lean();

    logAuditEvent(req, 'INSTITUTION_ADMIN_UPDATED', 'Institution', req.params.id, { name, city, state });

    return res.json({
      success: true,
      message: 'Institution profile updated successfully.',
      institution: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update institution' });
  }
});

// PATCH /api/v1/admin/employers/:id/status - Suspend / Reactivate institution
router.patch('/employers/:id/status', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { verificationStatus, reason } = req.body; // 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED'

  try {
    const inst: any = await InstitutionModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { verificationStatus, verificationNotes: reason || '', updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!inst) {
      return res.status(404).json({ success: false, message: 'Institution record not found.' });
    }

    logAuditEvent(req, `INSTITUTION_STATUS_${verificationStatus}`, 'Institution', inst.id, {
      status: verificationStatus,
      reason,
    });

    return res.json({
      success: true,
      message: `Institution status updated to ${verificationStatus}.`,
      institution: inst,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// POST /api/v1/admin/verify-institution - Approve / Reject institution
router.post('/verify-institution', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { institutionId, status, notes } = req.body; // status: 'VERIFIED' | 'REJECTED'

  try {
    const inst: any = await InstitutionModel.findOneAndUpdate(
      { id: institutionId },
      { $set: { verificationStatus: status, verificationNotes: notes || '', updatedAt: new Date() } },
      { new: true }
    ).lean();

    if (!inst) {
      return res.status(404).json({ success: false, message: 'Institution record not found.' });
    }

    logAuditEvent(req, `INSTITUTION_${status}`, 'Institution', inst.id, {
      institutionName: inst.name,
      decision: status,
      notes,
    });

    return res.json({
      success: true,
      message: `Institution verification status updated to ${status}.`,
      institution: inst,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to verify institution' });
  }
});

// DELETE /api/v1/admin/employers/:id - Controlled deletion / suspension
router.delete('/employers/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const inst = await InstitutionModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { verificationStatus: 'SUSPENDED' } },
      { new: true }
    );

    logAuditEvent(req, 'INSTITUTION_SUSPENDED', 'Institution', req.params.id, { name: inst?.name });

    return res.json({
      success: true,
      message: 'Institution suspended and withdrawn from public recruitment listings.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to suspend institution' });
  }
});

// =========================================================================
// 4. JOB POSTING MANAGEMENT
// =========================================================================

// GET /api/v1/admin/jobs - List all vacancies across institutions
router.get('/jobs', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { q, subject, teachingLevel, city, status } = req.query;

  try {
    let jobs: any[] = [];
    try {
      const filter: any = {};
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
      jobs = await JobVacancyModel.find(filter).sort({ createdAt: -1 }).lean();
    } catch (e) {
      jobs = dbStore.jobs;
    }

    // Batch resolve institutions and application counts in O(1) queries (Eliminates N+1 bottleneck)
    const uniqueInstIds = Array.from(new Set(jobs.map((j: any) => j.institutionId).filter(Boolean)));
    const allJobIds = jobs.map((j: any) => j.id);

    let institutionsList: any[] = [];
    try {
      institutionsList = await InstitutionModel.find({ id: { $in: uniqueInstIds } }).lean();
    } catch (e) {}
    const instMap = new Map<string, any>();
    institutionsList.forEach(inst => instMap.set(inst.id, inst));

    const appCountMap = new Map<string, number>();
    try {
      const counts = await JobApplicationModel.aggregate([
        { $match: { jobId: { $in: allJobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } }
      ]);
      counts.forEach((c: any) => appCountMap.set(c._id, c.count));
    } catch (e) {}

    const populated = jobs.map((job: any) => {
      let institution = instMap.get(job.institutionId);
      if (!institution) institution = dbStore.getInstitutionById(job.institutionId);

      let totalApplicants = job.totalApplicants || appCountMap.get(job.id) || 0;
      if (totalApplicants === 0 && dbStore.applications.length > 0) {
        totalApplicants = dbStore.applications.filter(a => a.jobId === job.id).length;
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
  }
});

// PATCH /api/v1/admin/jobs/:id - Edit job administrative details
router.patch('/jobs/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { title, subject, teachingLevel, minSalaryLPA, maxSalaryLPA, deadline, vacanciesCount, status } = req.body;

  try {
    const updated = await JobVacancyModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { title, subject, teachingLevel, minSalaryLPA, maxSalaryLPA, deadline, vacanciesCount, status, updatedAt: new Date() } },
      { new: true }
    ).lean();

    logAuditEvent(req, 'JOB_ADMIN_MODERATED', 'JobVacancy', req.params.id, { title, status });

    return res.json({
      success: true,
      message: 'Job posting moderated and saved.',
      job: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update job' });
  }
});

// PATCH /api/v1/admin/jobs/:id/status - Toggle status (ACTIVE / PAUSED / CLOSED / REJECTED)
router.patch('/jobs/:id/status', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { status, reason } = req.body;

  try {
    const updated = await JobVacancyModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    ).lean();

    logAuditEvent(req, `JOB_STATUS_${status}`, 'JobVacancy', req.params.id, { status, reason });

    return res.json({
      success: true,
      message: `Vacancy status changed to ${status}.`,
      job: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to change job status' });
  }
});

// DELETE /api/v1/admin/jobs/:id - Remove policy-violating vacancy
router.delete('/jobs/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    await JobVacancyModel.findOneAndUpdate({ id: req.params.id }, { $set: { status: 'CLOSED' } });
    logAuditEvent(req, 'JOB_REMOVED', 'JobVacancy', req.params.id, { reason: 'Policy violation' });

    return res.json({
      success: true,
      message: 'Vacancy closed and removed from active public listings.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to remove job' });
  }
});

// =========================================================================
// 5. APPLICATION MANAGEMENT & CANDIDATE DOSSIERS
// =========================================================================

// GET /api/v1/admin/applications - Monitor all platform job applications
router.get('/applications', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { q, stage, jobId } = req.query;

  try {
    let apps: any[] = [];
    try {
      const filter: any = {};
      if (stage && stage !== 'ALL') {
        filter.stage = stage;
      }
      if (jobId && jobId !== 'ALL') {
        filter.jobId = jobId;
      }
      apps = await JobApplicationModel.find(filter).sort({ appliedAt: -1 }).lean();
    } catch (e) {
      apps = dbStore.applications;
    }

    // Batch resolve teachers, jobs, and institutions in O(1) queries (Eliminates N+1 bottleneck)
    const teacherIds = Array.from(new Set(apps.map((a: any) => a.teacherId).filter(Boolean)));
    const jobIds = Array.from(new Set(apps.map((a: any) => a.jobId).filter(Boolean)));

    let teachersList: any[] = [];
    try {
      teachersList = await UserModel.find({ id: { $in: teacherIds } }).lean();
    } catch (e) {}
    const teachersMap = new Map<string, any>();
    teachersList.forEach(t => teachersMap.set(t.id, t));

    let jobsList: any[] = [];
    try {
      jobsList = await JobVacancyModel.find({ id: { $in: jobIds } }).lean();
    } catch (e) {}
    const jobsMap = new Map<string, any>();
    jobsList.forEach(j => jobsMap.set(j.id, j));

    const instIds = Array.from(new Set(jobsList.map(j => j.institutionId).filter(Boolean)));
    let institutionsList: any[] = [];
    try {
      institutionsList = await InstitutionModel.find({ id: { $in: instIds } }).lean();
    } catch (e) {}
    const instMap = new Map<string, any>();
    institutionsList.forEach(i => instMap.set(i.id, i));

    const populated = apps.map((app: any) => {
      let teacher = teachersMap.get(app.teacherId);
      if (!teacher) teacher = dbStore.getUserById(app.teacherId);

      let job = jobsMap.get(app.jobId);
      if (!job) job = dbStore.getJobById(app.jobId);

      let institution: any = null;
      if (job) {
        institution = instMap.get(job.institutionId);
        if (!institution) institution = dbStore.getInstitutionById(job.institutionId);
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load applications' });
  }
});

// PATCH /api/v1/admin/applications/:id/stage - Exceptional stage correction with reason
router.patch('/applications/:id/stage', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { stage, reason } = req.body;

  if (!reason) {
    return res.status(400).json({ success: false, message: 'Administrative reason is required for exceptional stage corrections.' });
  }

  try {
    const updated = await JobApplicationModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { stage, updatedAt: new Date() } },
      { new: true }
    ).lean();

    logAuditEvent(req, 'APPLICATION_STAGE_CORRECTED', 'JobApplication', req.params.id, {
      newStage: stage,
      reason,
    });

    return res.json({
      success: true,
      message: `Application stage administratively updated to ${stage}.`,
      application: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update application stage' });
  }
});

// =========================================================================
// 6. CV & DOCUMENT MANAGEMENT
// =========================================================================

// GET /api/v1/admin/documents - List verified candidate CV files
router.get('/documents', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const apps = await JobApplicationModel.find({ resumeUrl: { $exists: true, $ne: '' } }).sort({ appliedAt: -1 }).lean();
    const profiles = await TeacherProfileModel.find({ resumeUrl: { $exists: true, $ne: '' } }).sort({ updatedAt: -1 }).lean();

    const appDocs = await Promise.all(apps.map(async (app) => {
      const teacher: any = await UserModel.findOne({ id: app.teacherId }).lean();
      const job: any = await JobVacancyModel.findOne({ id: app.jobId }).lean();

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
    const profileDocs: any[] = [];

    for (const prof of profiles) {
      if (prof.resumeUrl && !existingUrls.has(prof.resumeUrl)) {
        existingUrls.add(prof.resumeUrl);
        const teacher: any = await UserModel.findOne({ id: prof.userId }).lean();
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load documents' });
  }
});

// =========================================================================
// 7. CATEGORY AND MASTER DATA MANAGEMENT
// =========================================================================

// GET /api/v1/admin/master-data - Fetch platform categories
router.get('/master-data', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    const items = await MasterDataModel.find(filter).sort({ category: 1, order: 1 }).lean();

    return res.json({
      success: true,
      items,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve master data' });
  }
});

// POST /api/v1/admin/master-data - Add new master category entry
router.post('/master-data', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
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

    await MasterDataModel.create(newItem);
    logAuditEvent(req, 'MASTER_DATA_CREATED', 'MasterData', newItem.id, { category, label, value });

    return res.status(201).json({
      success: true,
      message: `New ${category} "${label}" added to platform.`,
      item: newItem,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create master data item' });
  }
});

// PATCH /api/v1/admin/master-data/:id - Edit item / toggle active
router.patch('/master-data/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { label, value, isActive, order } = req.body;

  try {
    const updated = await MasterDataModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { label, value, isActive, order } },
      { new: true }
    ).lean();

    logAuditEvent(req, 'MASTER_DATA_UPDATED', 'MasterData', req.params.id, { label, isActive });

    return res.json({
      success: true,
      message: 'Master data option updated.',
      item: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update master data' });
  }
});

// DELETE /api/v1/admin/master-data/:id - Safe deletion (toggle deactivation)
router.delete('/master-data/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    await MasterDataModel.findOneAndUpdate({ id: req.params.id }, { $set: { isActive: false } });
    logAuditEvent(req, 'MASTER_DATA_DEACTIVATED', 'MasterData', req.params.id, {});

    return res.json({
      success: true,
      message: 'Master data option deactivated to preserve historical consistency.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to deactivate master data' });
  }
});

// =========================================================================
// 8. USER REPORTS & CONTENT MODERATION
// =========================================================================

// GET /api/v1/admin/reports - Queue of reported content
router.get('/reports', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const reports = await UserReportModel.find().sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      total: reports.length,
      reports,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reports' });
  }
});

// POST /api/v1/admin/reports - File a moderation report
router.post('/reports', authenticateJWT, async (req: Request, res: Response) => {
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

    await UserReportModel.create(report);
    logAuditEvent(req, 'CONTENT_REPORTED', 'UserReport', report.id, { targetType, targetId, reason });

    return res.status(201).json({
      success: true,
      message: 'Report submitted for administrator review.',
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to file report' });
  }
});

// PATCH /api/v1/admin/reports/:id - Resolve or dismiss report
router.patch('/reports/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { status, resolutionNotes } = req.body; // 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'

  try {
    const updated = await UserReportModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, resolutionNotes, resolvedBy: req.user?.email } },
      { new: true }
    ).lean();

    logAuditEvent(req, `REPORT_${status}`, 'UserReport', req.params.id, { status, resolutionNotes });

    return res.json({
      success: true,
      message: `Report marked as ${status}.`,
      report: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update report' });
  }
});

// =========================================================================
// 9. PLATFORM NOTIFICATIONS MANAGEMENT
// =========================================================================

// GET /api/v1/admin/notifications - Broadcast history with delivery statistics
router.get('/notifications', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const notifications = await PlatformNotificationModel.find().sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      notifications,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
});

// GET /api/v1/admin/notifications/stats - Notification KPIs & FCM status
router.get('/notifications/stats', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const totalBroadcasts = await PlatformNotificationModel.countDocuments();
    const notifications = await PlatformNotificationModel.find().lean();
    
    let totalAudienceReached = 0;
    let totalDelivered = 0;
    let totalFailed = 0;

    notifications.forEach((n: any) => {
      totalAudienceReached += (n.totalMatchedAudience || 0);
      totalDelivered += (n.successDeliveries || 0);
      totalFailed += (n.failedDeliveries || 0);
    });

    const activeTokensCount = await DeviceTokenModel.countDocuments({ isActive: true });
    const isFcmActive = fcmService.isFcmActive();

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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load notification stats' });
  }
});

// POST /api/v1/admin/notifications/target-count - Live audience estimator based on smart filters
router.post('/notifications/target-count', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const filters = req.body.filters || {};
    const result = await fcmService.findEligibleJobSeekers(filters);

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
  } catch (err: any) {
    console.error('Target count calculation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate target audience.' });
  }
});

// POST /api/v1/admin/notifications/send-smart-push - Dispatch Smart Push Notification via FCM
router.post('/notifications/send-smart-push', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { 
    title, 
    message, 
    actionUrl, 
    filters = {}, 
    priority = 'HIGH',
    targetAudience = 'TEACHERS'
  } = req.body;

  if (!title?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Notification title and message are required.' });
  }

  try {
    const result = await fcmService.dispatchNotification({
      title: title.trim(),
      message: message.trim(),
      actionUrl: actionUrl?.trim() || '/teacher-dashboard',
      priority,
      filters,
      sentBy: req.user?.fullName || req.user?.email || 'Super Admin',
      targetAudience,
    });

    logAuditEvent(req, 'SMART_PUSH_DISPATCHED', 'PlatformNotification', result.notification.id, {
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
  } catch (err: any) {
    console.error('Smart push dispatch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch smart push notification.' });
  }
});

// POST /api/v1/admin/notifications - Legacy broadcast alias routed to Smart Push
router.post('/notifications', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { title, message, targetAudience = 'ALL', actionUrl, filters } = req.body;

  if (!title?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  try {
    const result = await fcmService.dispatchNotification({
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
  }
});

// DELETE /api/v1/admin/notifications/:id - Remove notification from history
router.delete('/notifications/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const deleted = await PlatformNotificationModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification record not found.' });
    }

    logAuditEvent(req, 'NOTIFICATION_DELETED', 'PlatformNotification', req.params.id);
    return res.json({ success: true, message: 'Notification record removed from history.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete notification record.' });
  }
});

// =========================================================================
// 10. ADMIN USERS & PERMISSION MANAGEMENT
// =========================================================================

// GET /api/v1/admin/staff - List administrative staff members
router.get('/staff', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const admins = await UserModel.find({ role: 'ADMIN' }).select('-passwordHash').sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      staff: admins,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin staff' });
  }
});

// POST /api/v1/admin/staff - Add new administrator staff member
router.post('/staff', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { fullName, email, password, adminRole = 'ADMIN', adminPermissions = ['VIEW', 'EDIT'] } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  try {
    const existing = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = bcryptjs.hashSync(password, 10);
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

    await UserModel.create(newStaff);
    logAuditEvent(req, 'ADMIN_STAFF_CREATED', 'User', newStaff.id, { email, adminRole });

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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create admin staff' });
  }
});

// PATCH /api/v1/admin/staff/:id - Update admin permissions or status
router.patch('/staff/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { adminRole, adminPermissions, status } = req.body;

  try {
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id, role: 'ADMIN' },
      { $set: { adminRole, adminPermissions, status, updatedAt: new Date() } },
      { new: true }
    ).select('-passwordHash').lean();

    logAuditEvent(req, 'ADMIN_PERMISSIONS_UPDATED', 'User', req.params.id, { adminRole, status });

    return res.json({
      success: true,
      message: 'Administrator staff permissions updated.',
      staff: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update admin permissions' });
  }
});

// =========================================================================
// 11. PLATFORM SETTINGS
// =========================================================================

// GET /api/v1/admin/settings - Read global platform configuration
router.get('/settings', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const settings = await PlatformSettingModel.find().lean();
    const settingsMap: Record<string, any> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return res.json({
      success: true,
      settings: settingsMap,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve platform settings' });
  }
});

// PUT /api/v1/admin/settings - Save global platform configuration
router.put('/settings', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const updates = req.body; // Key-value map

  try {
    for (const [key, value] of Object.entries(updates)) {
      await PlatformSettingModel.findOneAndUpdate(
        { key },
        { $set: { value, updatedBy: req.user?.email } },
        { upsert: true, new: true }
      );
    }

    logAuditEvent(req, 'PLATFORM_SETTINGS_SAVED', 'PlatformSetting', 'global', updates);

    return res.json({
      success: true,
      message: 'Platform configuration updated successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
});

// =========================================================================
// 12. AUDIT LOGS
// =========================================================================

router.get('/audit-logs', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    let logs: any[] = [];
    try {
      logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
    } catch (e) {
      logs = dbStore.auditLogs;
    }

    return res.json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
});

// =========================================================================
// 13. DATA EXPORTS (CSV / REPORTS)
// =========================================================================

router.get('/export/:type', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { type } = req.params;

  try {
    let csvData = '';
    const now = new Date().toISOString();

    if (type === 'teachers') {
      const teachers = await UserModel.find({ role: 'TEACHER' }).lean();
      csvData = 'ID,Full Name,Email,Phone,Status,Registration Date\n' +
        teachers.map(t => `"${t.id}","${t.fullName}","${t.email}","${t.phone || ''}","${t.status || 'ACTIVE'}","${t.createdAt}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=teachers_report_${Date.now()}.csv`);
      return res.send(csvData);
    }

    if (type === 'employers') {
      const institutions = await InstitutionModel.find().lean();
      csvData = 'ID,Institution Name,Type,City,State,Verification Status,Affiliation\n' +
        institutions.map(i => `"${i.id}","${i.name}","${i.type}","${i.city}","${i.state}","${i.verificationStatus}","${i.affiliationNumber || ''}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=institutions_report_${Date.now()}.csv`);
      return res.send(csvData);
    }

    if (type === 'jobs') {
      const jobs = await JobVacancyModel.find().lean();
      csvData = 'ID,Title,Subject,Level,City,Min Salary,Max Salary,Status,Total Applicants\n' +
        jobs.map(j => `"${j.id}","${j.title}","${j.subject}","${j.teachingLevel}","${j.city}","${j.minSalaryLPA}","${j.maxSalaryLPA}","${j.status}","${j.totalApplicants || 0}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=jobs_report_${Date.now()}.csv`);
      return res.send(csvData);
    }

    if (type === 'applications') {
      const apps = await JobApplicationModel.find().lean();
      csvData = 'ID,Job ID,Teacher ID,Stage,ATS Score,Applied Date\n' +
        apps.map((a: any) => `"${a.id}","${a.jobId}","${a.teacherId}","${a.stage}","${a.matchResult?.overallScore || 0}","${a.appliedAt}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=applications_report_${Date.now()}.csv`);
      return res.send(csvData);
    }

    if (type === 'audit-logs' || type === 'audit') {
      const logs = await AuditLogModel.find().lean();
      csvData = 'ID,Action,User Email,Resource Type,Resource ID,Details,Timestamp\n' +
        logs.map((l: any) => `"${l.id}","${l.action}","${l.userEmail || ''}","${l.resourceType || ''}","${l.resourceId || ''}","${(l.details || '').replace(/"/g, '""')}","${l.createdAt}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit_logs_report_${Date.now()}.csv`);
      return res.send(csvData);
    }

    return res.status(400).json({ success: false, message: 'Invalid export type requested' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Export generation failed' });
  }
});

// =========================================================================
// 14. HR RECRUITMENT & CANDIDATE SHORTLISTING MODULE
// =========================================================================

// POST /api/v1/admin/cv-screening - Advanced multi-filter candidate & CV screening for HR/Admin
router.post('/cv-screening', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const {
      q,
      state,
      city,
      minSalaryLPA,
      maxSalaryLPA,
      teachingLevels,
      subjects,
      qualification,
      minExperience,
      maxExperience,
      boardExperience,
      certifications,
      languages,
      joiningAvailability
    } = req.body;

    // Fetch teachers with profiles
    const teachers = await UserModel.find({ role: 'TEACHER', status: { $ne: 'DEACTIVATED' } }).lean();
    const profiles = await TeacherProfileModel.find().lean();
    const profileMap = new Map<string, any>();
    profiles.forEach((p: any) => profileMap.set(p.userId, p));

    // Also get candidate groups to know which groups each candidate belongs to
    const groups = await CandidateGroupModel.find({ status: 'ACTIVE' }).lean();

    const results = teachers.map((teacher: any) => {
      const prof = profileMap.get(teacher.id) || {};
      const candidateGroups = groups.filter((g: any) => g.candidateIds?.includes(teacher.id)).map((g: any) => ({
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
    }).filter((cand: any) => {
      // 1. Text Search query
      if (q && typeof q === 'string' && q.trim()) {
        const query = q.trim().toLowerCase();
        const matchesQ = 
          cand.fullName.toLowerCase().includes(query) ||
          cand.email.toLowerCase().includes(query) ||
          cand.phone.toLowerCase().includes(query) ||
          cand.headline.toLowerCase().includes(query) ||
          cand.subjects.some((s: string) => s.toLowerCase().includes(query));
        if (!matchesQ) return false;
      }

      // 2. Location: State
      if (state && state !== 'ALL') {
        const stateLower = state.toLowerCase();
        const matchState = (cand.state && cand.state.toLowerCase().includes(stateLower)) ||
          cand.preferredCities.some((c: string) => c.toLowerCase().includes(stateLower));
        if (!matchState) return false;
      }

      // 3. Location: City
      if (city && typeof city === 'string' && city.trim()) {
        const cityLower = city.trim().toLowerCase();
        const matchCity = (cand.currentCity && cand.currentCity.toLowerCase().includes(cityLower)) ||
          cand.preferredCities.some((c: string) => c.toLowerCase().includes(cityLower));
        if (!matchCity) return false;
      }

      // 4. Expected Salary
      if (minSalaryLPA !== undefined && minSalaryLPA !== null && minSalaryLPA !== '') {
        const minLpa = Number(minSalaryLPA);
        if (!isNaN(minLpa) && minLpa > 0 && cand.expectedSalaryLPA < minLpa) return false;
      }
      if (maxSalaryLPA !== undefined && maxSalaryLPA !== null && maxSalaryLPA !== '') {
        const maxLpa = Number(maxSalaryLPA);
        if (!isNaN(maxLpa) && maxLpa > 0 && cand.expectedSalaryLPA > maxLpa) return false;
      }

      // 5. Teaching Level
      if (Array.isArray(teachingLevels) && teachingLevels.length > 0) {
        const hasLevel = teachingLevels.some(lvl => 
          cand.teachingLevels.some((cl: string) => cl.toUpperCase() === lvl.toUpperCase())
        );
        if (!hasLevel) return false;
      }

      // 6. Subject
      if (Array.isArray(subjects) && subjects.length > 0) {
        const hasSub = subjects.some(sub => 
          cand.subjects.some((cs: string) => cs.toLowerCase().includes(sub.toLowerCase()))
        );
        if (!hasSub) return false;
      }

      // 7. Qualification
      if (qualification && typeof qualification === 'string' && qualification.trim()) {
        const qLower = qualification.trim().toLowerCase();
        if (!cand.highestQualification.toLowerCase().includes(qLower)) return false;
      }

      // 8. Experience
      if (minExperience !== undefined && minExperience !== null && minExperience !== '') {
        const minExp = Number(minExperience);
        if (!isNaN(minExp) && cand.experienceYears < minExp) return false;
      }
      if (maxExperience !== undefined && maxExperience !== null && maxExperience !== '') {
        const maxExp = Number(maxExperience);
        if (!isNaN(maxExp) && cand.experienceYears > maxExp) return false;
      }

      // 9. Board Experience
      if (Array.isArray(boardExperience) && boardExperience.length > 0) {
        const hasBoard = boardExperience.some(b => 
          cand.boardExperience.some((cb: string) => cb.toLowerCase().includes(b.toLowerCase()))
        );
        if (!hasBoard) return false;
      }

      // 10. Certifications
      if (Array.isArray(certifications) && certifications.length > 0) {
        const hasCert = certifications.some(cert => 
          cand.certifications.some((cc: string) => cc.toLowerCase().includes(cert.toLowerCase()))
        );
        if (!hasCert) return false;
      }

      // 11. Languages
      if (Array.isArray(languages) && languages.length > 0) {
        const hasLang = languages.some(l => 
          cand.languages.some((cl: string) => cl.toLowerCase().includes(l.toLowerCase()))
        );
        if (!hasLang) return false;
      }

      // 12. Availability
      if (joiningAvailability && joiningAvailability !== 'ALL') {
        if (!cand.joiningAvailability.toLowerCase().includes(joiningAvailability.toLowerCase())) return false;
      }

      return true;
    });

    logAuditEvent(req, 'HR_CV_SCREENING', 'TeacherProfile', 'SEARCH', { 
      matchesFound: results.length,
      filters: req.body 
    });

    return res.json({
      success: true,
      totalMatches: results.length,
      candidates: results,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'CV Screening search failed' });
  }
});

// GET /api/v1/admin/candidate-groups - List all shortlisted candidate groups
router.get('/candidate-groups', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const groups = await CandidateGroupModel.find().sort({ createdAt: -1 }).lean();

    // Enrich groups with candidate details
    const allCandidateIds = Array.from(new Set(groups.flatMap((g: any) => g.candidateIds || [])));
    const teachers = await UserModel.find({ id: { $in: allCandidateIds } }).lean();
    const profiles = await TeacherProfileModel.find({ userId: { $in: allCandidateIds } }).lean();
    const teacherMap = new Map<string, any>();
    teachers.forEach((t: any) => teacherMap.set(t.id, t));
    profiles.forEach((p: any) => {
      const existing = teacherMap.get(p.userId) || {};
      teacherMap.set(p.userId, { ...existing, profile: p });
    });

    const enrichedGroups = groups.map((g: any) => {
      const groupCandidates = (g.candidateIds || []).map((cid: string) => {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidate groups' });
  }
});

// POST /api/v1/admin/candidate-groups - Create named candidate group
router.post('/candidate-groups', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { 
    name, 
    description, 
    targetVacancyId, 
    targetVacancyTitle, 
    targetSubject, 
    targetLevel, 
    targetLocation, 
    candidateIds = [], 
    notes,
    tags = []
  } = req.body;

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
      createdBy: req.user!.id,
      createdByName: req.user!.fullName || 'HR Recruiter',
      createdByRole: req.user!.role,
      tags: Array.isArray(tags) ? tags : [],
    };

    await CandidateGroupModel.create(newGroup);

    logAuditEvent(req, 'HR_GROUP_CREATED', 'CandidateGroup', groupId, {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create candidate group' });
  }
});

// GET /api/v1/admin/candidate-groups/:id - View full group dossier
router.get('/candidate-groups/:id', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const group: any = await CandidateGroupModel.findOne({ id: req.params.id }).lean();
    if (!group) {
      return res.status(404).json({ success: false, message: 'Candidate group not found' });
    }

    const teachers = await UserModel.find({ id: { $in: group.candidateIds || [] } }).lean();
    const profiles = await TeacherProfileModel.find({ userId: { $in: group.candidateIds || [] } }).lean();
    const profileMap = new Map<string, any>();
    profiles.forEach((p: any) => profileMap.set(p.userId, p));

    const enrichedCandidates = teachers.map((t: any) => {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to load group details' });
  }
});

// PATCH /api/v1/admin/candidate-groups/:id - Modify group & add/remove candidates
router.patch('/candidate-groups/:id', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { name, notes, status, targetVacancyTitle, targetLocation, addCandidateIds, removeCandidateId } = req.body;

  try {
    const group: any = await CandidateGroupModel.findOne({ id: req.params.id });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Candidate group not found' });
    }

    if (name) group.name = name.trim();
    if (notes !== undefined) group.notes = notes.trim();
    if (status) group.status = status;
    if (targetVacancyTitle !== undefined) group.targetVacancyTitle = targetVacancyTitle.trim();
    if (targetLocation !== undefined) group.targetLocation = targetLocation.trim();

    if (Array.isArray(addCandidateIds) && addCandidateIds.length > 0) {
      const currentSet = new Set(group.candidateIds || []);
      addCandidateIds.forEach((id: string) => currentSet.add(id));
      group.candidateIds = Array.from(currentSet);
      logAuditEvent(req, 'HR_GROUP_CANDIDATE_ADDED', 'CandidateGroup', group.id, { addedIds: addCandidateIds });
    }

    if (removeCandidateId) {
      group.candidateIds = (group.candidateIds || []).filter((id: string) => id !== removeCandidateId);
      logAuditEvent(req, 'HR_GROUP_CANDIDATE_REMOVED', 'CandidateGroup', group.id, { removedId: removeCandidateId });
    }

    group.updatedAt = new Date();
    await group.save();

    return res.json({
      success: true,
      message: 'Candidate group updated successfully.',
      group,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update candidate group' });
  }
});

// DELETE /api/v1/admin/candidate-groups/:id - Remove candidate group
router.delete('/candidate-groups/:id', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const deleted = await CandidateGroupModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Candidate group not found' });
    }

    logAuditEvent(req, 'HR_GROUP_DELETED', 'CandidateGroup', req.params.id, { name: deleted.name });

    return res.json({
      success: true,
      message: `Candidate group "${deleted.name}" removed successfully.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete candidate group' });
  }
});

// GET /api/v1/admin/candidate-groups/:id/export - Export shortlisted candidates to CSV
router.get('/candidate-groups/:id/export', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const group: any = await CandidateGroupModel.findOne({ id: req.params.id }).lean();
    if (!group) {
      return res.status(404).json({ success: false, message: 'Candidate group not found' });
    }

    const teachers = await UserModel.find({ id: { $in: group.candidateIds || [] } }).lean();
    const profiles = await TeacherProfileModel.find({ userId: { $in: group.candidateIds || [] } }).lean();
    const profileMap = new Map<string, any>();
    profiles.forEach((p: any) => profileMap.set(p.userId, p));

    const csvRows = [
      'Candidate Name,Email,Phone,Current City,Highest Qualification,Experience (Years),Expected Salary (LPA),Teaching Subjects,Teaching Levels,Board Experience,Certifications,Availability,CV File URL'
    ];

    teachers.forEach((t: any) => {
      const p = profileMap.get(t.id) || {};
      const subjectsStr = (p.subjects || []).join('; ');
      const levelsStr = (p.teachingLevels || []).join('; ');
      const boardsStr = (p.boardExperience || []).join('; ');
      const certsStr = (p.certifications || []).join('; ');
      const resumeUrl = p.resumeUrl ? `https://sikchakhub.ai${p.resumeUrl}` : 'No CV uploaded';

      csvRows.push(
        `"${t.fullName}","${t.email}","${t.phone || ''}","${p.currentCity || t.city || ''}","${p.highestQualification || ''}","${p.experienceYears || 0}","${p.expectedSalaryLPA || 0}","${subjectsStr}","${levelsStr}","${boardsStr}","${certsStr}","${p.joiningAvailability || 'Immediate'}","${resumeUrl}"`
      );
    });

    logAuditEvent(req, 'HR_GROUP_EXPORTED', 'CandidateGroup', group.id, {
      groupName: group.name,
      candidatesCount: teachers.length,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Shortlist_${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.csv"`);
    return res.send(csvRows.join('\n'));
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// POST /api/v1/admin/log-cv-view - Log authorized CV review for compliance
router.post('/log-cv-view', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  const { candidateId, candidateName, fileName } = req.body;
  try {
    logAuditEvent(req, 'HR_CV_VIEWED', 'TeacherProfile', candidateId || 'UNKNOWN', {
      candidateName,
      fileName,
      viewedByRole: req.user!.role,
      viewedByName: req.user!.fullName,
    });
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: true });
  }
});

// =========================================================================
// 15. HR ACCOUNTS MANAGEMENT (SUPER ADMIN GOVERNANCE)
// =========================================================================

// GET /api/v1/admin/hr-accounts - List all HR recruiter accounts
router.get('/hr-accounts', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const hrUsers = await UserModel.find({ 
      $or: [{ role: 'HR' }, { adminRole: 'HR' }] 
    }).select('-passwordHash').sort({ createdAt: -1 }).lean();

    const groups = await CandidateGroupModel.find().lean();
    const enriched = hrUsers.map((hr: any) => {
      const hrGroups = groups.filter((g: any) => g.createdBy === hr.id);
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve HR accounts' });
  }
});

// POST /api/v1/admin/hr-accounts - Super Admin provisions new HR Recruiter
router.post('/hr-accounts', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const passwordHash = bcryptjs.hashSync(password, 10);
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

    await UserModel.create(newHr);
    logAuditEvent(req, 'HR_ACCOUNT_CREATED', 'User', newHr.id, { email: normalizedEmail, fullName });

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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create HR account' });
  }
});

// PATCH /api/v1/admin/hr-accounts/:id/status - Activate/Deactivate/Suspend HR account
router.patch('/hr-accounts/:id/status', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['ACTIVE', 'DEACTIVATED', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value.' });
  }

  try {
    const updated = await UserModel.findOneAndUpdate(
      { id: req.params.id, $or: [{ role: 'HR' }, { adminRole: 'HR' }] },
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    ).select('-passwordHash').lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'HR account not found.' });
    }

    logAuditEvent(req, 'HR_ACCOUNT_STATUS_CHANGED', 'User', req.params.id, { status });

    return res.json({
      success: true,
      message: `HR account marked as ${status}.`,
      hrAccount: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update HR status' });
  }
});

// DELETE /api/v1/admin/hr-accounts/:id - Remove HR account
router.delete('/hr-accounts/:id', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const deleted = await UserModel.findOneAndDelete({
      id: req.params.id,
      $or: [{ role: 'HR' }, { adminRole: 'HR' }]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'HR account not found' });
    }

    logAuditEvent(req, 'HR_ACCOUNT_DELETED', 'User', req.params.id, { email: deleted.email });

    return res.json({
      success: true,
      message: `HR account "${deleted.fullName}" removed.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete HR account' });
  }
});

// =========================================================================
// SUBSCRIPTION & ACCESS MANAGEMENT (SUPER ADMIN)
// =========================================================================

// GET /api/v1/admin/subscriptions/summary - Overview KPI statistics
router.get('/subscriptions/summary', authenticateJWT, requireRole(['ADMIN', 'HR']), async (_req: Request, res: Response) => {
  try {
    const totalPosters = await UserModel.countDocuments({ role: 'EMPLOYER' });
    const globalFreeLimit = await getGlobalFreeApplicantLimit();

    let allSubscriptions: any[] = [];
    try {
      allSubscriptions = await SubscriptionModel.find().lean();
    } catch (e) {
      allSubscriptions = dbStore.subscriptions;
    }

    let premiumActiveCount = 0;
    let freeTierCount = 0;
    let totalRevenue = 0;

    allSubscriptions.forEach(sub => {
      if (sub.hasUnlimitedAccess === true && sub.status === 'ACTIVE') {
        premiumActiveCount++;
      } else {
        freeTierCount++;
      }
    });

    // Calculate posters without a subscription record yet as Free tier
    if (totalPosters > (premiumActiveCount + freeTierCount)) {
      freeTierCount += (totalPosters - (premiumActiveCount + freeTierCount));
    }

    try {
      const payments = await PaymentRecordModel.find({ status: 'SUCCESS' }).lean();
      totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    } catch (e) {
      totalRevenue = dbStore.payments
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
  } catch (err: any) {
    console.error('Subscription summary fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscription summary.' });
  }
});

// GET /api/v1/admin/subscriptions/posters - List all job posters with subscription status & applicant access counts
router.get('/subscriptions/posters', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const { q, plan, status } = req.query;
    const globalFreeLimit = await getGlobalFreeApplicantLimit();

    // 1. Fetch all employers
    let employers: any[] = [];
    try {
      employers = await UserModel.find({ role: 'EMPLOYER' }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      employers = dbStore.users.filter(u => u.role === 'EMPLOYER');
    }

    // 2. Fetch institutions
    let institutions: any[] = [];
    try {
      institutions = await InstitutionModel.find().lean();
    } catch (e) {
      institutions = dbStore.institutions;
    }
    const instMap = new Map<string, any>();
    institutions.forEach(inst => instMap.set(inst.ownerId, inst));

    // 3. For each employer, construct subscription & access profile
    const posterList = await Promise.all(employers.map(async (emp: any) => {
      const inst = instMap.get(emp.id);
      const sub: any = await getOrInitEmployerSubscription(emp.id, inst?.id);

      let jobsCount = 0;
      let totalApplicants = 0;
      let targetJobIds: string[] = [];

      if (inst) {
        try {
          const jobs = await JobVacancyModel.find({ institutionId: inst.id }).select('id').lean();
          jobsCount = jobs.length;
          targetJobIds = jobs.map(j => j.id);
        } catch (e) {
          const jobs = dbStore.jobs.filter(j => j.institutionId === inst.id);
          jobsCount = jobs.length;
          targetJobIds = jobs.map(j => j.id);
        }

        if (targetJobIds.length > 0) {
          try {
            totalApplicants = await JobApplicationModel.countDocuments({ jobId: { $in: targetJobIds } });
          } catch (e) {
            totalApplicants = dbStore.applications.filter(a => targetJobIds.includes(a.jobId)).length;
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
      filtered = filtered.filter(p => 
        p.fullName?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.institutionName?.toLowerCase().includes(query) ||
        p.phone?.toLowerCase().includes(query)
      );
    }

    if (plan && plan !== 'ALL') {
      filtered = filtered.filter(p => p.subscription.plan === plan);
    }

    if (status && status !== 'ALL') {
      if (status === 'PREMIUM_ACTIVE') {
        filtered = filtered.filter(p => p.subscription.hasUnlimitedAccess === true);
      } else if (status === 'FREE') {
        filtered = filtered.filter(p => !p.subscription.hasUnlimitedAccess);
      } else {
        filtered = filtered.filter(p => p.subscription.status === status);
      }
    }

    return res.json({
      success: true,
      total: filtered.length,
      posters: filtered,
    });
  } catch (err: any) {
    console.error('Fetch posters subscriptions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve job poster subscriptions.' });
  }
});

// PATCH /api/v1/admin/subscriptions/:userId/grant-access - Manually grant or revoke full application access
router.patch('/subscriptions/:userId/grant-access', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { hasUnlimitedAccess, adminNotes } = req.body;

  if (typeof hasUnlimitedAccess !== 'boolean') {
    return res.status(400).json({ success: false, message: 'hasUnlimitedAccess (boolean) is required.' });
  }

  try {
    const user = await UserModel.findOne({ id: userId });
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

    let updatedSub = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { 
        $set: updateDoc,
        $setOnInsert: { id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, userId }
      },
      { new: true, upsert: true }
    ).lean();

    logAuditEvent(req, hasUnlimitedAccess ? 'ADMIN_ACCESS_GRANTED' : 'ADMIN_ACCESS_REVOKED', 'Subscription', (updatedSub as any)?.id || userId, {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update access permissions.' });
  }
});

// PATCH /api/v1/admin/subscriptions/:userId/plan - Upgrade or downgrade a Job Poster's plan
router.patch('/subscriptions/:userId/plan', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { plan, durationDays, adminNotes } = req.body;

  if (!plan || !['FREE', 'PRO_MONTHLY', 'ANNUAL_ENTERPRISE', 'CUSTOM_ADMIN'].includes(plan)) {
    return res.status(400).json({ success: false, message: 'Valid plan (FREE, PRO_MONTHLY, ANNUAL_ENTERPRISE, CUSTOM_ADMIN) is required.' });
  }

  try {
    const user = await UserModel.findOne({ id: userId });
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

    const updatedSub = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { 
        $set: updateDoc,
        $setOnInsert: { id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`, userId }
      },
      { new: true, upsert: true }
    ).lean();

    logAuditEvent(req, 'ADMIN_SUBSCRIPTION_PLAN_CHANGED', 'Subscription', (updatedSub as any)?.id || userId, {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update subscription plan.' });
  }
});

// PATCH /api/v1/admin/subscriptions/:userId/free-limit - Custom free limit for specific poster
router.patch('/subscriptions/:userId/free-limit', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { freeLimitPerJob } = req.body;

  if (typeof freeLimitPerJob !== 'number' || freeLimitPerJob < 0) {
    return res.status(400).json({ success: false, message: 'freeLimitPerJob must be a non-negative number.' });
  }

  try {
    const updatedSub = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { $set: { freeLimitPerJob } },
      { new: true, upsert: true }
    ).lean();

    logAuditEvent(req, 'ADMIN_FREE_LIMIT_UPDATED', 'Subscription', (updatedSub as any)?.id || userId, {
      userId,
      freeLimitPerJob,
    });

    return res.json({
      success: true,
      message: `Free application limit updated to ${freeLimitPerJob} per vacancy for this user.`,
      subscription: updatedSub,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update free applicant limit.' });
  }
});

// PATCH /api/v1/admin/subscriptions/:userId/status - Enable, suspend, or activate access
router.patch('/subscriptions/:userId/status', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!status || !['ACTIVE', 'SUSPENDED', 'EXPIRED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Choose ACTIVE, SUSPENDED, or EXPIRED.' });
  }

  try {
    const currentSub = await SubscriptionModel.findOne({ userId });
    const hasUnlimited = (status === 'ACTIVE') && (currentSub ? currentSub.plan !== 'FREE' : false);

    const updatedSub = await SubscriptionModel.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          status,
          hasUnlimitedAccess: hasUnlimited,
          updatedAt: new Date()
        } 
      },
      { new: true }
    ).lean();

    logAuditEvent(req, 'ADMIN_SUBSCRIPTION_STATUS_CHANGED', 'Subscription', (updatedSub as any)?.id || userId, {
      userId,
      status,
    });

    return res.json({
      success: true,
      message: `Subscription access set to ${status}.`,
      subscription: updatedSub,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update subscription status.' });
  }
});

// GET & PUT /api/v1/admin/subscriptions/settings/free-limit - Platform-wide default free application limit
router.get('/subscriptions/settings/free-limit', authenticateJWT, requireRole(['ADMIN']), async (_req: Request, res: Response) => {
  try {
    const limit = await getGlobalFreeApplicantLimit();
    return res.json({ success: true, freeLimitPerJob: limit });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve limit setting.' });
  }
});

router.put('/subscriptions/settings/free-limit', authenticateJWT, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  const { freeLimitPerJob } = req.body;
  if (typeof freeLimitPerJob !== 'number' || freeLimitPerJob < 1) {
    return res.status(400).json({ success: false, message: 'freeLimitPerJob must be at least 1.' });
  }

  try {
    await PlatformSettingModel.findOneAndUpdate(
      { key: 'freeApplicantLimitPerJob' },
      { 
        $set: { 
          value: freeLimitPerJob,
          description: 'Default free application view limit per job vacancy',
          category: 'SUBSCRIPTION',
          updatedBy: req.user!.email,
          updatedAt: new Date()
        },
        $setOnInsert: { id: `set-free-limit-${Date.now()}`, key: 'freeApplicantLimitPerJob' }
      },
      { upsert: true }
    );

    logAuditEvent(req, 'GLOBAL_FREE_LIMIT_UPDATED', 'PlatformSetting', 'freeApplicantLimitPerJob', {
      freeLimitPerJob,
    });

    return res.json({
      success: true,
      message: `Platform default free applicant limit updated to ${freeLimitPerJob} applications per vacancy.`,
      freeLimitPerJob,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to save global free applicant limit.' });
  }
});

// GET /api/v1/admin/subscriptions/payments - View all subscription payments & transactions
router.get('/subscriptions/payments', authenticateJWT, requireRole(['ADMIN', 'HR']), async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    let payments: any[] = [];
    try {
      payments = await PaymentRecordModel.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      payments = dbStore.payments;
    }

    // Populate user and institution details
    const populated = await Promise.all(payments.map(async p => {
      let user: any = null;
      try {
        user = await UserModel.findOne({ id: p.userId }).select('fullName email phone').lean();
      } catch (e) {}
      if (!user) user = dbStore.getUserById(p.userId);

      let inst: any = null;
      if (p.institutionId) {
        try {
          inst = await InstitutionModel.findOne({ id: p.institutionId }).select('name city').lean();
        } catch (e) {}
        if (!inst) inst = dbStore.getInstitutionById(p.institutionId);
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
      results = results.filter(r => 
        r.paymentId?.toLowerCase().includes(query) ||
        r.userName?.toLowerCase().includes(query) ||
        r.userEmail?.toLowerCase().includes(query) ||
        r.plan?.toLowerCase().includes(query) ||
        r.institutionName?.toLowerCase().includes(query)
      );
    }

    return res.json({
      success: true,
      total: results.length,
      payments: results,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve payment records.' });
  }
});

export default router;
