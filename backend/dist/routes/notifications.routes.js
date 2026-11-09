"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const mongodb_1 = require("../db/mongodb");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/notifications/fcm-token
 * Register or refresh a client device FCM token
 */
router.post('/fcm-token', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { token, platform = 'WEB', userAgent = '' } = req.body;
    if (!token || typeof token !== 'string') {
        return res.status(400).json({ success: false, message: 'Valid FCM device token is required.' });
    }
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        // Upsert token to maintain fresh active state
        const doc = await mongodb_1.DeviceTokenModel.findOneAndUpdate({ token }, {
            $set: {
                id: `fcm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                userId,
                userRole,
                platform: ['WEB', 'ANDROID', 'IOS'].includes(platform) ? platform : 'WEB',
                userAgent: userAgent || req.headers['user-agent'] || '',
                isActive: true,
                lastSeenAt: new Date(),
                updatedAt: new Date(),
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        return res.json({
            success: true,
            message: 'FCM device token registered successfully for smart push notifications.',
            tokenId: doc.id,
        });
    }
    catch (err) {
        console.error('FCM token registration error:', err);
        return res.status(500).json({ success: false, message: 'Failed to register device token.' });
    }
});
/**
 * DELETE /api/v1/notifications/fcm-token
 * Deactivate token on logout
 */
router.delete('/fcm-token', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required.' });
    }
    try {
        await mongodb_1.DeviceTokenModel.updateOne({ token, userId: req.user.id }, { $set: { isActive: false, updatedAt: new Date() } });
        return res.json({ success: true, message: 'FCM device token deactivated.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to deactivate token.' });
    }
});
/**
 * GET /api/v1/notifications/inbox
 * Retrieve in-app notifications for the authenticated Job Seeker / Educator
 */
router.get('/inbox', authMiddleware_1.authenticateJWT, async (req, res) => {
    try {
        const notifications = await mongodb_1.UserInboxNotificationModel.find({
            userId: req.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        const unreadCount = await mongodb_1.UserInboxNotificationModel.countDocuments({
            userId: req.user.id,
            isRead: false,
        });
        return res.json({
            success: true,
            unreadCount,
            notifications,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
    }
});
/**
 * PATCH /api/v1/notifications/inbox/:id/read
 * Mark notification as read
 */
router.patch('/inbox/:id/read', authMiddleware_1.authenticateJWT, async (req, res) => {
    try {
        const updated = await mongodb_1.UserInboxNotificationModel.findOneAndUpdate({ id: req.params.id, userId: req.user.id }, { $set: { isRead: true, readAt: new Date() } }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }
        return res.json({ success: true, notification: updated });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to mark as read.' });
    }
});
/**
 * PATCH /api/v1/notifications/inbox/read-all
 * Mark all user notifications as read
 */
router.patch('/inbox/read-all', authMiddleware_1.authenticateJWT, async (req, res) => {
    try {
        await mongodb_1.UserInboxNotificationModel.updateMany({ userId: req.user.id, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
        return res.json({ success: true, message: 'All notifications marked as read.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
    }
});
exports.default = router;
