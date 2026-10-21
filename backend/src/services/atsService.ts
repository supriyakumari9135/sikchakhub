import { ATSFeedback } from '@sikchakhub/shared-types';

const KEYWORD_BANK = [
  'Lesson Planning',
  'Classroom Management',
  'Differentiated Instruction',
  'NEP 2020 Guidelines',
  'Formative Assessment',
  'Summative Evaluation',
  'Student Mentorship',
  'Board Examination Prep',
  'Olympiad & JEE Coaching',
  'Experiential Learning',
  'Curriculum Design',
  'Parent-Teacher Collaboration',
  'Smart Class & EdTech Tools',
  'STEM Pedagogy',
  'Remedial Classes',
  'Student Performance Tracking',
];

export function analyzeResumeATS(textOrBio: string, experienceYears: number = 2): ATSFeedback {
  const content = (textOrBio || '').toLowerCase();
  
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  KEYWORD_BANK.forEach(kw => {
    if (content.includes(kw.toLowerCase()) || 
        kw.toLowerCase().split(' ').some(word => word.length > 4 && content.includes(word))) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordDensityRatio = Math.min(1, foundKeywords.length / 8);
  const keywordScore = Math.round(keywordDensityRatio * 100);

  // Formatting & structural heuristics
  let formattingScore = 75;
  if (content.length > 300) formattingScore += 10;
  if (content.includes('@') || content.includes('contact') || content.includes('phone') || content.includes('email')) formattingScore += 10;
  if (content.length < 100) formattingScore = 40;
  formattingScore = Math.min(100, formattingScore);

  // Content impact heuristics (metrics, achievements, % results)
  let contentImpactScore = 60;
  if (content.match(/\d+%/g) || content.match(/\d+\s*(students|batches|years|rankers)/i)) {
    contentImpactScore += 25;
  }
  if (experienceYears >= 3) contentImpactScore += 10;
  contentImpactScore = Math.min(100, contentImpactScore);

  const overallScore = Math.round((keywordScore * 0.4) + (formattingScore * 0.3) + (contentImpactScore * 0.3));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'NEEDS_WORK' = 'B';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 65) grade = 'B';
  else if (overallScore >= 50) grade = 'C';
  else grade = 'NEEDS_WORK';

  const recommendations: string[] = [];
  if (foundKeywords.length < 5) {
    recommendations.push(`Incorporate pedagogical keywords like "${missingKeywords.slice(0, 3).join('", "')}" to pass school ATS filters.`);
  }
  if (!content.match(/\d+%/g)) {
    recommendations.push('Include quantifiable student results (e.g., "Improved board exam pass rate by 18%", "Mentored 40+ students to top 5% JEE ranks").');
  }
  if (!content.includes('nep 2020') && !content.includes('experiential')) {
    recommendations.push('Highlight familiarity with NEP 2020 guidelines and active learning methodologies.');
  }
  if (content.length < 250) {
    recommendations.push('Add an impactful 3-line professional summary highlighting your primary subjects, target boards, and teaching philosophy.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain an updated portfolio link or video demonstration link of your live classroom teaching sessions.');
  }

  const summary = overallScore >= 80
    ? 'Outstanding resume structure! Your profile demonstrates strong curriculum mastery and high ATS compatibility with top school and coaching portals.'
    : overallScore >= 65
    ? 'Solid profile with clear teaching credentials. Adding specific pedagogy frameworks and quantifiable student outcomes will elevate your recruiter visibility.'
    : 'Your resume needs optimization to rank higher in recruiter searches. Apply the recommended keywords and format adjustments below.';

  return {
    overallScore,
    grade,
    summary,
    keywordScore,
    formattingScore,
    contentImpactScore,
    matchingKeywords: foundKeywords,
    missingKeywords: missingKeywords.slice(0, 6),
    recommendations,
  };
}
