/**
 * Common Backend API Configuration
 * Reads the backend URL from the environment variable (VITE_API_BASE_URL).
 * Automatically defaults to https://api.sikchakhub.in in production environments.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
   window.location.hostname !== 'localhost' &&
   window.location.hostname !== '127.0.0.1'
    ? 'https://api.sikchakhub.in'
    : 'http://localhost:5001');

/**
 * Builds a full API endpoint URL using the common backend base URL.
 *
 * Handles leading/trailing slashes and prevents duplicate /api or /api/v1 prefixes.
 *
 * Example:
 *   apiUrl('/api/v1/jobs') -> 'https://api.sikchakhub.in/api/v1/jobs'
 */
export const apiUrl = (endpoint: string): string => {
  if (!endpoint) return '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://') || endpoint.startsWith('data:')) {
    return endpoint;
  }

  const base = API_BASE_URL.replace(/\/+$/, '');
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Handle static uploads specifically: strip trailing /api or /api/v1 from origin base
  if (path.startsWith('/uploads/') || path.startsWith('/api/uploads/') || path.startsWith('/api/v1/uploads/')) {
    const cleanUploadPath = path.replace(/^\/api(\/v1)?/, '');
    const origin = base.replace(/\/api(\/v1)?$/, '');
    return `${origin}${cleanUploadPath}`;
  }

  // If base URL already includes /api/v1 and endpoint starts with /api/v1, prevent duplication
  if (base.endsWith('/api/v1') && path.startsWith('/api/v1')) {
    return `${base}${path.slice('/api/v1'.length)}`;
  }

  // If base URL already includes /api and endpoint starts with /api, prevent duplication
  if (base.endsWith('/api') && path.startsWith('/api')) {
    return `${base}${path.slice('/api'.length)}`;
  }

  return `${base}${path}`;
};
