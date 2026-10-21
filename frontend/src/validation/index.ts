import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  role: z.enum(['TEACHER', 'EMPLOYER', 'ADMIN']).default('TEACHER'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const OTPLoginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  otp: z.string().length(6, 'OTP must be 6 digits').optional(),
});

export const TeacherProfileSchema = z.object({
  headline: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  experienceYears: z.number().min(0, 'Experience cannot be negative'),
  highestQualification: z.string().min(2, 'Highest qualification is required'),
  teachingLevels: z.array(z.string()).min(1, 'Select at least one teaching level'),
  subjects: z.array(z.string()).min(1, 'Select at least one subject'),
  boards: z.array(z.string()).min(1, 'Select at least one curriculum/board'),
  currentCity: z.string().min(2, 'Current city is required'),
  preferredCities: z.array(z.string()).default([]),
  isWillingToRelocate: z.boolean().default(false),
  currentSalaryLPA: z.number().optional(),
  expectedSalaryLPA: z.number().optional(),
  noticePeriodDays: z.number().min(0).default(30),
  resumeUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
});

export const InstitutionSchema = z.object({
  name: z.string().min(2, 'Institution name is required'),
  type: z.enum(['SCHOOL', 'COLLEGE', 'COACHING_INSTITUTE', 'EDTECH', 'UNIVERSITY']),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  affiliationNumber: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(4, 'Postal code is required'),
  establishedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
});

export const FormFieldDefinitionSchema = z.object({
  id: z.string(),
  label: z.string().min(2),
  fieldType: z.enum(['TEXT', 'NUMBER', 'EMAIL', 'DATE', 'TEXTAREA', 'SINGLE_SELECT', 'MULTI_SELECT', 'YES_NO', 'FILE']),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const ScreeningRuleSchema = z.object({
  minExperienceYears: z.number().min(0).default(0),
  requiredQualifications: z.array(z.string()).default([]),
  requiredSubjects: z.array(z.string()).default([]),
  requiredTeachingLevels: z.array(z.string()).default([]),
  requiredBoards: z.array(z.string()).optional(),
  maxExpectedSalaryLPA: z.number().optional(),
  relocationRequired: z.boolean().default(false),
  mandatoryRuleWeight: z.number().min(0).max(100).default(40),
  experienceWeight: z.number().min(0).max(100).default(30),
  subjectWeight: z.number().min(0).max(100).default(20),
  qualificationWeight: z.number().min(0).max(100).default(10),
  autoRejectBelowScore: z.number().min(0).max(100).optional(),
});

export const JobVacancySchema = z.object({
  title: z.string().min(3, 'Job title is required'),
  department: z.string().optional(),
  subject: z.string().min(2, 'Primary subject is required'),
  additionalSubjects: z.array(z.string()).optional(),
  teachingLevel: z.string().min(1, 'Teaching level is required'),
  board: z.string().min(1, 'Board/Curriculum is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'VISITING', 'CONTRACT', 'REMOTE']).default('FULL_TIME'),
  minExperienceYears: z.number().min(0).default(1),
  maxExperienceYears: z.number().optional(),
  requiredQualification: z.string().min(2, 'Required qualification is required'),
  description: z.string().min(20, 'Job description must have at least 20 characters'),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  minSalaryLPA: z.number().min(0),
  maxSalaryLPA: z.number().min(0),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  vacanciesCount: z.number().min(1).default(1),
  deadline: z.string().min(4, 'Application deadline is required'),
  customFields: z.array(FormFieldDefinitionSchema).optional(),
  screeningRules: ScreeningRuleSchema.optional(),
});

export const SubmitApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  resumeUrl: z.string().optional(),
  coverLetter: z.string().optional(),
  customAnswers: z.record(z.any()).default({}),
});

export const ScheduleInterviewSchema = z.object({
  applicationId: z.string().min(1),
  interviewType: z.enum(['DEMO_CLASS', 'ONLINE_MEETING', 'HR_ROUND', 'CAMPUS_IN_PERSON']),
  scheduledTime: z.string().min(1),
  durationMinutes: z.number().min(15).max(180).default(45),
  meetingLink: z.string().url().optional().or(z.literal('')),
  locationDetails: z.string().optional(),
});
