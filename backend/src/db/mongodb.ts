import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// User Schema
const UserSchema = new mongoose.Schema({
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
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });

// Teacher Profile Schema
const TeacherProfileSchema = new mongoose.Schema({
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

// Institution Schema
const InstitutionSchema = new mongoose.Schema({
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

// Job Vacancy Schema
const JobVacancySchema = new mongoose.Schema({
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
  customFields: { type: mongoose.Schema.Types.Mixed, default: [] },
  screeningRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  requireResume: { type: Boolean, default: true },
  syllabusDocumentUrl: { type: String },
  syllabusDocumentName: { type: String },
  totalApplicants: { type: Number, default: 0 },
}, { timestamps: true });

// Job Application Schema
const JobApplicationSchema = new mongoose.Schema({
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
  customAnswers: { type: mongoose.Schema.Types.Mixed, default: {} },
  matchResult: { type: mongoose.Schema.Types.Mixed, default: {} },
  recruiterNotes: { type: String },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Interview Schema
const InterviewSchema = new mongoose.Schema({
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

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  userEmail: { type: String },
  action: { type: String, required: true },
  resourceType: { type: String },
  resourceId: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Master Data Schema
const MasterDataSchema = new mongoose.Schema({
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
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Platform Notification Schema (Upgraded for Location-Based & Smart Push System)
const PlatformNotificationSchema = new mongoose.Schema({
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
  deliveryDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  sentBy: { type: String, default: 'Super Admin' },
  status: { type: String, enum: ['SENT', 'DELIVERED', 'PARTIAL', 'FAILED', 'SCHEDULED', 'DRAFT'], default: 'DELIVERED' },
}, { timestamps: true });

// Device FCM Token Schema (Store device FCM tokens, platform, active status)
const DeviceTokenSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  userRole: { type: String, enum: ['TEACHER', 'EMPLOYER', 'ADMIN'], default: 'TEACHER' },
  token: { type: String, required: true, unique: true },
  platform: { type: String, enum: ['WEB', 'ANDROID', 'IOS'], default: 'WEB' },
  userAgent: { type: String },
  isActive: { type: Boolean, default: true },
  lastSeenAt: { type: Date, default: Date.now },
}, { timestamps: true });

// User Inbox Notification Schema (In-app delivery for teachers/job seekers)
const UserInboxNotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  broadcastId: { type: String, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  actionUrl: { type: String },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

// User Reports & Moderation Schema
const UserReportSchema = new mongoose.Schema({
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

// Platform Settings Schema
const PlatformSettingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
  category: { type: String, default: 'GENERAL' },
  updatedBy: { type: String },
}, { timestamps: true });

// HR Candidate Shortlist Group Schema
const CandidateGroupSchema = new mongoose.Schema({
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

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const TeacherProfileModel = mongoose.models.TeacherProfile || mongoose.model('TeacherProfile', TeacherProfileSchema);
export const InstitutionModel = mongoose.models.Institution || mongoose.model('Institution', InstitutionSchema);
export const JobVacancyModel = mongoose.models.JobVacancy || mongoose.model('JobVacancy', JobVacancySchema);
export const JobApplicationModel = mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
export const InterviewModel = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const MasterDataModel = mongoose.models.MasterData || mongoose.model('MasterData', MasterDataSchema);
export const PlatformNotificationModel = mongoose.models.PlatformNotification || mongoose.model('PlatformNotification', PlatformNotificationSchema);
export const DeviceTokenModel = mongoose.models.DeviceToken || mongoose.model('DeviceToken', DeviceTokenSchema);
export const UserInboxNotificationModel = mongoose.models.UserInboxNotification || mongoose.model('UserInboxNotification', UserInboxNotificationSchema);
export const UserReportModel = mongoose.models.UserReport || mongoose.model('UserReport', UserReportSchema);
export const PlatformSettingModel = mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', PlatformSettingSchema);
export const CandidateGroupModel = mongoose.models.CandidateGroup || mongoose.model('CandidateGroup', CandidateGroupSchema);

export async function seedDefaultAdminIfNeeded() {
  try {
    const adminEmail = 'sikshahub@gmail.com';
    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = bcryptjs.hashSync('admin@12345', 10);
      const adminDoc = {
        id: `admin-${Date.now()}`,
        email: adminEmail,
        passwordHash,
        fullName: 'SikshaHub Super Admin',
        role: 'ADMIN',
        adminRole: 'SUPER_ADMIN',
        adminPermissions: ['ALL'],
        phone: '9783143866',
        age: 32,
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=SikshaHubAdmin',
        isVerified: true,
      };
      await UserModel.create(adminDoc);
      console.log('✅ Default Super Admin seeded in MongoDB: sikshahub@gmail.com / admin@12345');
    }

    // Seed Master Data if empty
    const masterDataCount = await MasterDataModel.countDocuments();
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
      await MasterDataModel.insertMany(docs);
      console.log('✅ Initial platform Master Data seeded in MongoDB.');
    }

    // Seed Platform Settings if empty
    const settingsCount = await PlatformSettingModel.countDocuments();
    if (settingsCount === 0) {
      const initialSettings = [
        { id: 'set-1', key: 'siteName', value: 'SikshaHub.AI', description: 'Platform brand name', category: 'BRANDING' },
        { id: 'set-2', key: 'supportEmail', value: 'support@sikchakhub.ai', description: 'Primary support and inquiry email', category: 'CONTACT' },
        { id: 'set-3', key: 'supportPhone', value: '+91 9783143866', description: 'Helpline mobile number', category: 'CONTACT' },
        { id: 'set-4', key: 'maxCvUploadSizeMB', value: 1, description: 'Maximum allowed candidate PDF CV size in Megabytes', category: 'UPLOADS' },
        { id: 'set-5', key: 'maintenanceMode', value: false, description: 'Toggle platform maintenance mode', category: 'SYSTEM' },
        { id: 'set-6', key: 'autoApproveJobs', value: true, description: 'Automatically publish vacancies without moderation queue', category: 'MODERATION' },
      ];
      await PlatformSettingModel.insertMany(initialSettings);
      console.log('✅ Initial Platform Settings seeded in MongoDB.');
    }
  } catch (err: any) {
    console.warn('Admin seed notice:', err.message);
  }
}

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI or MONGO_URL provided in .env');
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB Atlas successfully!');
    await seedDefaultAdminIfNeeded();
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    return false;
  }
}
