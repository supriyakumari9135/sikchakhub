"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleInterviewSchema = exports.SubmitApplicationSchema = exports.JobVacancySchema = exports.ScreeningRuleSchema = exports.FormFieldDefinitionSchema = exports.InstitutionSchema = exports.TeacherProfileSchema = exports.OTPLoginSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: zod_1.z.string().min(2, 'Full name must have at least 2 characters'),
    role: zod_1.z.enum(['TEACHER', 'EMPLOYER', 'ADMIN']).default('TEACHER'),
    phone: zod_1.z.string().optional(),
    age: zod_1.z.coerce.number().min(18, 'Age must be at least 18').max(100, 'Please enter a valid age').optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    expectedRole: zod_1.z.enum(['TEACHER', 'EMPLOYER', 'ADMIN']).optional(),
    portalRole: zod_1.z.enum(['TEACHER', 'EMPLOYER', 'ADMIN']).optional(),
    role: zod_1.z.enum(['TEACHER', 'EMPLOYER', 'ADMIN']).optional(),
});
exports.OTPLoginSchema = zod_1.z.object({
    phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits').optional(),
});
exports.TeacherProfileSchema = zod_1.z.object({
    headline: zod_1.z.string().max(120).optional(),
    bio: zod_1.z.string().max(1000).optional(),
    experienceYears: zod_1.z.number().min(0, 'Experience cannot be negative'),
    highestQualification: zod_1.z.string().min(2, 'Highest qualification is required'),
    teachingLevels: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one teaching level'),
    subjects: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one subject'),
    boards: zod_1.z.array(zod_1.z.string()).min(1, 'Select at least one curriculum/board'),
    currentCity: zod_1.z.string().min(2, 'Current city is required'),
    preferredCities: zod_1.z.array(zod_1.z.string()).default([]),
    isWillingToRelocate: zod_1.z.boolean().default(false),
    currentSalaryLPA: zod_1.z.number().optional(),
    expectedSalaryLPA: zod_1.z.number().optional(),
    noticePeriodDays: zod_1.z.number().min(0).default(30),
    resumeUrl: zod_1.z.string().optional(),
    resumeFileName: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).default([]),
    certifications: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.InstitutionSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Institution name is required'),
    type: zod_1.z.enum(['SCHOOL', 'COLLEGE', 'COACHING_INSTITUTE', 'EDTECH', 'UNIVERSITY']),
    website: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    description: zod_1.z.string().optional(),
    affiliationNumber: zod_1.z.string().optional(),
    address: zod_1.z.string().min(5, 'Address is required'),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    pincode: zod_1.z.string().min(4, 'Postal code is required'),
    establishedYear: zod_1.z.number().min(1800).max(new Date().getFullYear()).optional(),
});
exports.FormFieldDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    label: zod_1.z.string().min(2),
    fieldType: zod_1.z.enum(['TEXT', 'NUMBER', 'EMAIL', 'DATE', 'TEXTAREA', 'SINGLE_SELECT', 'MULTI_SELECT', 'YES_NO', 'FILE']),
    required: zod_1.z.boolean().default(false),
    placeholder: zod_1.z.string().optional(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.ScreeningRuleSchema = zod_1.z.object({
    minExperienceYears: zod_1.z.number().min(0).default(0),
    requiredQualifications: zod_1.z.array(zod_1.z.string()).default([]),
    requiredSubjects: zod_1.z.array(zod_1.z.string()).default([]),
    requiredTeachingLevels: zod_1.z.array(zod_1.z.string()).default([]),
    requiredBoards: zod_1.z.array(zod_1.z.string()).optional(),
    maxExpectedSalaryLPA: zod_1.z.number().optional(),
    relocationRequired: zod_1.z.boolean().default(false),
    mandatoryRuleWeight: zod_1.z.number().min(0).max(100).default(40),
    experienceWeight: zod_1.z.number().min(0).max(100).default(30),
    subjectWeight: zod_1.z.number().min(0).max(100).default(20),
    qualificationWeight: zod_1.z.number().min(0).max(100).default(10),
    autoRejectBelowScore: zod_1.z.number().min(0).max(100).optional(),
});
exports.JobVacancySchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Job title is required'),
    department: zod_1.z.string().optional(),
    subject: zod_1.z.string().min(2, 'Primary subject is required'),
    additionalSubjects: zod_1.z.array(zod_1.z.string()).optional(),
    teachingLevel: zod_1.z.string().min(1, 'Teaching level is required'),
    board: zod_1.z.string().min(1, 'Board/Curriculum is required'),
    employmentType: zod_1.z.enum(['FULL_TIME', 'PART_TIME', 'VISITING', 'CONTRACT', 'REMOTE']).default('FULL_TIME'),
    minExperienceYears: zod_1.z.number().min(0).default(1),
    maxExperienceYears: zod_1.z.number().optional(),
    requiredQualification: zod_1.z.string().min(2, 'Required qualification is required'),
    description: zod_1.z.string().min(20, 'Job description must have at least 20 characters'),
    responsibilities: zod_1.z.array(zod_1.z.string()).optional(),
    benefits: zod_1.z.array(zod_1.z.string()).optional(),
    minSalaryLPA: zod_1.z.number().min(0),
    maxSalaryLPA: zod_1.z.number().min(0),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    vacanciesCount: zod_1.z.number().min(1).default(1),
    deadline: zod_1.z.string().min(4, 'Application deadline is required'),
    customFields: zod_1.z.array(exports.FormFieldDefinitionSchema).optional(),
    screeningRules: exports.ScreeningRuleSchema.optional(),
});
exports.SubmitApplicationSchema = zod_1.z.object({
    jobId: zod_1.z.string().min(1, 'Job ID is required'),
    resumeUrl: zod_1.z.string().optional(),
    coverLetter: zod_1.z.string().optional(),
    customAnswers: zod_1.z.record(zod_1.z.any()).default({}),
});
exports.ScheduleInterviewSchema = zod_1.z.object({
    applicationId: zod_1.z.string().min(1),
    interviewType: zod_1.z.enum(['DEMO_CLASS', 'ONLINE_MEETING', 'HR_ROUND', 'CAMPUS_IN_PERSON']),
    scheduledTime: zod_1.z.string().min(1),
    durationMinutes: zod_1.z.number().min(15).max(180).default(45),
    meetingLink: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    locationDetails: zod_1.z.string().optional(),
});
