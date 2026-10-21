export type UserRole = 'TEACHER' | 'EMPLOYER' | 'ADMIN';

export type InstitutionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'VISITING' | 'CONTRACT' | 'REMOTE';

export type TeachingLevel = 
  | 'PRE_PRIMARY' 
  | 'PRT' 
  | 'TGT' 
  | 'PGT' 
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
  createdAt: string;
  updatedAt: string;
  totalApplicants?: number;
}

export interface ApplicationMatchResult {
  overallScore: number;
  mandatoryPassed: boolean;
  autoFilteredStatus: 'QUALIFIED' | 'UNMATCHED';
  breakdown: any[];
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
