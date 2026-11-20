export type UserRole = 'TEACHER' | 'EMPLOYER' | 'ADMIN' | 'HR';

export type InstitutionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type JobStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'REJECTED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'VISITING' | 'CONTRACT' | 'REMOTE';

export type TeachingLevel = 
  | 'PRE_PRIMARY' 
  | 'PRT' // Primary Teacher (Grade 1-5)
  | 'TGT' // Trained Graduate Teacher (Grade 6-10)
  | 'PGT' // Post Graduate Teacher (Grade 11-12)
  | 'COACHING_JEE' 
  | 'COACHING_NEET' 
  | 'COLLEGE_PROFESSOR' 
  | 'ADMINISTRATOR' 
  | 'PRINCIPAL';

export type BoardType = 'CBSE' | 'ICSE' | 'STATE_BOARD' | 'IB' | 'CAMBRIDGE' | 'OTHER';

export type ApplicationStage = 
  | 'APPLIED' 
  | 'SCREENING' 
  | 'SHORTLISTED' 
  | 'INTERVIEW_SCHEDULED' 
  | 'SELECTED' 
  | 'REJECTED' 
  | 'ON_HOLD';

export type VerificationStatus = 
  | 'PENDING_VERIFICATION' 
  | 'EMAIL_VERIFIED' 
  | 'PHONE_VERIFIED' 
  | 'FULLY_VERIFIED' 
  | 'TEMPORARILY_BLOCKED';

export type OtpChannel = 'EMAIL' | 'PHONE';

export interface User {
  id: string;
  email: string;
  phone?: string;
  age?: number;
  role: UserRole;
  adminRole?: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  verificationStatus?: VerificationStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED' | string;
}

