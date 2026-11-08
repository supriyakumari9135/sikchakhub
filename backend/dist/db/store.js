"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbStore = void 0;
const auditLogger_1 = require("../middleware/auditLogger");
class DataStore {
    users = [];
    profiles = {};
    institutions = [];
    jobs = [];
    applications = [];
    interviews = [];
    auditLogs = auditLogger_1.inMemoryAuditLogs;
    savedJobs = [];
    // Helper getters
    getUserById(id) {
        return this.users.find(u => u.id === id);
    }
    getUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    getProfileByUserId(userId) {
        return this.profiles[userId];
    }
    getInstitutionById(id) {
        return this.institutions.find(i => i.id === id);
    }
    getJobById(id) {
        const job = this.jobs.find(j => j.id === id);
        if (!job)
            return undefined;
        const inst = this.getInstitutionById(job.institutionId);
        return { ...job, institution: inst };
    }
    getApplicationsByJobId(jobId) {
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
    getApplicationsByTeacherId(teacherId) {
        return this.applications
            .filter(a => a.teacherId === teacherId)
            .map(app => {
            const job = this.getJobById(app.jobId);
            return { ...app, job };
        });
    }
}
exports.dbStore = new DataStore();
