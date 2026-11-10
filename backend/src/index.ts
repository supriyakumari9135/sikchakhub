import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/jobs.routes';
import applicationRoutes from './routes/applications.routes';
import interviewRoutes from './routes/interviews.routes';
import institutionRoutes from './routes/institutions.routes';
import adminRoutes from './routes/admin.routes';
import masterDataRoutes from './routes/masterData.routes';
import notificationRoutes from './routes/notifications.routes';
import { connectMongoDB } from './db/mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB Atlas
connectMongoDB().catch(err => {
  console.warn('Initial MongoDB connection warning:', err.message);
});

// Middleware (25MB body limit to comfortably accommodate up to 5MB PDFs in base64 payload)
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// Static storage for free local PDF CV/Resume & verification document uploads
const resumesDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
const certificatesDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}
const logosDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/master-data', masterDataRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on SikchaKhub API.` });
});

// Central error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

if (process.env.NODE_ENV !== 'test') {
  const startServer = (portToTry: number) => {
    const server = app.listen(portToTry, () => {
      console.log(`🚀 SikchaKhub API running on http://localhost:${portToTry}`);
      console.log(`📚 SikchaKhub AI Recruitment Platform`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = portToTry + 1;
        console.warn(`⚠️ Port ${portToTry} is in use. Attempting next port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(Number(PORT) || 5001);
}

export default app;
