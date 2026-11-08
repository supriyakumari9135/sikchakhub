import { Router, Request, Response } from 'express';
import { MasterDataModel } from '../db/mongodb';

const router = Router();

const DEFAULT_SUBJECTS = [
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

const DEFAULT_TEACHING_LEVELS = [
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

const DEFAULT_BOARDS = [
  { value: 'CBSE', label: 'CBSE (Central Board of Secondary Education)' },
  { value: 'ICSE', label: 'CISCE / ICSE / ISC' },
  { value: 'CAMBRIDGE', label: 'Cambridge Assessment International (IGCSE / A-Levels)' },
  { value: 'IB', label: 'IB (International Baccalaureate)' },
  { value: 'STATE_BOARD', label: 'State Educational Board' },
  { value: 'OTHER', label: 'Coaching / Higher Education / Other' },
];

const DEFAULT_CITIES = [
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

const DEFAULT_QUALIFICATIONS = [
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

router.get('/', async (req: Request, res: Response) => {
  try {
    const dbItems = await MasterDataModel.find({ isActive: true }).sort({ order: 1 }).lean();

    const dbSubjects = dbItems.filter(i => i.category === 'SUBJECT').map(i => i.label);
    const dbLevels = dbItems.filter(i => i.category === 'TEACHING_CATEGORY').map(i => ({ value: i.value, label: i.label }));
    const dbBoards = dbItems.filter(i => i.category === 'BOARD').map(i => ({ value: i.value, label: i.label }));
    const dbQualifications = dbItems.filter(i => i.category === 'QUALIFICATION').map(i => i.label);
    const dbCities = dbItems.filter(i => i.category === 'CITY').map(i => i.label);

    const subjects = dbSubjects.length > 0 ? Array.from(new Set([...dbSubjects, ...DEFAULT_SUBJECTS])) : DEFAULT_SUBJECTS;
    const teachingLevels = dbLevels.length > 0 ? dbLevels : DEFAULT_TEACHING_LEVELS;
    const boards = dbBoards.length > 0 ? dbBoards : DEFAULT_BOARDS;
    const qualifications = dbQualifications.length > 0 ? Array.from(new Set([...dbQualifications, ...DEFAULT_QUALIFICATIONS])) : DEFAULT_QUALIFICATIONS;
    const cities = dbCities.length > 0 ? Array.from(new Set([...dbCities, ...DEFAULT_CITIES])) : DEFAULT_CITIES;

    return res.json({
      success: true,
      data: {
        subjects,
        teachingLevels,
        boards,
        cities,
        qualifications,
      },
    });
  } catch (err: any) {
    return res.json({
      success: true,
      data: {
        subjects: DEFAULT_SUBJECTS,
        teachingLevels: DEFAULT_TEACHING_LEVELS,
        boards: DEFAULT_BOARDS,
        cities: DEFAULT_CITIES,
        qualifications: DEFAULT_QUALIFICATIONS,
      },
    });
  }
});

export default router;
