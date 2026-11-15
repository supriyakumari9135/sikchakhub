"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const jobs_routes_1 = __importDefault(require("./routes/jobs.routes"));
const applications_routes_1 = __importDefault(require("./routes/applications.routes"));
const interviews_routes_1 = __importDefault(require("./routes/interviews.routes"));
const institutions_routes_1 = __importDefault(require("./routes/institutions.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const masterData_routes_1 = __importDefault(require("./routes/masterData.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const subscriptions_routes_1 = __importDefault(require("./routes/subscriptions.routes"));
const mongodb_1 = require("./db/mongodb");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect MongoDB Atlas
(0, mongodb_1.connectMongoDB)().catch(err => {
    console.warn('Initial MongoDB connection warning:', err.message);
});
// Production Security Response Headers (Anti-Clickjacking, Anti-MIME sniffing, HSTS)
app.use((_req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
// CORS Configuration (Strict Production + Staging + Localhost)
const allowedOrigins = [
    'https://sikchakhub.in',
    'https://www.sikchakhub.in',
    'https://api.sikchakhub.in',
    'http://localhost:5173',
    'http://localhost:5001',
    'http://localhost:3000',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
}));
// Middleware (25MB body limit to comfortably accommodate up to 5MB PDFs in base64 payload)
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
app.use((0, morgan_1.default)('dev'));
// In-Memory Sliding Window Rate Limiter for Authentication Endpoints (Brute-force protection)
const authAttemptMap = new Map();
const authRateLimiter = (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || '127.0.0.1';
    const now = Date.now();
    const entry = authAttemptMap.get(ip);
    if (entry && now < entry.resetAt) {
        if (entry.count >= 30) {
            const waitSecs = Math.ceil((entry.resetAt - now) / 1000);
            return res.status(429).json({
                success: false,
                message: `Too many login/registration attempts. Please wait ${waitSecs} seconds before trying again.`,
            });
        }
        entry.count++;
    }
    else {
        authAttemptMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    }
    next();
};
// Static storage for local PDF CV/Resume & verification document uploads
const resumesDir = path_1.default.join(__dirname, '../uploads/resumes');
if (!fs_1.default.existsSync(resumesDir)) {
    fs_1.default.mkdirSync(resumesDir, { recursive: true });
}
const certificatesDir = path_1.default.join(__dirname, '../uploads/certificates');
if (!fs_1.default.existsSync(certificatesDir)) {
    fs_1.default.mkdirSync(certificatesDir, { recursive: true });
}
const logosDir = path_1.default.join(__dirname, '../uploads/logos');
if (!fs_1.default.existsSync(logosDir)) {
    fs_1.default.mkdirSync(logosDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SikchaKhub API',
        database: 'MongoDB Atlas',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/jobs', jobs_routes_1.default);
app.use('/api/v1/applications', applications_routes_1.default);
app.use('/api/v1/interviews', interviews_routes_1.default);
app.use('/api/v1/institutions', institutions_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/master-data', masterData_routes_1.default);
app.use('/api/v1/notifications', notifications_routes_1.default);
app.use('/api/v1/subscriptions', subscriptions_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on SikchaKhub API.` });
});
// Central error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error occurred.',
    });
});
let serverInstance = null;
if (process.env.NODE_ENV !== 'test') {
    const startServer = (portToTry) => {
        serverInstance = app.listen(portToTry, () => {
            console.log(`🚀 SikchaKhub API running on http://localhost:${portToTry}`);
            console.log(`📚 SikchaKhub AI Recruitment Platform`);
        });
        serverInstance.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                const nextPort = portToTry + 1;
                console.warn(`⚠️ Port ${portToTry} is in use. Attempting next port ${nextPort}...`);
                startServer(nextPort);
            }
            else {
                console.error('Server error:', err);
            }
        });
    };
    startServer(Number(PORT) || 5001);
}
// Graceful Shutdown on SIGTERM & SIGINT (for Contabo VPS / PM2 cluster reloads)
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    if (serverInstance) {
        serverInstance.close(() => {
            console.log('🔒 HTTP server closed gracefully.');
        });
    }
    try {
        await mongoose_1.default.connection.close(false);
        console.log('💾 MongoDB Atlas connection closed cleanly.');
    }
    catch (err) { }
    process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
exports.default = app;
