import { JobVacancy, TeacherProfile, ApplicationMatchResult, ScreeningMatchDetail } from '@sikchakhub/shared-types';

export function calculateCandidateScreening(
  job: JobVacancy,
  candidate: { fullName: string; profile?: TeacherProfile },
  customAnswers: Record<string, any> = {}
): ApplicationMatchResult {
  const breakdown: ScreeningMatchDetail[] = [];
  const rules = job.screeningRules || {
    minExperienceYears: job.minExperienceYears || 1,
    requiredQualifications: [job.requiredQualification || 'Post Graduate'],
    requiredSubjects: [job.subject],
    requiredTeachingLevels: [job.teachingLevel],
    mandatoryRuleWeight: 40,
    experienceWeight: 30,
    subjectWeight: 20,
    qualificationWeight: 10,
    relocationRequired: false,
  };

  const profile = candidate.profile || {
    experienceYears: 0,
    highestQualification: 'Not specified',
    subjects: [],
    teachingLevels: [],
    boards: [],
    currentCity: 'Unknown',
    preferredCities: [],
    isWillingToRelocate: false,
    expectedSalaryLPA: 0,
    skills: [],
    certifications: [],
    profileCompletionScore: 50,
    streakDays: 1,
    id: '',
    userId: '',
    noticePeriodDays: 30,
  };

  let mandatoryPassed = true;
  let totalScore = 0;

  // 1. Subject Match
  const candidateSubjects = (profile.subjects || []).map(s => s.toLowerCase());
  const jobSubject = (job.subject || '').toLowerCase();
  const subjectPassed = candidateSubjects.some(s => s.includes(jobSubject) || jobSubject.includes(s));
  
  const subjectScore = subjectPassed ? 100 : 25;
  totalScore += (subjectScore * (rules.subjectWeight || 20)) / 100;
  breakdown.push({
    criterion: 'Subject Expertise',
    required: job.subject,
    actual: profile.subjects?.join(', ') || 'None listed',
    passed: subjectPassed,
    scoreContribution: Math.round((subjectScore * (rules.subjectWeight || 20)) / 100),
    weight: rules.subjectWeight || 20,
    notes: subjectPassed 
      ? `Strong match with required subject (${job.subject})`
      : `Primary subject not explicitly listed in teacher profile`,
  });

  // 2. Experience Match
  const requiredExp = rules.minExperienceYears || job.minExperienceYears || 0;
  const actualExp = profile.experienceYears || 0;
  const expPassed = actualExp >= requiredExp;
  if (!expPassed && requiredExp > 0) {
    // If strict experience is required, could flag mandatory
  }
  
  let expScoreRatio = requiredExp > 0 ? Math.min(1.2, actualExp / requiredExp) : 1;
  const expScore = Math.round(Math.min(100, expScoreRatio * 100));
  totalScore += (expScore * (rules.experienceWeight || 30)) / 100;
  breakdown.push({
    criterion: 'Teaching Experience',
    required: `${requiredExp}+ years`,
    actual: `${actualExp} years`,
    passed: expPassed,
    scoreContribution: Math.round((expScore * (rules.experienceWeight || 30)) / 100),
    weight: rules.experienceWeight || 30,
    notes: expPassed 
      ? `Meets minimum experience criteria (${actualExp} yrs vs ${requiredExp} yrs required)`
      : `Below requested minimum experience by ${(requiredExp - actualExp).toFixed(1)} years`,
  });

  // 3. Qualification Match
  const candidateQual = (profile.highestQualification || '').toLowerCase();
  const requiredQual = (job.requiredQualification || '').toLowerCase();
  const qualPassed = candidateQual.length > 0 && (
    candidateQual.includes('ph.d') ||
    candidateQual.includes('m.sc') ||
    candidateQual.includes('m.a') ||
    candidateQual.includes('m.tech') ||
    candidateQual.includes('b.ed') ||
    candidateQual.includes('b.tech') ||
    candidateQual.includes(requiredQual)
  );

  const qualScore = qualPassed ? 100 : 50;
  totalScore += (qualScore * (rules.qualificationWeight || 10)) / 100;
  breakdown.push({
    criterion: 'Academic Qualification',
    required: job.requiredQualification,
    actual: profile.highestQualification || 'Not specified',
    passed: qualPassed,
    scoreContribution: Math.round((qualScore * (rules.qualificationWeight || 10)) / 100),
    weight: rules.qualificationWeight || 10,
    notes: qualPassed
      ? `Holds accredited degree aligned with vacancy criteria`
      : `Degree verification needed during interview stage`,
  });

  // 4. Teaching Level / Board Compatibility
  const candidateLevels = (profile.teachingLevels || []).map(l => l.toUpperCase());
  const jobLevel = (job.teachingLevel || '').toUpperCase();
  const levelPassed = candidateLevels.includes(jobLevel) || candidateLevels.length === 0;

  const candidateBoards = (profile.boards || []).map(b => b.toUpperCase());
  const jobBoard = (job.board || '').toUpperCase();
  const boardPassed = candidateBoards.includes(jobBoard) || candidateBoards.length === 0;

  const levelScore = (levelPassed ? 60 : 20) + (boardPassed ? 40 : 10);
  const mandatoryWeight = rules.mandatoryRuleWeight || 40;
  totalScore += (levelScore * mandatoryWeight) / 100;

  breakdown.push({
    criterion: 'Teaching Level & Board Alignment',
    required: `${job.teachingLevel} (${job.board})`,
    actual: `${profile.teachingLevels?.join(', ') || 'Any'} / ${profile.boards?.join(', ') || 'Any'}`,
    passed: levelPassed && boardPassed,
    scoreContribution: Math.round((levelScore * mandatoryWeight) / 100),
    weight: mandatoryWeight,
    notes: (levelPassed && boardPassed)
      ? `Full alignment with curriculum (${job.board}) and level (${job.teachingLevel})`
      : `Partial match with school board or target grade level`,
  });

  // 5. Salary & Relocation Compatibility Check
  const expectedSalary = profile.expectedSalaryLPA || 0;
  const budgetMax = job.maxSalaryLPA || 99;
  const salaryCompatible = expectedSalary <= budgetMax * 1.15; // 15% negotiation margin
  const locationCompatible = (profile.currentCity || '').toLowerCase() === (job.city || '').toLowerCase() || 
                             profile.isWillingToRelocate || 
                             (profile.preferredCities || []).some(c => c.toLowerCase() === (job.city || '').toLowerCase());

  if (!salaryCompatible && expectedSalary > budgetMax * 1.3) {
    mandatoryPassed = false;
  }
  if (rules.relocationRequired && !locationCompatible) {
    mandatoryPassed = false;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(totalScore)));
  const autoFilteredStatus = (finalScore >= 55 && mandatoryPassed) ? 'QUALIFIED' : 'UNMATCHED';

  const aiAnalysisSummary = finalScore >= 80 
    ? `Strong candidate profile: Excellent alignment with ${job.subject} (${job.teachingLevel}), demonstrated pedagogical background (${actualExp} yrs), and compatible compensation benchmarks.`
    : finalScore >= 60
    ? `Promising applicant: Suitable for ${job.subject} instruction. Recommend assessing depth of curriculum familiarity during initial screening demo.`
    : `Conditional applicant: Candidate has qualifications in related areas, but does not meet all primary experience or board preferences for this vacancy.`;

  return {
    overallScore: finalScore,
    mandatoryPassed,
    autoFilteredStatus,
    breakdown,
    aiAnalysisSummary,
  };
}
