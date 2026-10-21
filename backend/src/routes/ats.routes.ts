import { Router, Request, Response } from 'express';
import { analyzeResumeATS } from '../services/atsService';
import { optionalJWT } from '../middleware/authMiddleware';
import { dbStore } from '../db/store';

const router = Router();

// POST /api/v1/ats/analyze
router.post('/analyze', optionalJWT, (req: Request, res: Response) => {
  const { resumeText, experienceYears } = req.body;

  let textToAnalyze = resumeText;
  let exp = experienceYears || 2;

  // If user is authenticated and no text provided, use their bio/headline
  if (!textToAnalyze && req.user) {
    const profile = dbStore.getProfileByUserId(req.user.id);
    if (profile) {
      textToAnalyze = `${profile.headline || ''} ${profile.bio || ''} ${profile.skills?.join(' ') || ''} ${profile.subjects?.join(' ') || ''} ${profile.highestQualification || ''}`;
      exp = profile.experienceYears || 2;
    }
  }

  if (!textToAnalyze || textToAnalyze.trim().length === 0) {
    textToAnalyze = `Senior Physics & Mathematics Faculty with 6 years experience preparing students for CBSE 12th Board examinations and IIT-JEE Advanced. Expert in Lesson Planning, Formative Assessment, Differentiated Instruction, and NEP 2020 experiential learning. Mentored 200+ students with 94% board average and produced multiple top 1000 JEE ranks. Proficient in smart class tools, digital whiteboards, and LMS platforms.`;
  }

  const analysis = analyzeResumeATS(textToAnalyze, exp);

  return res.json({
    success: true,
    analysis,
  });
});

export default router;
