import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/jobs.routes';
import applicationRoutes from './routes/applications.routes';
import interviewRoutes from './routes/interviews.routes';
import institutionRoutes from './routes/institutions.routes';
import atsRoutes from './routes/ats.routes';
import adminRoutes from './routes/admin.routes';
import masterDataRoutes from './routes/masterData.routes';
import { connectMongoDB } from './db/mongodb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB Atlas
connectMongoDB().catch(err => {
  console.warn('Initial MongoDB connection warning:', err.message);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/ats', atsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/master-data', masterDataRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on SikshaHub API.` });
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
  const server = app.listen(PORT, () => {
    console.log(`🚀 SikshaHub API running on http://localhost:${PORT}`);
    console.log(`📚 Reference inspired by Tallento.ai with original branding and architecture`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ Port ${PORT} is currently in use. Please terminate existing process on port ${PORT} or configure PORT in .env`);
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;
