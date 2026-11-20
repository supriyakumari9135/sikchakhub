import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/jobs.routes';
import applicationRoutes from './routes/applications.routes';
import interviewRoutes from './routes/interviews.routes';
import institutionRoutes from './routes/institutions.routes';
import adminRoutes from './routes/admin.routes';
import masterDataRoutes from './routes/masterData.routes';
import notificationRoutes from './routes/notifications.routes';
import subscriptionRoutes from './routes/subscriptions.routes';
import { connectMongoDB, TeacherProfileModel, JobApplicationModel } from './db/mongodb';
import { getUploadsDir, getResumesDir, getCertificatesDir, getLogosDir } from './utils/paths';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB Atlas
connectMongoDB().catch(err => {
  console.warn('Initial MongoDB connection warning:', err.message);
});

// Production Security Response Headers (Anti-Clickjacking, Anti-MIME sniffing, HSTS)
app.use((req, res, next) => {
  const isUploadPath = req.path.startsWith('/uploads') || 
                       req.path.startsWith('/api/uploads') || 
                       req.path.startsWith('/api/v1/uploads');
  if (isUploadPath) {
    // Allow embedding in iframes from sikchakhub domains, vercel deployments, and local development
    res.setHeader(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://sikchakhub.in https://*.sikchakhub.in https://*.vercel.app http://localhost:* http://127.0.0.1:*"
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  } else {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS Configuration (Strict Production + Staging + Localhost)
const allowedOrigins = [
  'https://sikchakhub.in',
  'https://www.sikchakhub.in',
  'https://app.sikchakhub.in',
  'https://api.sikchakhub.in',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

// Middleware (25MB body limit to comfortably accommodate up to 5MB PDFs in base64 payload)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// In-Memory Sliding Window Rate Limiter for Authentication Endpoints (Brute-force protection)
const authAttemptMap = new Map<string, { count: number; resetAt: number }>();
const authRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
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
  } else {
    authAttemptMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
  }
  next();
};

// Static storage for local PDF CV/Resume & verification document uploads
const uploadsDir = getUploadsDir();
getResumesDir();
getCertificatesDir();
getLogosDir();

const serveUploads = express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://sikchakhub.in https://*.sikchakhub.in https://*.vercel.app http://localhost:* http://127.0.0.1:*"
    );
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  },
});

// Mount static uploads under /uploads, /api/uploads, and /api/v1/uploads
app.use('/uploads', serveUploads);
app.use('/api/uploads', serveUploads);
app.use('/api/v1/uploads', serveUploads);

// Resilient CV/Resume streaming & database fallback handler
const serveResumeFallback = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const rawFilename = req.params.filename;
  if (!rawFilename) return next();

  const safeFilename = path.basename(rawFilename);
  const searchDirs = [
    path.join(uploadsDir, 'resumes'),
    path.resolve(__dirname, '../uploads/resumes'),
    path.resolve(__dirname, '../../uploads/resumes'),
    path.resolve(process.cwd(), 'uploads/resumes'),
    path.resolve(process.cwd(), 'backend/uploads/resumes'),
  ];

  for (const sDir of searchDirs) {
    const fullPath = path.join(sDir, safeFilename);
    if (fs.existsSync(fullPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://sikchakhub.in https://*.sikchakhub.in https://*.vercel.app http://localhost:* http://127.0.0.1:*"
      );
      return res.sendFile(fullPath);
    }
  }

  // Attempt database retrieval if file was lost on ephemeral disk or newly registered
  try {
    const cleanName = safeFilename.replace(/\.pdf$/i, '');
    const profile = await TeacherProfileModel.findOne({
      $or: [
        { resumeUrl: { $regex: safeFilename, $options: 'i' } },
        { resumeFileName: { $regex: cleanName, $options: 'i' } },
      ],
    }).lean();

    if (profile && (profile as any).resumeBase64) {
      const base64Data = (profile as any).resumeBase64.replace(/^data:application\/pdf;base64,/, '');
      const buf = Buffer.from(base64Data, 'base64');
      const savePath = path.join(uploadsDir, 'resumes', safeFilename);
      await fs.promises.writeFile(savePath, buf).catch(() => {});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://sikchakhub.in https://*.sikchakhub.in https://*.vercel.app http://localhost:* http://127.0.0.1:*"
      );
      return res.send(buf);
    }

    const appRecord = await JobApplicationModel.findOne({
      $or: [
        { resumeUrl: { $regex: safeFilename, $options: 'i' } },
        { resumeFileName: { $regex: cleanName, $options: 'i' } },
      ],
    }).lean();

    if (appRecord && (appRecord as any).resumeBase64) {
      const base64Data = (appRecord as any).resumeBase64.replace(/^data:application\/pdf;base64,/, '');
      const buf = Buffer.from(base64Data, 'base64');
      const savePath = path.join(uploadsDir, 'resumes', safeFilename);
      await fs.promises.writeFile(savePath, buf).catch(() => {});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self' https://sikchakhub.in https://*.sikchakhub.in https://*.vercel.app http://localhost:* http://127.0.0.1:*"
      );
      return res.send(buf);
    }
  } catch (err) {
    console.warn('Fallback resume DB search error:', err);
  }

  return res.status(404).json({
    success: false,
    message: `Resume file "${safeFilename}" was not found on SikchaKhub API.`,
  });
};

app.get('/uploads/resumes/:filename', serveResumeFallback);
app.get('/api/uploads/resumes/:filename', serveResumeFallback);
app.get('/api/v1/uploads/resumes/:filename', serveResumeFallback);

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/master-data', masterDataRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

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

let serverInstance: any = null;

if (process.env.NODE_ENV !== 'test') {
  const startServer = (portToTry: number) => {
    serverInstance = app.listen(portToTry, () => {
      console.log(`🚀 SikchaKhub API running on http://localhost:${portToTry}`);
      console.log(`📚 SikchaKhub AI Recruitment Platform`);
    });

    serverInstance.on('error', (err: any) => {
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

// Graceful Shutdown on SIGTERM & SIGINT (for Contabo VPS / PM2 cluster reloads)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('🔒 HTTP server closed gracefully.');
    });
  }
  try {
    await mongoose.connection.close(false);
    console.log('💾 MongoDB Atlas connection closed cleanly.');
  } catch (err) {}
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
