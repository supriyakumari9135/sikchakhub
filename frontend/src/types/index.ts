export type UserRole = 'TEACHER' | 'EMPLOYER' | 'ADMIN';

export type InstitutionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

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

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  experienceYears: number;
  highestQualification: string;
  teachingLevels: TeachingLevel[];
  subjects: string[];
  boards: BoardType[];
  currentCity: string;
  preferredCities: string[];
  isWillingToRelocate: boolean;
  currentSalaryLPA?: number;
  expectedSalaryLPA?: number;
  noticePeriodDays: number;
  resumeUrl?: string;
  resumeFileName?: string;
  skills: string[];
  certifications: string[];
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
}

export interface ApplicationMatchResult {
  overallScore: number; // 0 - 100
  mandatoryPassed: boolean;
  autoFilteredStatus: 'QUALIFIED' | 'UNMATCHED';
  breakdown: ScreeningMatchDetail[];
  aiAnalysisSummary?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: JobVacancy;
  teacherId: string;
  teacher?: User & { profile?: TeacherProfile };
  resumeUrl: string;
  coverLetter?: string;
  stage: ApplicationStage;
  customAnswers: Record<string, any>;
  matchResult?: ApplicationMatchResult;
  recruiterNotes?: string;
  appliedAt: string;
  updatedAt: string;
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
