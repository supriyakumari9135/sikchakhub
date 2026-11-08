"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = extractPdfText;
exports.parseResumeText = parseResumeText;
exports.calculateCandidateScreening = calculateCandidateScreening;
exports.analyzeApplicationATS = analyzeApplicationATS;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Extracts plain text from an uploaded PDF file or base64 data buffer.
 */
async function extractPdfText(resumeUrlOrBuffer) {
    try {
        let buffer;
        if (Buffer.isBuffer(resumeUrlOrBuffer)) {
            buffer = resumeUrlOrBuffer;
        }
        else if (typeof resumeUrlOrBuffer === 'string') {
            if (resumeUrlOrBuffer.startsWith('data:application/pdf;base64,')) {
                const base64Data = resumeUrlOrBuffer.replace(/^data:application\/pdf;base64,/, '');
                buffer = Buffer.from(base64Data, 'base64');
            }
            else {
                // Normalize URL or path
                let cleanPath = resumeUrlOrBuffer.replace(/^https?:\/\/[^\/]+/, '');
                cleanPath = cleanPath.replace(/^\/?(api\/v1\/)?/, '');
                if (cleanPath.startsWith('/uploads/'))
                    cleanPath = cleanPath.substring(1);
                let resolvedPath = path_1.default.isAbsolute(cleanPath) ? cleanPath : path_1.default.join(process.cwd(), cleanPath);
                if (!fs_1.default.existsSync(resolvedPath)) {
                    // Try uploads/resumes subfolder with basename
                    const fallbackPath = path_1.default.join(process.cwd(), 'uploads', 'resumes', path_1.default.basename(cleanPath));
                    if (fs_1.default.existsSync(fallbackPath)) {
                        resolvedPath = fallbackPath;
                    }
                    else {
                        return null;
                    }
                }
                buffer = fs_1.default.readFileSync(resolvedPath);
            }
        }
        else {
            return null;
        }
        // Use pdf-parse to extract text
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        if (result && result.pages && Array.isArray(result.pages)) {
            return result.pages.map((p) => p.text).join('\n');
        }
        return result?.text || null;
    }
    catch (err) {
        console.warn('PDF text extraction error:', err);
        return null;
    }
}
/**
 * Parses structured candidate entities from raw resume text.
 */
