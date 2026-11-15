"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRecordModel = exports.OtpVerificationModel = exports.SubscriptionModel = exports.CandidateGroupModel = exports.PlatformSettingModel = exports.UserReportModel = exports.UserInboxNotificationModel = exports.DeviceTokenModel = exports.PlatformNotificationModel = exports.MasterDataModel = exports.AuditLogModel = exports.InterviewModel = exports.JobApplicationModel = exports.JobVacancyModel = exports.InstitutionModel = exports.TeacherProfileModel = exports.UserModel = void 0;
exports.getGlobalFreeApplicantLimit = getGlobalFreeApplicantLimit;
exports.getOrInitEmployerSubscription = getOrInitEmployerSubscription;
exports.seedDefaultAdminIfNeeded = seedDefaultAdminIfNeeded;
exports.connectMongoDB = connectMongoDB;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// User Schema
const UserSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['TEACHER', 'EMPLOYER', 'ADMIN', 'HR'], default: 'TEACHER' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'], default: 'ACTIVE' },
    adminRole: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT', 'ANALYST', 'HR'], default: 'SUPER_ADMIN' },
    adminPermissions: [{ type: String }],
    phone: { type: String },
    age: { type: Number },
    gender: { type: String },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
        type: String,
        enum: ['PENDING_VERIFICATION', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'FULLY_VERIFIED', 'TEMPORARILY_BLOCKED'],
        default: 'PENDING_VERIFICATION'
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    phoneVerifiedAt: { type: Date },
}, { timestamps: true });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
// Teacher Profile Schema
const TeacherProfileSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    headline: { type: String },
    bio: { type: String },
    age: { type: Number },
    gender: { type: String },
    experienceYears: { type: Number, default: 0 },
    highestQualification: { type: String },
    degree: { type: String },
    teachingLevels: [{ type: String }],
    classesTaught: [{ type: String }],
    subjects: [{ type: String }],
    previousSchool: { type: String },
    boards: [{ type: String }],
    currentCity: { type: String },
    preferredCities: [{ type: String }],
    isWillingToRelocate: { type: Boolean, default: false },
    currentSalaryLPA: { type: Number },
    expectedSalaryLPA: { type: Number },
    expectedSalary: { type: String },
    noticePeriodDays: { type: Number, default: 30 },
    joiningAvailability: { type: String, default: 'Immediate' },
    resumeUrl: { type: String },
    resumeFileName: { type: String },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    languages: [{ type: String }],
    profileCompletionScore: { type: Number, default: 60 },
    streakDays: { type: Number, default: 1 },
}, { timestamps: true });
TeacherProfileSchema.index({ currentCity: 1 });
TeacherProfileSchema.index({ experienceYears: 1 });
// Institution Schema
const InstitutionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, default: 'SCHOOL' },
    logoUrl: { type: String },
    website: { type: String },
    description: { type: String },
    affiliationNumber: { type: String },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    board: { type: String },
    udiseCode: { type: String },
    registrationNumber: { type: String },
    certificateUrl: { type: String },
    certificateFileName: { type: String },
    termsAccepted: { type: Boolean, default: true },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'], default: 'PENDING' },
    verificationNotes: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    establishedYear: { type: Number },
}, { timestamps: true });
InstitutionSchema.index({ ownerId: 1 });
InstitutionSchema.index({ verificationStatus: 1 });
InstitutionSchema.index({ city: 1, type: 1 });
// Job Vacancy Schema
const JobVacancySchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    institutionId: { type: String, required: true },
    title: { type: String, required: true },
    department: { type: String },
    subject: { type: String, required: true },
    additionalSubjects: [{ type: String }],
    teachingLevel: { type: String, required: true },
    board: { type: String, required: true },
    employmentType: { type: String, default: 'FULL_TIME' },
    minExperienceYears: { type: Number, default: 1 },
    maxExperienceYears: { type: Number },
    requiredQualification: { type: String },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    benefits: [{ type: String }],
    minSalaryLPA: { type: Number, required: true },
    maxSalaryLPA: { type: Number, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    vacanciesCount: { type: Number, default: 1 },
    deadline: { type: String, required: true },
    status: { type: String, enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'CLOSED', 'REJECTED'], default: 'PENDING_APPROVAL' },
    customFields: { type: mongoose_1.default.Schema.Types.Mixed, default: [] },
    screeningRules: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
    requireResume: { type: Boolean, default: true },
    syllabusDocumentUrl: { type: String },
    syllabusDocumentName: { type: String },
    totalApplicants: { type: Number, default: 0 },
}, { timestamps: true });
JobVacancySchema.index({ status: 1, createdAt: -1 });
JobVacancySchema.index({ institutionId: 1, status: 1 });
JobVacancySchema.index({ status: 1, subject: 1, city: 1 });
JobVacancySchema.index({ deadline: 1 });
// Job Application Schema
const JobApplicationSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    jobId: { type: String, required: true },
    teacherId: { type: String, required: true },
    resumeUrl: { type: String },
    resumeFileName: { type: String },
    coverLetter: { type: String },
    stage: {
        type: String,
        enum: ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED', 'ON_HOLD'],
        default: 'APPLIED'
    },
    customAnswers: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
    matchResult: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
    recruiterNotes: { type: String },
    appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });
