import { Router, Request, Response } from 'express';

const router = Router();

const SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'English',
  'Computer Science',
  'Artificial Intelligence',
  'Social Science / History',
  'Geography',
  'Economics',
  'Commerce & Accountancy',
  'Hindi',
  'Sanskrit',
  'Physical Education',
  'Music & Performing Arts',
  'Special Education',
];

const TEACHING_LEVELS = [
  { value: 'PRE_PRIMARY', label: 'Pre-Primary / Nursery / Kindergarten' },
  { value: 'PRT', label: 'PRT - Primary Teacher (Grades 1-5)' },
  { value: 'TGT', label: 'TGT - Trained Graduate Teacher (Grades 6-10)' },
  { value: 'PGT', label: 'PGT - Post Graduate Teacher (Grades 11-12)' },
  { value: 'COACHING_JEE', label: 'IIT-JEE Coaching Faculty' },
  { value: 'COACHING_NEET', label: 'NEET Medical Faculty' },
  { value: 'COLLEGE_PROFESSOR', label: 'College / University Professor' },
  { value: 'PRINCIPAL', label: 'Principal / Vice Principal / Dean' },
  { value: 'ADMINISTRATOR', label: 'Academic Coordinator / Administrator' },
];

const BOARDS = [
  { value: 'CBSE', label: 'CBSE (Central Board of Secondary Education)' },
  { value: 'ICSE', label: 'CISCE / ICSE / ISC' },
  { value: 'CAMBRIDGE', label: 'Cambridge Assessment International (IGCSE / A-Levels)' },
  { value: 'IB', label: 'IB (International Baccalaureate)' },
  { value: 'STATE_BOARD', label: 'State Educational Board' },
  { value: 'OTHER', label: 'Coaching / Higher Education / Other' },
];

const MAJOR_CITIES = [
  'New Delhi',
  'Kota',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Mumbai',
  'Kolkata',
  'Chennai',
  'Jaipur',
  'Patna',
  'Lucknow',
  'Ahmedabad',
  'Chandigarh',
  'Dehradun',
  'Indore',
];

const QUALIFICATIONS = [
  'B.Ed (Bachelor of Education)',
  'M.Ed (Master of Education)',
  'D.El.Ed / NTT',
  'M.Sc (Master of Science)',
  'B.Sc (Bachelor of Science)',
  'M.A (Master of Arts)',
  'B.A (Bachelor of Arts)',
  'B.Tech / B.E',
  'M.Tech',
  'Ph.D (Doctorate)',
  'CTET / State TET Qualified',
];

router.get('/', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      subjects: SUBJECTS,
      teachingLevels: TEACHING_LEVELS,
      boards: BOARDS,
      cities: MAJOR_CITIES,
      qualifications: QUALIFICATIONS,
    },
  });
});

export default router;
