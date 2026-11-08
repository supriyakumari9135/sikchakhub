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
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const jobs_routes_1 = __importDefault(require("./routes/jobs.routes"));
const applications_routes_1 = __importDefault(require("./routes/applications.routes"));
const interviews_routes_1 = __importDefault(require("./routes/interviews.routes"));
const institutions_routes_1 = __importDefault(require("./routes/institutions.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const masterData_routes_1 = __importDefault(require("./routes/masterData.routes"));
const mongodb_1 = require("./db/mongodb");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect MongoDB Atlas
(0, mongodb_1.connectMongoDB)().catch(err => {
    console.warn('Initial MongoDB connection warning:', err.message);
});
// Middleware (25MB body limit to comfortably accommodate up to 5MB PDFs in base64 payload)
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '25mb' }));
app.use((0, morgan_1.default)('dev'));
// Static storage for free local PDF CV/Resume uploads
const uploadsDir = path_1.default.join(__dirname, '../uploads/resumes');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'SikshaHub API',
        database: 'MongoDB Atlas',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/jobs', jobs_routes_1.default);
app.use('/api/v1/applications', applications_routes_1.default);
app.use('/api/v1/interviews', interviews_routes_1.default);
app.use('/api/v1/institutions', institutions_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/master-data', masterData_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on SikshaHub API.` });
});
// Central error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error occurred.',
    });
});
if (process.env.NODE_ENV !== 'test') {
    const startServer = (portToTry) => {
        const server = app.listen(portToTry, () => {
            console.log(`🚀 SikshaHub API running on http://localhost:${portToTry}`);
            console.log(`📚 SikshaHub AI Recruitment Platform`);
        });
        server.on('error', (err) => {
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
exports.default = app;
