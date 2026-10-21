import React, { useState } from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  FileText, 
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { ATSFeedback } from '@sikchakhub/shared-types';

export const AtsCheckerPage: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<ATSFeedback | null>(null);

  const sampleProfiles = [
    {
      label: 'Senior Physics Faculty (IIT-JEE)',
      exp: 8,
      text: `Dr. Rajesh Sharma - Senior Physics Educator & JEE Advanced Mentor
Email: rajesh.physics@gmail.com | Phone: +91 98765 43210 | Kota, Rajasthan

PROFESSIONAL SUMMARY
Dedicated Physics Educator with 8+ years specializing in JEE Advanced mechanics, electrodynamics, and modern physics. Produced top 50 AIR rankers in consecutive years with structured problem-solving frameworks. Expert in Lesson Planning, Formative Assessment, Differentiated Instruction, and NEP 2020 conceptual pedagogy.

KEY TEACHING COMPETENCIES & PEDAGOGY
- Curated advanced test papers and level-3 problem solving modules for 11th & 12th JEE Advanced batches.
- Conducted 1-on-1 mentorship and error-analysis clinics resulting in 94% board average and 40+ students in IITs.
- Utilized Smart Class & EdTech Tools (digital whiteboards, GeoGebra, interactive simulation labs).
- Conducted regular Parent-Teacher Collaboration conferences and remedial sessions for underperforming students.

EDUCATION & CERTIFICATIONS
- Ph.D & M.Sc in Physics (IIT Delhi)
- Certified JEE Advanced Master Mentor
- CBSE Senior Examiner Pedagogy Workshop`,
    },
    {
      label: 'TGT English Literature Teacher (Cambridge & CBSE)',
      exp: 4,
      text: `Ananya Sen - English Language & Literature Teacher
New Delhi | ananya.sen@gmail.com | +91 98111 22334

PROFILE
Passionate English Educator experienced in both CBSE board exam preparation and Cambridge IGCSE curriculum. Skilled in creative writing, debate moderation, and active flipped classroom methods.

EXPERIENCE & ACHIEVEMENTS
- Taught English Literature to Grades 6-10 with focus on Lesson Planning, Formative Assessment, and Phonics.
- Designed innovative curriculum incorporating Experiential Learning and Student Mentorship.
- Improved annual grade average by 18% across 3 sections through differentiated reading circles.
- Active integration of Google Classroom, interactive quizzes, and speech drama workshops.

QUALIFICATIONS
- M.A in English Literature & B.Ed
- Cambridge CELTA Pass A Certified`,
    }
  ];

  const handleScan = async (textToScan: string, exp: number) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/v1/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: textToScan, experienceYears: exp }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dedicated Education ATS Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            ATS Resume Checker for Educators
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Leading schools, coaching hubs, and edtech platforms screen educator resumes with automated filters. Check your keyword compatibility, pedagogical terminology, and impact scoring in real time.
          </p>
        </div>

        {/* 2-Column Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Input Resume or Experience Summary
              </h3>
              <span className="text-[11px] text-slate-400">Word Count: {resumeText.split(/\s+/).filter(Boolean).length}</span>
            </div>

            {/* Quick Demo Fill Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Or load a sample educator resume:</span>
              <div className="flex flex-wrap gap-2">
                {sampleProfiles.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setResumeText(p.text);
                      setExperienceYears(p.exp);
                      handleScan(p.text, p.exp);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-semibold border border-slate-200 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here (including summary, teaching experience, board achievements, qualifications, and classroom skills)..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Years Exp:</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-16 text-xs px-2 py-1 rounded border border-slate-300 text-center font-bold"
                />
              </div>

              <button
                type="button"
                onClick={() => handleScan(resumeText, experienceYears)}
                disabled={isScanning || !resumeText.trim()}
                className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 shadow-sm flex items-center gap-2 transition disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Keywords...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Scan ATS Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Analysis Report */}
          <div className="lg:col-span-7 space-y-6">
            {analysis ? (
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/90 space-y-6">
                {/* Score Banner */}
                <div className="bg-gradient-to-r from-slate-900 to-brand-900 text-white rounded-xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">ATS Readiness Benchmark</span>
                    <h4 className="text-xl font-bold font-serif">Resume Grade: {analysis.grade}</h4>
                    <p className="text-xs text-slate-300 max-w-sm">{analysis.summary}</p>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
                    <span className="text-3xl font-extrabold text-emerald-300 block">{analysis.overallScore}</span>
                    <span className="text-[10px] text-slate-300 font-semibold uppercase">out of 100</span>
                  </div>
                </div>

                {/* Metric Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Keywords</span>
                      <span className="font-bold text-slate-900">{analysis.keywordScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: `${analysis.keywordScore}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Education vocabulary</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Formatting</span>
                      <span className="font-bold text-slate-900">{analysis.formattingScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${analysis.formattingScore}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Structure & contact info</span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Impact Metrics</span>
                      <span className="font-bold text-slate-900">{analysis.contentImpactScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600 rounded-full" style={{ width: `${analysis.contentImpactScore}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Quantified results & ranks</span>
                  </div>
                </div>

                {/* Keywords breakdown */}
                <div className="space-y-4">
                  {/* Found */}
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Identified Pedagogy & Classroom Keywords ({analysis.matchingKeywords.length})</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchingKeywords.map((kw, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="space-y-1.5 pt-2">
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Recommended Missing Keywords for Education Portals ({analysis.missingKeywords.length})</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingKeywords.map((kw, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Actionable Improvement Suggestions
                  </h5>
                  <div className="space-y-1.5">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200/90 shadow-xs">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-800">No Resume Analyzed Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Paste your resume in the editor on the left or select a sample educator profile to generate your instant ATS compatibility score.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