function parseResumeText(text) {
    if (!text || typeof text !== 'string')
        return {};
    const cleanText = text.replace(/\r/g, '');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    // 1. Email extraction
    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    const email = emailMatch ? emailMatch[0].toLowerCase() : undefined;
    // 2. Phone extraction
    const phoneMatch = cleanText.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;
    // 3. Candidate name (typically first line or lines before contact info)
    let fullName = lines[0] || 'Applicant';
    if (fullName.includes('Resume') || fullName.includes('Curriculum') || fullName.length < 3) {
        fullName = lines[1] || fullName;
    }
    // Strip phone/email if accidentally caught on first line
    fullName = fullName.replace(/(?:Ph:|Email:|LinkedIn:|\+91|\S+@\S+).*/i, '').trim();
    // 4. Degree & Major detection
    let degree = '';
    const degreeRegexes = [
        /B\.?Tech(?:\s+in\s+[^|\n]+)?/i,
        /M\.?Tech(?:\s+in\s+[^|\n]+)?/i,
        /B\.?Sc(?:\s+in\s+[^|\n]+)?/i,
        /M\.?Sc(?:\s+in\s+[^|\n]+)?/i,
        /Ph\.?D(?:\s+in\s+[^|\n]+)?/i,
        /B\.?Ed(?:\s+in\s+[^|\n]+)?/i,
        /M\.?Ed(?:\s+in\s+[^|\n]+)?/i,
        /BCA|MCA/i,
        /Bachelor of [^\n|]+/i,
        /Master of [^\n|]+/i,
    ];
    for (const reg of degreeRegexes) {
        const match = cleanText.match(reg);
        if (match) {
            degree = match[0].trim();
            break;
        }
    }
    // 5. Institution / University detection
    let institutionName = '';
    const universityMatch = cleanText.match(/(?:Education\s+)?([A-Z0-9.\s]+(?:University|College|Institute|Campus)[^\n|,]*)/i);
    if (universityMatch) {
        institutionName = universityMatch[1].replace(/[\n\r]+/g, ' ').trim().replace(/^(?:Education|Institution)\s*/i, '').trim();
    }
    // 6. Primary Domain detection based on keyword density
    const domainCounters = {
        cs: (cleanText.match(/computer science|cse|ai\/ml|react|node|mern|python|java|c\+\+|full-stack|software|nlp|langchain|sql/gi) || []).length,
        physics: (cleanText.match(/physics|classical mechanics|electromagnetism|optics|thermodynamics|quantum|kinematics|gravitation|jee physics/gi) || []).length,
        math: (cleanText.match(/mathematics|calculus|algebra|trigonometry|geometry|statistics|probability|jee maths/gi) || []).length,
        chemistry: (cleanText.match(/chemistry|organic chemistry|inorganic chemistry|chemical kinetics|coordination compounds|jee chemistry/gi) || []).length,
        biology: (cleanText.match(/biology|botany|zoology|genetics|biotechnology|human physiology|neet biology/gi) || []).length,
        english: (cleanText.match(/english literature|grammar|linguistics|prose|poetry|phonetics/gi) || []).length,
    };
    let primaryDomain = 'General Education';
    let maxCount = 0;
    if (domainCounters.cs > maxCount) {
        maxCount = domainCounters.cs;
        primaryDomain = 'Computer Science & AI/ML';
    }
    if (domainCounters.physics > maxCount) {
        maxCount = domainCounters.physics;
        primaryDomain = 'Physics & Physical Sciences';
    }
    if (domainCounters.math > maxCount) {
        maxCount = domainCounters.math;
        primaryDomain = 'Mathematics & Quantitative Sciences';
    }
    if (domainCounters.chemistry > maxCount) {
        maxCount = domainCounters.chemistry;
        primaryDomain = 'Chemistry & Chemical Sciences';
    }
    if (domainCounters.biology > maxCount) {
        maxCount = domainCounters.biology;
        primaryDomain = 'Biological & Life Sciences';
    }
    if (domainCounters.english > maxCount) {
        maxCount = domainCounters.english;
        primaryDomain = 'English Language & Pedagogy';
    }
    // 7. Extract technical & pedagogical skills list
    const knownSkills = [
        'Java', 'C++', 'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'React Native',
        'Node.js', 'Express.js', 'Socket.io', 'NLP', 'RAG', 'LangChain', 'LLM', 'n8n',
        'MongoDB', 'MySQL', 'Git', 'AWS', 'Docker', 'Linux', 'DSA', 'OOP', 'Machine Learning',
        'Classical Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Quantum Mechanics',
        'Calculus', 'Linear Algebra', 'Coordinate Geometry', 'Organic Chemistry', 'Inorganic Chemistry',
        'Physical Chemistry', 'Genetics', 'Cell Biology', 'Botany', 'Zoology',
        'Classroom Teaching', 'Lesson Planning', 'Curriculum Design', 'Lab Instruction', 'IIT-JEE Prep',
        'NEET Prep', 'Board Exam Prep', 'Student Mentoring', 'Problem Solving', 'Doubt Resolution'
    ];
    const skills = [];
    const textLower = cleanText.toLowerCase();
    for (const sk of knownSkills) {
        if (textLower.includes(sk.toLowerCase())) {
            skills.push(sk);
        }
    }
    // 8. Projects & Achievements extraction
    const projects = [];
    const projectMatches = cleanText.match(/([A-Z][A-Za-z0-9\s]+)\s*\[(?:GitHub|Link)\]/g);
    if (projectMatches) {
        projectMatches.forEach(p => {
            let clean = p.replace(/\[(?:GitHub|Link)\]/i, '').trim();
            clean = clean.replace(/^(?:Projects|Experience|Achievements)\s*[\n:]*\s*/i, '').replace(/[\n\r]+/g, ' ').trim();
            if (clean && !projects.includes(clean))
                projects.push(clean);
        });
    }
    // 9. Experience estimation
    let experienceYears = 0;
    if (/2024\s*[–-]\s*Present|freelance|self-initiated/i.test(cleanText)) {
        experienceYears = 1.5;
    }
    const expMatch = cleanText.match(/(\d+)\+?\s*years?(?:\s+of)?\s+experience/i);
    if (expMatch) {
        experienceYears = Math.max(experienceYears, Number(expMatch[1]));
    }
    return {
        fullName,
        email,
        phone,
        degree: degree || 'Bachelor Degree',
        institutionName: institutionName || 'Accredited Institution',
        primaryDomain,
        skills: skills.length > 0 ? skills : ['Teaching & Instruction', 'Curriculum Delivery'],
        experienceYears,
        projects: projects.length > 0 ? projects : undefined,
    };
}
/**
 * Calculates deterministic ATS screening score against a job vacancy.
 * Supports parsed CV resume data when available.
 */
