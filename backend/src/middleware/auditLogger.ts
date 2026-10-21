import { Request } from 'express';
import { AuditLog } from '@sikchakhub/shared-types';

export const inMemoryAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-admin-1',
    userEmail: 'admin@sikchakhub.com',
    action: 'INSTITUTION_VERIFIED',
    resourceType: 'Institution',
    resourceId: 'inst-1',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { institutionName: 'Delhi Heritage International School', status: 'VERIFIED' },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'log-2',
    userId: 'user-admin-1',
    userEmail: 'admin@sikchakhub.com',
    action: 'JOB_MODERATION_APPROVED',
    resourceType: 'JobVacancy',
    resourceId: 'job-1',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { jobTitle: 'Senior Physics Faculty (IIT-JEE / NEET)', status: 'ACTIVE' },
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'log-3',
    userId: 'user-employer-1',
    userEmail: 'recruiter@apexjee.com',
    action: 'INTERVIEW_SCHEDULED',
    resourceType: 'Interview',
    resourceId: 'interview-1',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { candidate: 'Dr. Rajesh Sharma', type: 'DEMO_CLASS' },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  }
];

export function logAuditEvent(
  req: Request, 
  action: string, 
  resourceType: string, 
  resourceId: string, 
  details?: Record<string, any>
) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: req.user?.id || 'system',
    userEmail: req.user?.email || 'anonymous',
    action,
    resourceType,
    resourceId,
    ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'unknown',
    details,
    createdAt: new Date().toISOString(),
  };

  inMemoryAuditLogs.unshift(log);
  if (inMemoryAuditLogs.length > 500) {
    inMemoryAuditLogs.pop();
  }
}
