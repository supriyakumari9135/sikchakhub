import { Request } from 'express';
import { AuditLog } from '@sikchakhub/shared-types';

export const inMemoryAuditLogs: AuditLog[] = [];

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