JobApplicationSchema.index({ jobId: 1, appliedAt: 1 });
JobApplicationSchema.index({ teacherId: 1, appliedAt: -1 });
JobApplicationSchema.index({ jobId: 1, stage: 1 });
JobApplicationSchema.index({ jobId: 1, teacherId: 1 });
// Interview Schema
const InterviewSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    applicationId: { type: String, required: true },
    jobId: { type: String, required: true },
    teacherId: { type: String, required: true },
    institutionId: { type: String, required: true },
    interviewType: { type: String, default: 'DEMO_CLASS' },
    scheduledTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 45 },
    meetingLink: { type: String },
    locationDetails: { type: String },
    status: { type: String, default: 'SCHEDULED' },
    feedback: { type: String },
    rating: { type: Number },
}, { timestamps: true });
InterviewSchema.index({ applicationId: 1 });
InterviewSchema.index({ teacherId: 1, scheduledTime: 1 });
InterviewSchema.index({ institutionId: 1, scheduledTime: 1 });
// Audit Log Schema
const AuditLogSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String },
    userEmail: { type: String },
    action: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
// Master Data Schema
const MasterDataSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['SUBJECT', 'TEACHING_CATEGORY', 'QUALIFICATION', 'BOARD', 'EMPLOYMENT_TYPE', 'EXPERIENCE_RANGE', 'STATE', 'CITY'],
        required: true
    },
    label: { type: String, required: true },
    value: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    metadata: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
