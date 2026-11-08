"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryAuditLogs = void 0;
exports.logAuditEvent = logAuditEvent;
exports.inMemoryAuditLogs = [];
function logAuditEvent(req, action, resourceType, resourceId, details) {
    const log = {
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
    exports.inMemoryAuditLogs.unshift(log);
    if (exports.inMemoryAuditLogs.length > 500) {
        exports.inMemoryAuditLogs.pop();
    }
}
