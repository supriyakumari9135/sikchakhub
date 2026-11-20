import { 
  User, 
  TeacherProfile, 
  Institution, 
  JobVacancy, 
  JobApplication, 
  Interview 
} from '../types';

export const SEED_USERS: (User & { passwordHash?: string })[] = [];

export const SEED_TEACHER_PROFILES: Record<string, TeacherProfile> = {};

export const SEED_INSTITUTIONS: Institution[] = [];

export const SEED_JOBS: JobVacancy[] = [];

export const SEED_APPLICATIONS: JobApplication[] = [];

export const SEED_INTERVIEWS: Interview[] = [];