MasterDataSchema.index({ category: 1, isActive: 1, order: 1 });
// Platform Notification Schema (Upgraded for Location-Based & Smart Push System)
const PlatformNotificationSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionUrl: { type: String },
    targetAudience: { type: String, enum: ['ALL', 'TEACHERS', 'EMPLOYERS', 'ADMINS'], default: 'TEACHERS' },
    type: { type: String, enum: ['ANNOUNCEMENT', 'MAINTENANCE', 'RECRUITMENT', 'SECURITY', 'SMART_PUSH'], default: 'SMART_PUSH' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    filters: {
        state: { type: String },
        city: { type: String },
        minSalaryLPA: { type: Number },
        maxSalaryLPA: { type: Number },
        teachingLevels: [{ type: String }],
        subjects: [{ type: String }],
        minExperienceYears: { type: Number },
        maxExperienceYears: { type: Number },
        isFresherOnly: { type: Boolean, default: false },
    },
    totalMatchedAudience: { type: Number, default: 0 },
    successDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    fcmSent: { type: Boolean, default: false },
    deliveryDetails: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
    sentBy: { type: String, default: 'Super Admin' },
    status: { type: String, enum: ['SENT', 'DELIVERED', 'PARTIAL', 'FAILED', 'SCHEDULED', 'DRAFT'], default: 'DELIVERED' },
}, { timestamps: true });
PlatformNotificationSchema.index({ createdAt: -1 });
PlatformNotificationSchema.index({ targetAudience: 1, status: 1 });
// Device FCM Token Schema (Store device FCM tokens, platform, active status)
const DeviceTokenSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    userRole: { type: String, enum: ['TEACHER', 'EMPLOYER', 'ADMIN'], default: 'TEACHER' },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['WEB', 'ANDROID', 'IOS'], default: 'WEB' },
    userAgent: { type: String },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now },
}, { timestamps: true });
DeviceTokenSchema.index({ userId: 1, isActive: 1 });
// User Inbox Notification Schema (In-app delivery for teachers/job seekers)
const UserInboxNotificationSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    broadcastId: { type: String, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    actionUrl: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
}, { timestamps: true });
UserInboxNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// User Reports & Moderation Schema
const UserReportSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    reporterEmail: { type: String, required: true },
    targetType: { type: String, enum: ['JOB', 'INSTITUTION', 'TEACHER', 'APPLICATION'], required: true },
    targetId: { type: String, required: true },
    targetTitle: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'], default: 'PENDING' },
    resolutionNotes: { type: String },
    resolvedBy: { type: String },
}, { timestamps: true });
UserReportSchema.index({ status: 1, createdAt: -1 });
// Platform Settings Schema
const PlatformSettingSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true },
    value: { type: mongoose_1.default.Schema.Types.Mixed, required: true },
    description: { type: String },
    category: { type: String, default: 'GENERAL' },
    updatedBy: { type: String },
}, { timestamps: true });
// HR Candidate Shortlist Group Schema
const CandidateGroupSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g., "PGT Physics – Delhi Vacancy"
    description: { type: String },
    targetVacancyId: { type: String },
    targetVacancyTitle: { type: String },
    targetSubject: { type: String },
    targetLevel: { type: String },
    targetLocation: { type: String },
    candidateIds: [{ type: String }], // userIds of shortlisted teachers
    notes: { type: String },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'], default: 'ACTIVE' },
    createdBy: { type: String, required: true }, // userId of HR or Admin
    createdByName: { type: String, required: true },
    createdByRole: { type: String, enum: ['ADMIN', 'HR'], default: 'HR' },
    tags: [{ type: String }],
}, { timestamps: true });
CandidateGroupSchema.index({ createdBy: 1, status: 1 });
// Job Poster Subscription Schema
const SubscriptionSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    institutionId: { type: String },
    plan: {
        type: String,
        enum: ['FREE', 'PRO_MONTHLY', 'ANNUAL_ENTERPRISE', 'CUSTOM_ADMIN'],
        default: 'FREE'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
        default: 'ACTIVE'
    },
    freeLimitPerJob: { type: Number, default: 5 },
    hasUnlimitedAccess: { type: Boolean, default: false },
    startDate: { type: String, default: () => new Date().toISOString() },
    endDate: { type: String, default: () => new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString() },
    amountPaid: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'FAILED', 'N/A'], default: 'N/A' },
    lastPaymentId: { type: String },
    grantedByAdmin: { type: Boolean, default: false },
    adminNotes: { type: String },
}, { timestamps: true });
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, hasUnlimitedAccess: 1 });
// Payment Record Schema
const PaymentRecordSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    subscriptionId: { type: String },
    userId: { type: String, required: true, index: true },
    institutionId: { type: String },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentGateway: {
        type: String,
        enum: ['DIRECT_PAY', 'RAZORPAY_SANDBOX', 'MANUAL_ADMIN'],
        default: 'DIRECT_PAY'
    },
    paymentId: { type: String, required: true },
    status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED'], default: 'SUCCESS' },
}, { timestamps: true });
PaymentRecordSchema.index({ userId: 1, createdAt: -1 });
PaymentRecordSchema.index({ status: 1 });
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
exports.TeacherProfileModel = mongoose_1.default.models.TeacherProfile || mongoose_1.default.model('TeacherProfile', TeacherProfileSchema);
exports.InstitutionModel = mongoose_1.default.models.Institution || mongoose_1.default.model('Institution', InstitutionSchema);
exports.JobVacancyModel = mongoose_1.default.models.JobVacancy || mongoose_1.default.model('JobVacancy', JobVacancySchema);
exports.JobApplicationModel = mongoose_1.default.models.JobApplication || mongoose_1.default.model('JobApplication', JobApplicationSchema);
exports.InterviewModel = mongoose_1.default.models.Interview || mongoose_1.default.model('Interview', InterviewSchema);
exports.AuditLogModel = mongoose_1.default.models.AuditLog || mongoose_1.default.model('AuditLog', AuditLogSchema);
exports.MasterDataModel = mongoose_1.default.models.MasterData || mongoose_1.default.model('MasterData', MasterDataSchema);
exports.PlatformNotificationModel = mongoose_1.default.models.PlatformNotification || mongoose_1.default.model('PlatformNotification', PlatformNotificationSchema);
exports.DeviceTokenModel = mongoose_1.default.models.DeviceToken || mongoose_1.default.model('DeviceToken', DeviceTokenSchema);
exports.UserInboxNotificationModel = mongoose_1.default.models.UserInboxNotification || mongoose_1.default.model('UserInboxNotification', UserInboxNotificationSchema);
exports.UserReportModel = mongoose_1.default.models.UserReport || mongoose_1.default.model('UserReport', UserReportSchema);
exports.PlatformSettingModel = mongoose_1.default.models.PlatformSetting || mongoose_1.default.model('PlatformSetting', PlatformSettingSchema);
exports.CandidateGroupModel = mongoose_1.default.models.CandidateGroup || mongoose_1.default.model('CandidateGroup', CandidateGroupSchema);
exports.SubscriptionModel = mongoose_1.default.models.Subscription || mongoose_1.default.model('Subscription', SubscriptionSchema);
// OTP Verification Schema (Strict rate limiting, secure hash, single-use)
const OtpVerificationSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    channel: { type: String, enum: ['EMAIL', 'PHONE'], required: true },
    identifier: { type: String, required: true }, // email or phone
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    resendCooldownUntil: { type: Date },
    sendCount24h: { type: Number, default: 1 },
    firstSendAt24h: { type: Date, default: Date.now },
    failedAttempts: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: { type: Date },
    isConsumed: { type: Boolean, default: false },
    consumedAt: { type: Date },
}, { timestamps: true });
OtpVerificationSchema.index({ userId: 1, channel: 1 });
OtpVerificationSchema.index({ identifier: 1, channel: 1 });
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
exports.OtpVerificationModel = mongoose_1.default.models.OtpVerification || mongoose_1.default.model('OtpVerification', OtpVerificationSchema);
exports.PaymentRecordModel = mongoose_1.default.models.PaymentRecord || mongoose_1.default.model('PaymentRecord', PaymentRecordSchema);
async function getGlobalFreeApplicantLimit() {
    try {
        const setting = await exports.PlatformSettingModel.findOne({ key: 'freeApplicantLimitPerJob' }).lean();
        if (setting && typeof setting.value === 'number') {
            return setting.value;
        }
    }
    catch (err) { }
    return 5;
}
async function getOrInitEmployerSubscription(userId, institutionId) {
    try {
        let sub = await exports.SubscriptionModel.findOne({ userId }).lean();
        const globalLimit = await getGlobalFreeApplicantLimit();
        if (sub) {
            // Check expiration if paid
            if (sub.status === 'ACTIVE' && sub.plan !== 'FREE' && !sub.grantedByAdmin) {
                const isExpired = new Date(sub.endDate).getTime() < Date.now();
                if (isExpired) {
                    await exports.SubscriptionModel.updateOne({ id: sub.id }, {
                        $set: {
                            status: 'EXPIRED',
                            hasUnlimitedAccess: false
                        }
                    });
                    sub = { ...sub, status: 'EXPIRED', hasUnlimitedAccess: false };
                }
            }
            return sub;
        }
        // Initialize default free subscription
        const defaultSub = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            userId,
            institutionId: institutionId || undefined,
            plan: 'FREE',
            status: 'ACTIVE',
            freeLimitPerJob: globalLimit,
            hasUnlimitedAccess: false,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString(),
            amountPaid: 0,
            paymentStatus: 'N/A',
            grantedByAdmin: false,
        };
        await exports.SubscriptionModel.create(defaultSub);
        return defaultSub;
    }
    catch (err) {
        console.error('Error fetching/initializing subscription:', err);
        return {
            id: `sub_mem_${userId}`,
            userId,
            institutionId,
            plan: 'FREE',
            status: 'ACTIVE',
            freeLimitPerJob: 5,
            hasUnlimitedAccess: false,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString(),
            amountPaid: 0,
            paymentStatus: 'N/A',
            grantedByAdmin: false,
        };
    }
}
async function seedDefaultAdminIfNeeded() {
    try {
        const adminEmail = 'sikchakhub@gmail.com';
        const legacyAdmin = await exports.UserModel.findOne({ email: 'SikchakHub@gmail.com' });
        if (legacyAdmin) {
            await exports.UserModel.updateOne({ _id: legacyAdmin._id }, {
                $set: {
                    email: adminEmail,
                    fullName: 'SikchaKhub Super Admin',
                    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SikchaKhubAdmin',
                },
            });
        }
        const existingAdmin = await exports.UserModel.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const passwordHash = bcryptjs_1.default.hashSync('admin@12345', 10);
            const adminDoc = {
                id: `admin-${Date.now()}`,
                email: adminEmail,
                passwordHash,
                fullName: 'SikchaKhub Super Admin',
                role: 'ADMIN',
                adminRole: 'SUPER_ADMIN',
                adminPermissions: ['ALL'],
                phone: '9783143866',
                age: 32,
                avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SikchaKhubAdmin',
                isVerified: true,
                verificationStatus: 'FULLY_VERIFIED',
                emailVerified: true,
                phoneVerified: true,
            };
            await exports.UserModel.create(adminDoc);
            console.log('✅ Default Super Admin seeded in MongoDB: sikchakhub@gmail.com / admin@12345');
        }
        // Seed Master Data if empty
        const masterDataCount = await exports.MasterDataModel.countDocuments();
        if (masterDataCount === 0) {
            const initialItems = [
                // Subjects
                { category: 'SUBJECT', label: 'Mathematics', value: 'Mathematics', order: 1 },
                { category: 'SUBJECT', label: 'Physics', value: 'Physics', order: 2 },
                { category: 'SUBJECT', label: 'Chemistry', value: 'Chemistry', order: 3 },
                { category: 'SUBJECT', label: 'Biology', value: 'Biology', order: 4 },
                { category: 'SUBJECT', label: 'English', value: 'English', order: 5 },
                { category: 'SUBJECT', label: 'Hindi', value: 'Hindi', order: 6 },
                { category: 'SUBJECT', label: 'Computer Science & AI', value: 'Computer Science', order: 7 },
                { category: 'SUBJECT', label: 'Social Science / History', value: 'Social Science', order: 8 },
                { category: 'SUBJECT', label: 'Economics', value: 'Economics', order: 9 },
                { category: 'SUBJECT', label: 'Commerce & Accountancy', value: 'Commerce & Accountancy', order: 10 },
                { category: 'SUBJECT', label: 'Special Education', value: 'Special Education', order: 11 },
                // Teaching Categories
                { category: 'TEACHING_CATEGORY', label: 'PRT - Primary Teacher (Grades 1-5)', value: 'PRT', order: 1 },
                { category: 'TEACHING_CATEGORY', label: 'TGT - Trained Graduate Teacher (Grades 6-10)', value: 'TGT', order: 2 },
                { category: 'TEACHING_CATEGORY', label: 'PGT - Post Graduate Teacher (Grades 11-12)', value: 'PGT', order: 3 },
                { category: 'TEACHING_CATEGORY', label: 'IIT-JEE Coaching Faculty', value: 'COACHING_JEE', order: 4 },
                { category: 'TEACHING_CATEGORY', label: 'NEET Medical Faculty', value: 'COACHING_NEET', order: 5 },
                { category: 'TEACHING_CATEGORY', label: 'Principal / Vice Principal', value: 'PRINCIPAL', order: 6 },
                { category: 'TEACHING_CATEGORY', label: 'College / University Professor', value: 'COLLEGE_PROFESSOR', order: 7 },
                { category: 'TEACHING_CATEGORY', label: 'Academic Coordinator', value: 'ADMINISTRATOR', order: 8 },
                // Qualifications
                { category: 'QUALIFICATION', label: 'B.Ed / Post Graduate', value: 'B.Ed / Post Graduate', order: 1 },
                { category: 'QUALIFICATION', label: 'B.Tech / M.Tech in CS/Engineering', value: 'B.Tech / M.Tech', order: 2 },
                { category: 'QUALIFICATION', label: 'M.Sc / B.Sc in Pure Sciences', value: 'M.Sc / B.Sc', order: 3 },
                { category: 'QUALIFICATION', label: 'Ph.D / Doctorate', value: 'Ph.D', order: 4 },
                { category: 'QUALIFICATION', label: 'M.Ed (Master of Education)', value: 'M.Ed', order: 5 },
                { category: 'QUALIFICATION', label: 'Diploma in Elementary Education (D.El.Ed)', value: 'D.El.Ed', order: 6 },
                // Boards
                { category: 'BOARD', label: 'CBSE (Central Board of Secondary Education)', value: 'CBSE', order: 1 },
                { category: 'BOARD', label: 'CISCE / ICSE / ISC', value: 'ICSE', order: 2 },
                { category: 'BOARD', label: 'Cambridge Assessment International (IGCSE)', value: 'CAMBRIDGE', order: 3 },
                { category: 'BOARD', label: 'IB (International Baccalaureate)', value: 'IB', order: 4 },
                { category: 'BOARD', label: 'State Educational Board', value: 'STATE_BOARD', order: 5 },
                { category: 'BOARD', label: 'Coaching / Higher Education / Other', value: 'OTHER', order: 6 },
            ];
            const docs = initialItems.map((item, idx) => ({
                id: `md-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
                ...item,
                isActive: true,
            }));
            await exports.MasterDataModel.insertMany(docs);
            console.log('✅ Initial platform Master Data seeded in MongoDB.');
        }
        // Seed Platform Settings if empty
        const settingsCount = await exports.PlatformSettingModel.countDocuments();
        if (settingsCount === 0) {
            const initialSettings = [
                { id: 'set-1', key: 'siteName', value: 'SikchaKhub.AI', description: 'Platform brand name', category: 'BRANDING' },
                { id: 'set-2', key: 'supportEmail', value: 'support@sikchakhub.ai', description: 'Primary support and inquiry email', category: 'CONTACT' },
                { id: 'set-3', key: 'supportPhone', value: '+91 9783143866', description: 'Helpline mobile number', category: 'CONTACT' },
                { id: 'set-4', key: 'maxCvUploadSizeMB', value: 1, description: 'Maximum allowed candidate PDF CV size in Megabytes', category: 'UPLOADS' },
                { id: 'set-5', key: 'maintenanceMode', value: false, description: 'Toggle platform maintenance mode', category: 'SYSTEM' },
                { id: 'set-6', key: 'autoApproveJobs', value: true, description: 'Automatically publish vacancies without moderation queue', category: 'MODERATION' },
                { id: 'set-7', key: 'freeApplicantLimitPerJob', value: 5, description: 'Default free application view limit per job vacancy', category: 'SUBSCRIPTION' },
            ];
            await exports.PlatformSettingModel.insertMany(initialSettings);
            console.log('✅ Initial Platform Settings seeded in MongoDB.');
        }
        else {
            await exports.PlatformSettingModel.updateMany({ value: { $in: ['SikchaKhub.AI', 'SikchaKhub.AI'] } }, { $set: { value: 'SikchaKhub.AI' } });
            const freeLimitSetting = await exports.PlatformSettingModel.findOne({ key: 'freeApplicantLimitPerJob' });
            if (!freeLimitSetting) {
                await exports.PlatformSettingModel.create({
                    id: `set-free-limit-${Date.now()}`,
                    key: 'freeApplicantLimitPerJob',
                    value: 5,
                    description: 'Default free application view limit per job vacancy',
                    category: 'SUBSCRIPTION',
                });
            }
        }
    }
    catch (err) {
        console.warn('Admin seed notice:', err.message);
    }
}
async function connectMongoDB() {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!uri) {
        console.warn('⚠️ No MONGODB_URI or MONGO_URL provided in .env');
        return false;
    }
    try {
        console.log('🔄 Connecting to MongoDB Atlas cluster...');
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 8000,
            maxPoolSize: 50,
            minPoolSize: 10,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ Connected to MongoDB Atlas successfully with connection pool (min: 10, max: 50)!');
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB connection lost. Reconnection in progress...');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔄 MongoDB Atlas reconnected successfully.');
        });
        await seedDefaultAdminIfNeeded();
        return true;
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        return false;
    }
}
