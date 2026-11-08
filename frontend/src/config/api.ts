/**
 * Common Backend API Configuration
 * Reads the backend URL from the environment variable (VITE_API_BASE_URL).
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5001';

/**
 * Builds a full API endpoint URL using the common backend base URL.
 *
 * Handles leading/trailing slashes and prevents duplicate /api or /api/v1 prefixes.
 *
 * Example:
 *   apiUrl('/api/v1/jobs') -> 'http://localhost:5000/api/v1/jobs'
 *   apiUrl('/api/v1/jobs?city=Patna') -> 'http://localhost:5000/api/v1/jobs?city=Patna'
 */
export const apiUrl = (endpoint: string): string => {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

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

