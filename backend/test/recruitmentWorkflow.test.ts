import test from 'node:test';
import assert from 'node:assert';
import { calculateCandidateScreening } from '../src/services/screeningEngine';
import { analyzeResumeATS } from '../src/services/atsService';
import { JobVacancy, TeacherProfile } from '@sikchakhub/shared-types';

test('Screening Engine: High Match Candidate Evaluation', () => {
  const sampleJob: JobVacancy = {
    id: 'job-test-1',
    institutionId: 'inst-1',
    title: 'Senior Physics Faculty (IIT-JEE)',
    subject: 'Physics',
    teachingLevel: 'COACHING_JEE',
    board: 'OTHER',
    employmentType: 'FULL_TIME',
    minExperienceYears: 4,
    requiredQualification: 'M.Sc Physics',
    description: 'JEE Advanced Physics coaching opening.',
    minSalaryLPA: 18,
    maxSalaryLPA: 28,
    city: 'Kota',
    state: 'Rajasthan',
    vacanciesCount: 2,
    deadline: '2026-12-31',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    screeningRules: {
      minExperienceYears: 4,
      requiredQualifications: ['M.Sc'],
      requiredSubjects: ['Physics'],
      requiredTeachingLevels: ['COACHING_JEE'],
      maxExpectedSalaryLPA: 30,
      relocationRequired: false,
      mandatoryRuleWeight: 40,
      experienceWeight: 30,
      subjectWeight: 20,
      qualificationWeight: 10,
    },
  };

  const highMatchCandidate: { fullName: string; profile: TeacherProfile } = {
    fullName: 'Dr. Rajesh Sharma',
    profile: {
      id: 'p-1',
      userId: 'u-1',
      experienceYears: 8,
      highestQualification: 'Ph.D / M.Sc Physics',
      teachingLevels: ['COACHING_JEE', 'PGT'],
      subjects: ['Physics', 'Applied Physics'],
      boards: ['CBSE', 'OTHER'],
      currentCity: 'Kota',
      preferredCities: ['Kota'],
      isWillingToRelocate: true,
      expectedSalaryLPA: 22,
      noticePeriodDays: 30,
      skills: ['Mechanics', 'Lesson Planning'],
      certifications: [],
      profileCompletionScore: 90,
      streakDays: 10,
    },
  };

  const result = calculateCandidateScreening(sampleJob, highMatchCandidate, {});

  assert.ok(result.overallScore >= 80, `Expected score >= 80, received ${result.overallScore}`);
  assert.strictEqual(result.mandatoryPassed, true);
  assert.strictEqual(result.autoFilteredStatus, 'QUALIFIED');
  assert.ok(result.breakdown.length >= 4);
});

test('Screening Engine: Unmatched Candidate with Low Experience and Different Subject', () => {
  const sampleJob: JobVacancy = {
    id: 'job-test-2',
    institutionId: 'inst-1',
    title: 'Senior Chemistry Faculty (NEET)',
    subject: 'Chemistry',
    teachingLevel: 'COACHING_NEET',
    board: 'OTHER',
    employmentType: 'FULL_TIME',
    minExperienceYears: 5,
    requiredQualification: 'M.Sc Chemistry',
    description: 'NEET Chemistry coaching role.',
    minSalaryLPA: 15,
    maxSalaryLPA: 22,
    city: 'Kota',
    state: 'Rajasthan',
    vacanciesCount: 1,
    deadline: '2026-12-31',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    screeningRules: {
      minExperienceYears: 5,
      requiredQualifications: ['M.Sc'],
      requiredSubjects: ['Chemistry'],
      requiredTeachingLevels: ['COACHING_NEET'],
      maxExpectedSalaryLPA: 22,
      relocationRequired: true,
      mandatoryRuleWeight: 40,
      experienceWeight: 30,
      subjectWeight: 20,
      qualificationWeight: 10,
    },
  };

  const lowMatchCandidate = {
    fullName: 'Beginner Teacher',
    profile: {
      id: 'p-2',
      userId: 'u-2',
      experienceYears: 0.5,
      highestQualification: 'B.A History',
      teachingLevels: ['PRT' as const],
      subjects: ['History'],
      boards: ['STATE_BOARD' as const],
      currentCity: 'Kolkata',
      preferredCities: ['Kolkata'],
      isWillingToRelocate: false,
      expectedSalaryLPA: 35,
      noticePeriodDays: 60,
      skills: [],
      certifications: [],
      profileCompletionScore: 40,
      streakDays: 1,
    },
  };

  const result = calculateCandidateScreening(sampleJob, lowMatchCandidate, {});

  assert.ok(result.overallScore < 55, `Expected score < 55, received ${result.overallScore}`);
  assert.strictEqual(result.autoFilteredStatus, 'UNMATCHED');
});

test('ATS Resume Service: Pedagogy Keyword & Quantified Result Scoring', () => {
  const resumeText = `Senior Physics Faculty with 8 years experience in Lesson Planning, Formative Assessment, Differentiated Instruction, and NEP 2020 Guidelines. Mentored 200+ students with 94% board average and produced top 100 JEE Advanced ranks. Expert in Smart Class & EdTech tools.`;
  
  const atsResult = analyzeResumeATS(resumeText, 8);

  assert.ok(atsResult.overallScore >= 80, `Expected ATS score >= 80, got ${atsResult.overallScore}`);
  assert.ok(atsResult.matchingKeywords.length >= 4);
  assert.ok(atsResult.recommendations.length > 0);
  assert.ok(['A+', 'A'].includes(atsResult.grade));
});