export interface OtpRecord {
  id: string;
  userId: string;
  channel: OtpChannel;
  identifier: string;
  otpHash: string;
  expiresAt: string;
  resendCooldownUntil?: string;
  sendCount24h: number;
  firstSendAt24h: string;
  failedAttempts: number;
  isBlocked: boolean;
  blockedUntil?: string;
  isConsumed: boolean;
  consumedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpStatusResponse {
  email: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  isVerified: boolean;
  emailCooldownRemaining: number;
  phoneCooldownRemaining: number;
  emailSendsRemaining: number;
  phoneSendsRemaining: number;
  isEmailBlocked: boolean;
  isPhoneBlocked: boolean;
  emailBlockRemainingSeconds: number;
  phoneBlockRemainingSeconds: number;
  emailFailedAttempts?: number;
  phoneFailedAttempts?: number;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  age?: number;
  gender?: string;
  experienceYears: number;
  highestQualification: string;
  degree?: string;
  teachingLevels: TeachingLevel[];
  classesTaught?: string[];
  subjects: string[];
  previousSchool?: string;
  boards: BoardType[];
  currentCity: string;
  preferredCities: string[];
  isWillingToRelocate: boolean;
  currentSalaryLPA?: number;
  expectedSalaryLPA?: number;
  expectedSalary?: string;
  noticePeriodDays: number;
  joiningAvailability?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  skills: string[];
  certifications: string[];
  languages?: string[];
  profileCompletionScore: number;
  streakDays: number;
}

export interface Institution {
  id: string;
  ownerId: string;
  name: string;
  type: 'SCHOOL' | 'COLLEGE' | 'COACHING_INSTITUTE' | 'EDTECH' | 'UNIVERSITY';
  logoUrl?: string;
  website?: string;
  description?: string;
  affiliationNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  board?: string;
  udiseCode?: string;
  registrationNumber?: string;
  certificateUrl?: string;
  certificateFileName?: string;
  termsAccepted?: boolean;
  verificationStatus: InstitutionStatus;
  verificationNotes?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  establishedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormFieldDefinition {
  id: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'EMAIL' | 'DATE' | 'TEXTAREA' | 'SINGLE_SELECT' | 'MULTI_SELECT' | 'YES_NO' | 'FILE';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedExtensions?: string[];
  };
}

export interface ScreeningRule {
  minExperienceYears: number;
  requiredQualifications: string[];
  requiredSubjects: string[];
  requiredTeachingLevels: TeachingLevel[];
  requiredBoards?: BoardType[];
  maxExpectedSalaryLPA?: number;
  relocationRequired: boolean;
  mandatoryRuleWeight: number; // e.g. 50%
  experienceWeight: number;    // e.g. 20%
  subjectWeight: number;       // e.g. 20%
  qualificationWeight: number; // e.g. 10%
  autoRejectBelowScore?: number; // e.g. score < 50 rejects automatically
}

export interface JobVacancy {
  id: string;
  institutionId: string;
  institutionName?: string;
  posterName?: string;
  postedBy?: string;
  institution?: Institution;
  title: string;
  department?: string;
  subject: string;
  additionalSubjects?: string[];
  teachingLevel: TeachingLevel;
  board: BoardType;
  employmentType: EmploymentType;
  minExperienceYears: number;
  maxExperienceYears?: number;
  requiredQualification: string;
  description: string;
  responsibilities?: string[];
  benefits?: string[];
  minSalaryLPA: number;
  maxSalaryLPA: number;
  city: string;
  state: string;
  vacanciesCount: number;
  deadline: string;
  status: JobStatus;
  customFields?: FormFieldDefinition[];
  screeningRules?: ScreeningRule;
  createdAt: string;
  updatedAt: string;
  totalApplicants?: number;
}

export interface ScreeningMatchDetail {
  criterion: string;
  required: string | number | boolean;
  actual: string | number | boolean;
  passed: boolean;
  scoreContribution: number;
  weight: number;
  notes: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

export interface ParsedResumeInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  degree?: string;
  institutionName?: string;
  primaryDomain?: string;
  skills?: string[];
  experienceYears?: number;
  projects?: string[];
}

export interface ApplicationMatchResult {
  overallScore: number; // 0 - 100
  mandatoryPassed: boolean;
  autoFilteredStatus: 'QUALIFIED' | 'UNMATCHED';
  breakdown: ScreeningMatchDetail[];
  aiAnalysisSummary?: string;
  matchGrade?: 'TOP_TIER' | 'POTENTIAL' | 'DOMAIN_MISMATCH';
  parsedResume?: ParsedResumeInfo;
  matchedKeywords?: string[];
  missingKeywords?: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: JobVacancy;
  teacherId: string;
  teacher?: User & { profile?: TeacherProfile };
  resumeUrl: string;
  resumeFileName?: string;
  coverLetter?: string;
  stage: ApplicationStage;
  customAnswers: Record<string, any>;
  matchResult?: ApplicationMatchResult;
  recruiterNotes?: string;
  isLocked?: boolean;
  lockReason?: string;
  applicantIndex?: number;
  appliedAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'FREE' | 'PRO_MONTHLY' | 'ANNUAL_ENTERPRISE' | 'CUSTOM_ADMIN';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';

export interface JobPosterSubscription {
  id: string;
  userId: string;
  institutionId?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  freeLimitPerJob: number;
  hasUnlimitedAccess: boolean;
  startDate: string;
  endDate: string;
  amountPaid: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'N/A';
  lastPaymentId?: string;
  grantedByAdmin?: boolean;
  adminNotes?: string;
  requestStatus?: 'NONE' | 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED';
  requestedPlan?: string;
  requestedAt?: string;
  requestNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  subscriptionId?: string;
  userId: string;
  institutionId?: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  paymentGateway: 'DIRECT_PAY' | 'RAZORPAY_SANDBOX' | 'MANUAL_ADMIN';
  paymentId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  application?: JobApplication;
  jobId: string;
  job?: JobVacancy;
  teacherId: string;
  teacher?: User;
  institutionId: string;
  institution?: Institution;
  interviewType: 'DEMO_CLASS' | 'ONLINE_MEETING' | 'HR_ROUND' | 'CAMPUS_IN_PERSON';
  scheduledTime: string;
  durationMinutes: number;
  meetingLink?: string;
  locationDetails?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  feedback?: string;
  rating?: number;
  createdAt: string;
}

export interface ATSFeedback {
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'NEEDS_WORK';
  summary: string;
  keywordScore: number;
  formattingScore: number;
  contentImpactScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface CandidateGroup {
  id: string;
  name: string;
  description?: string;
  targetVacancyId?: string;
  targetVacancyTitle?: string;
  targetSubject?: string;
  targetLevel?: string;
  targetLocation?: string;
  candidateIds: string[];
  candidates?: any[];
  notes?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  createdBy: string;
  createdByName: string;
  createdByRole: 'ADMIN' | 'HR';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
