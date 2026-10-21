import { 
  User, 
  TeacherProfile, 
  Institution, 
  JobVacancy, 
  JobApplication, 
  Interview,
  AuditLog
} from '@sikchakhub/shared-types';
import { 
  SEED_USERS, 
  SEED_TEACHER_PROFILES, 
  SEED_INSTITUTIONS, 
  SEED_JOBS, 
  SEED_APPLICATIONS, 
  SEED_INTERVIEWS 
} from './seedData';
import { inMemoryAuditLogs } from '../middleware/auditLogger';

class DataStore {
  public users: (User & { passwordHash?: string })[] = [...SEED_USERS];
  public profiles: Record<string, TeacherProfile> = { ...SEED_TEACHER_PROFILES };
  public institutions: Institution[] = [...SEED_INSTITUTIONS];
  public jobs: JobVacancy[] = [...SEED_JOBS];
  public applications: JobApplication[] = [...SEED_APPLICATIONS];
  public interviews: Interview[] = [...SEED_INTERVIEWS];
  public auditLogs: AuditLog[] = inMemoryAuditLogs;
  public savedJobs: { userId: string; jobId: string; createdAt: string }[] = [];

  // Helper getters
  getUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getProfileByUserId(userId: string) {
    return this.profiles[userId];
  }

  getInstitutionById(id: string) {
    return this.institutions.find(i => i.id === id);
  }

  getJobById(id: string) {
    const job = this.jobs.find(j => j.id === id);
    if (!job) return undefined;
    const inst = this.getInstitutionById(job.institutionId);
    return { ...job, institution: inst };
  }

  getApplicationsByJobId(jobId: string) {
    return this.applications
      .filter(a => a.jobId === jobId)
      .map(app => {
        const user = this.getUserById(app.teacherId);
        const profile = this.getProfileByUserId(app.teacherId);
        return {
          ...app,
          teacher: user ? { ...user, profile } : undefined,
        };
      });
  }

  getApplicationsByTeacherId(teacherId: string) {
    return this.applications
      .filter(a => a.teacherId === teacherId)
      .map(app => {
        const job = this.getJobById(app.jobId);
        return { ...app, job };
      });
  }
}

export const dbStore = new DataStore();
