"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.optionalJWT = optionalJWT;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("../db/mongodb");
const store_1 = require("../db/store");
const JWT_SECRET = process.env.JWT_SECRET || 'sikchakhub-super-secret-jwt-key-2025';
async function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Verify account active status to prevent revoked/suspended users from unauthorized access
        try {
            const liveUser = await mongodb_1.UserModel.findOne({ id: decoded.id }).select('status').lean();
            if (liveUser && (liveUser.status === 'SUSPENDED' || liveUser.status === 'DEACTIVATED')) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your account is currently ${liveUser.status.toLowerCase()}. Please contact support@sikchakhub.ai.`,
                });
            }
        }
        catch (e) {
            const fallbackUser = store_1.dbStore.getUserById(decoded.id);
            if (fallbackUser && (fallbackUser.status === 'SUSPENDED' || fallbackUser.status === 'DEACTIVATED')) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your account is currently ${fallbackUser.status.toLowerCase()}. Please contact support@sikchakhub.ai.`,
                });
            }
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
}
function optionalJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        catch {
            // Ignored for optional
        }
    }
    next();
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. Role '${req.user.role}' does not have required permissions.`
            });
        }
        next();
    };
}