function calculateCandidateScreening(job, candidate, customAnswers = {}, parsedCvData) {
    const breakdown = [];
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
    const cv = parsedCvData;
    const jobSubject = (job.subject || '').toLowerCase().trim();
    const cvDomain = (cv?.primaryDomain || '').toLowerCase();
    const cvDegree = (cv?.degree || profile.highestQualification || '').toLowerCase();
    const candidateSubjects = (profile.subjects || []).map(s => s.toLowerCase());
    let totalScore = 0;
    let mandatoryPassed = true;
    // -------------------------------------------------------------
    // BRANCH A: RICH ATS RESUME PARSED MODE
    // When a verified CV has been uploaded and parsed
    // -------------------------------------------------------------
    if (cv) {
        const cvDomain = (cv.primaryDomain || '').toLowerCase();
        const cvDegree = (cv.degree || profile.highestQualification || '').toLowerCase();
        // 1. Subject & Domain Match (Weight: 30 pts)
        const subjectWeight = 30;
        let subjectScore = 0;
        let subjectNotes = '';
        let subjectPassed = false;
        const isExactDomainMatch = cvDomain.includes(jobSubject) ||
            cvDegree.includes(jobSubject) ||
            candidateSubjects.some(s => s.includes(jobSubject) || jobSubject.includes(s));
        const isStemOverlap = (jobSubject.includes('math') && cvDomain.includes('computer science')) ||
            (jobSubject.includes('computer') && cvDomain.includes('math')) ||
            (jobSubject.includes('physics') && cvDomain.includes('math'));
        if (isExactDomainMatch) {
            subjectScore = 100;
            subjectPassed = true;
            subjectNotes = `Strong alignment with required subject (${job.subject}) verified in credentials.`;
        }
        else if (isStemOverlap) {
            subjectScore = 65;
            subjectPassed = true;
            subjectNotes = `Related quantitative STEM background (${cv.primaryDomain || 'Engineering'}) provides foundation for ${job.subject}.`;
        }
        else {
            subjectScore = 25;
            subjectPassed = false;
            subjectNotes = `Domain Mismatch: Candidate's verified profile is in ${cv.primaryDomain || 'Engineering'}, while vacancy requires dedicated ${job.subject} instruction.`;
        }
        const subjectPts = Math.round((subjectScore * subjectWeight) / 100);
        totalScore += subjectPts;
        breakdown.push({
            criterion: 'Subject & Domain Relevance',
            required: job.subject,
            actual: cv.primaryDomain ? `${cv.primaryDomain} (${cv.degree || 'Degree'})` : (profile.subjects?.join(', ') || 'Not specified'),
            passed: subjectPassed,
            scoreContribution: subjectPts,
            weight: subjectWeight,
            notes: subjectNotes,
        });
        // 2. Key Skills & ATS Keyword Alignment (Weight: 25 pts)
        const skillsWeight = 25;
        let matchedKeywords = [];
        let missingKeywords = [];
        const subjectKeywordMap = {
            physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Lab Experiments', 'IIT-JEE Prep', 'Problem Solving', 'Formula Application'],
            chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Reaction Mechanisms', 'Lab Safety', 'NEET Prep', 'Chemical Kinetics'],
            mathematics: ['Calculus', 'Algebra', 'Trigonometry', 'Coordinate Geometry', 'Probability', 'IIT-JEE Maths', 'Analytical Reasoning'],
            'computer science': ['Python', 'Java', 'C++', 'Data Structures', 'Algorithms', 'Web Development', 'Database', 'OOP', 'AI/ML', 'Problem Solving'],
            biology: ['Cell Biology', 'Genetics', 'Botany', 'Zoology', 'Human Physiology', 'NEET Prep', 'Biotechnology'],
            english: ['Grammar', 'English Literature', 'Lesson Planning', 'Communication Skills', 'Creative Writing', 'Curriculum Delivery'],
        };
        const defaultKeywords = ['Lesson Planning', 'Curriculum Delivery', 'Student Mentoring', 'Classroom Teaching', 'Doubt Resolution', 'Problem Solving'];
        let targetKeywords = defaultKeywords;
        for (const [key, kwList] of Object.entries(subjectKeywordMap)) {
            if (jobSubject.includes(key)) {
                targetKeywords = kwList;
                break;
            }
        }
        const candidateSkills = cv.skills || profile.skills || [];
        const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
        targetKeywords.forEach(kw => {
            if (candidateSkillsLower.some(cs => cs.includes(kw.toLowerCase()) || kw.toLowerCase().includes(cs))) {
                matchedKeywords.push(kw);
            }
            else {
                missingKeywords.push(kw);
            }
        });
        const matchRatio = targetKeywords.length > 0 ? (matchedKeywords.length / targetKeywords.length) : 0.5;
        const skillsScore = Math.round(Math.min(100, Math.max(20, matchRatio * 100 + (candidateSkills.length > 5 ? 15 : 0))));
        const skillsPts = Math.round((skillsScore * skillsWeight) / 100);
        totalScore += skillsPts;
        breakdown.push({
            criterion: 'Key Skills & ATS Keywords',
            required: `${job.subject} Core Competencies (${targetKeywords.slice(0, 4).join(', ')})`,
            actual: matchedKeywords.length > 0 ? matchedKeywords.join(', ') : 'General Problem Solving',
            passed: matchedKeywords.length >= 2,
            scoreContribution: skillsPts,
            weight: skillsWeight,
            notes: matchedKeywords.length >= 2
                ? `Matched ${matchedKeywords.length} core subject keywords. ${missingKeywords.length > 0 ? `Missing: ${missingKeywords.slice(0, 3).join(', ')}` : ''}`
                : `Lacks domain-specific ${job.subject} instructional keywords in CV. Found general technical skills.`,
            matchedKeywords,
            missingKeywords,
        });
        // 3. Academic Qualification Match (Weight: 20 pts)
        const qualWeight = 20;
        const candidateDegree = cv.degree || profile.highestQualification || '';
        const candidateDegreeLower = candidateDegree.toLowerCase();
        const requiredQualLower = (job.requiredQualification || 'post graduate').toLowerCase();
        let qualScore = 50;
        let qualPassed = false;
        let qualNotes = '';
        const hasPostGrad = candidateDegreeLower.includes('m.sc') || candidateDegreeLower.includes('m.tech') || candidateDegreeLower.includes('ph.d') || candidateDegreeLower.includes('master');
        const hasBachelor = candidateDegreeLower.includes('b.tech') || candidateDegreeLower.includes('b.sc') || candidateDegreeLower.includes('b.e') || candidateDegreeLower.includes('bachelor');
        if (candidateDegreeLower.includes(requiredQualLower) || (requiredQualLower.includes('post graduate') && hasPostGrad)) {
            qualScore = 100;
            qualPassed = true;
            qualNotes = `Directly holds required credential (${candidateDegree}) from ${cv.institutionName || 'recognized institution'}.`;
        }
        else if (hasBachelor) {
            qualScore = 65;
            qualPassed = true;
            qualNotes = `Holds accredited engineering/graduate degree (${candidateDegree}) from ${cv.institutionName || 'recognized university'}.`;
        }
        else {
            qualScore = 40;
            qualPassed = false;
            qualNotes = `Degree verification required during preliminary screening rounds.`;
        }
        const qualPts = Math.round((qualScore * qualWeight) / 100);
        totalScore += qualPts;
        breakdown.push({
            criterion: 'Academic Qualification',
            required: job.requiredQualification || 'Post Graduate / B.Ed',
            actual: candidateDegree || 'Graduate Degree',
            passed: qualPassed,
            scoreContribution: qualPts,
            weight: qualWeight,
            notes: qualNotes,
        });
        // 4. Experience & Practical Track Record (Weight: 15 pts)
        const expWeight = 15;
        const requiredExp = rules.minExperienceYears || job.minExperienceYears || 1;
        const actualExp = cv.experienceYears ? cv.experienceYears : (profile.experienceYears || 0);
        const expPassed = actualExp >= requiredExp;
        const expRatio = requiredExp > 0 ? Math.min(1.2, actualExp / requiredExp) : 1;
        const expScore = Math.round(Math.min(100, Math.max(30, expRatio * 100)));
        const expPts = Math.round((expScore * expWeight) / 100);
        totalScore += expPts;
        breakdown.push({
            criterion: 'Experience & Practical Track Record',
            required: `${requiredExp}+ years experience`,
            actual: cv.projects && cv.projects.length > 0
                ? `${actualExp} yrs (${cv.projects.length} verified projects / freelance)`
                : `${actualExp} years experience`,
            passed: expPassed,
            scoreContribution: expPts,
            weight: expWeight,
            notes: expPassed
                ? `Meets minimum experience criteria with documented projects and instruction history.`
                : `Candidate has ${actualExp} yrs experience vs ${requiredExp} yrs required by school.`,
        });
        // 5. Teaching Level & Curriculum Alignment (Weight: 10 pts)
        const levelWeight = 10;
        const levelScore = 75;
        const levelPts = Math.round((levelScore * levelWeight) / 100);
        totalScore += levelPts;
        breakdown.push({
            criterion: 'Teaching Level & Board Alignment',
            required: `${job.teachingLevel} (${job.board})`,
            actual: `${profile.teachingLevels?.join(', ') || job.teachingLevel} / ${profile.boards?.join(', ') || job.board}`,
            passed: true,
            scoreContribution: levelPts,
            weight: levelWeight,
            notes: `Compatible with ${job.board} curriculum framework and target ${job.teachingLevel} age group.`,
        });
        const finalScore = Math.min(100, Math.max(15, Math.round(totalScore)));
        const matchGrade = finalScore >= 80 ? 'TOP_TIER' : finalScore >= 60 ? 'POTENTIAL' : 'DOMAIN_MISMATCH';
        const autoFilteredStatus = (finalScore >= 55 && mandatoryPassed) ? 'QUALIFIED' : 'UNMATCHED';
        let aiAnalysisSummary = '';
        if (matchGrade === 'TOP_TIER') {
            aiAnalysisSummary = `Top Tier Match (${finalScore}% ATS): Candidate profile and verified credentials in ${cv.primaryDomain || job.subject} exhibit exceptional synergy with vacancy expectations. Demonstrates strong competency in ${matchedKeywords.slice(0, 3).join(', ') || job.subject} and accredited academic qualifications (${candidateDegree}).`;
        }
        else if (matchGrade === 'POTENTIAL') {
            aiAnalysisSummary = `Potential Match (${finalScore}% ATS): Suitable foundation for ${job.subject} instruction. While the candidate possesses strong analytical and practical background (${candidateDegree}), recommend evaluating depth in ${missingKeywords.slice(0, 2).join(', ') || 'curriculum delivery'} during demo session.`;
        }
        else {
            aiAnalysisSummary = `Domain Mismatch (${finalScore}% ATS): Candidate's verified expertise is in ${cv.primaryDomain || 'Software/Engineering'} with ${candidateDegree || 'Technical Degree'}, whereas this vacancy specifically demands dedicated ${job.subject} curriculum pedagogy and subject-matter credentials (${job.requiredQualification || 'M.Sc.'}).`;
        }
        return {
            overallScore: finalScore,
            mandatoryPassed,
            autoFilteredStatus,
            matchGrade,
            breakdown,
            aiAnalysisSummary,
            matchedKeywords,
            missingKeywords,
            parsedResume: cv,
        };
    }
    // -------------------------------------------------------------
    // BRANCH B: PROFILE FALLBACK MODE (When no CV uploaded or testing)
    // Evaluates strictly against screeningRules weights
    // -------------------------------------------------------------
    const subjectWeight = rules.subjectWeight || 20;
    const candidateSubjectsMatch = candidateSubjects.some(s => s.includes(jobSubject) || jobSubject.includes(s));
    const subjectScore = candidateSubjectsMatch ? 100 : 25;
    totalScore += (subjectScore * subjectWeight) / 100;
    breakdown.push({
        criterion: 'Subject Expertise',
        required: job.subject,
        actual: profile.subjects?.join(', ') || 'None listed',
        passed: candidateSubjectsMatch,
        scoreContribution: Math.round((subjectScore * subjectWeight) / 100),
        weight: subjectWeight,
        notes: candidateSubjectsMatch
            ? `Strong match with required subject (${job.subject})`
            : `Primary subject not explicitly listed in teacher profile`,
    });
    const expWeight = rules.experienceWeight || 30;
    const requiredExp = rules.minExperienceYears || job.minExperienceYears || 0;
    const actualExp = profile.experienceYears || 0;
    const expPassed = actualExp >= requiredExp;
    const expRatio = requiredExp > 0 ? Math.min(1.2, actualExp / requiredExp) : 1;
    const expScore = Math.round(Math.min(100, expRatio * 100));
    totalScore += (expScore * expWeight) / 100;
    breakdown.push({
        criterion: 'Teaching Experience',
        required: `${requiredExp}+ years`,
        actual: `${actualExp} years`,
        passed: expPassed,
        scoreContribution: Math.round((expScore * expWeight) / 100),
        weight: expWeight,
        notes: expPassed
            ? `Meets minimum experience criteria (${actualExp} yrs vs ${requiredExp} yrs required)`
            : `Below requested minimum experience by ${(requiredExp - actualExp).toFixed(1)} years`,
    });
    const qualWeight = rules.qualificationWeight || 10;
    const candidateQual = (profile.highestQualification || '').toLowerCase();
    const requiredQual = (job.requiredQualification || '').toLowerCase();
    const qualPassed = candidateQual.length > 0 && (candidateQual.includes('ph.d') ||
        candidateQual.includes('m.sc') ||
        candidateQual.includes('m.a') ||
        candidateQual.includes('m.tech') ||
        candidateQual.includes('b.ed') ||
        candidateQual.includes('b.tech') ||
        candidateQual.includes(requiredQual));
    const qualScore = qualPassed ? 100 : 50;
    totalScore += (qualScore * qualWeight) / 100;
    breakdown.push({
        criterion: 'Academic Qualification',
        required: job.requiredQualification,
        actual: profile.highestQualification || 'Not specified',
        passed: qualPassed,
        scoreContribution: Math.round((qualScore * qualWeight) / 100),
        weight: qualWeight,
        notes: qualPassed
            ? `Holds accredited degree aligned with vacancy criteria`
            : `Degree verification needed during interview stage`,
    });
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
        matchGrade: finalScore >= 80 ? 'TOP_TIER' : finalScore >= 60 ? 'POTENTIAL' : 'DOMAIN_MISMATCH',
        breakdown,
        aiAnalysisSummary,
    };
}
/**
 * High-level helper that extracts PDF text, parses entities, and runs the ATS engine.
 */
async function analyzeApplicationATS(job, candidate, customAnswers = {}) {
    let parsedCvData;
    // 1. If raw text provided or PDF resume exists, extract and parse
    let text = candidate.resumeText;
    if (!text && candidate.resumeUrl) {
        text = await extractPdfText(candidate.resumeUrl) || undefined;
    }
    if (!text && candidate.profile?.resumeUrl) {
        text = await extractPdfText(candidate.profile.resumeUrl) || undefined;
    }
    if (text) {
        parsedCvData = parseResumeText(text);
    }
    // 2. Run ATS Scoring Engine
    return calculateCandidateScreening(job, candidate, customAnswers, parsedCvData);
}
