import path from 'path';
import fs from 'fs';

/**
 * Robust upload directory resolution that handles:
 * - Running in ts-node/tsx (from src/)
 * - Running in production compiled (from dist/)
 * - Running from root project folder
 * - Running from backend/ folder
 */
export function getUploadsDir(): string {
  const candidates = [
    path.resolve(__dirname, '../../uploads'),
    path.resolve(__dirname, '../uploads'),
    path.resolve(process.cwd(), 'backend/uploads'),
    path.resolve(process.cwd(), 'uploads'),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  // Create primary fallback
  const defaultDir = fs.existsSync(path.resolve(process.cwd(), 'backend'))
    ? path.resolve(process.cwd(), 'backend/uploads')
    : path.resolve(process.cwd(), 'uploads');

  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch (_) {}
  }

  return defaultDir;
}

export function getResumesDir(): string {
  const dir = path.join(getUploadsDir(), 'resumes');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {}
  }
  return dir;
}

export function getCertificatesDir(): string {
  const dir = path.join(getUploadsDir(), 'certificates');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {}
  }
  return dir;
}

export function getLogosDir(): string {
  const dir = path.join(getUploadsDir(), 'logos');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (_) {}
  }
  return dir;
}
