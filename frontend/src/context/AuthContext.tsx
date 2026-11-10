import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TeacherProfile, Institution, UserRole } from '@sikchakhub/shared-types';
import { apiUrl } from '../config/api';

export type PortalRole = 'TEACHER' | 'EMPLOYER' | 'ADMIN' | 'HR';

interface AuthContextType {
  user: User | null;
  profile: TeacherProfile | null;
  institution: Institution | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, expectedRole?: PortalRole) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (role: PortalRole, googleData: { email: string; fullName?: string; avatarUrl?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<TeacherProfile>) => Promise<void>;
  updateAccount: (accountData: any) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  uploadResume: (file: File) => Promise<{ success: boolean; message?: string; resumeUrl?: string; resumeFileName?: string }>;
  isAuthModalOpen: boolean;
  authModalTab: 'LOGIN' | 'REGISTER';
  authModalRole: PortalRole;
  openAuthModal: (defaultTab?: 'LOGIN' | 'REGISTER', defaultRole?: PortalRole) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredJson = <T,>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sikchakhub_token') || localStorage.getItem('sikcha_token') || localStorage.getItem('siksha_token'));
  const [user, setUser] = useState<User | null>(() => getStoredJson<User>('sikchakhub_user') || getStoredJson<User>('sikcha_user') || getStoredJson<User>('siksha_user'));
  const [profile, setProfile] = useState<TeacherProfile | null>(() => getStoredJson<TeacherProfile>('sikchakhub_profile') || getStoredJson<TeacherProfile>('sikcha_profile') || getStoredJson<TeacherProfile>('siksha_profile'));
  const [institution, setInstitution] = useState<Institution | null>(() => getStoredJson<Institution>('sikchakhub_institution') || getStoredJson<Institution>('sikcha_institution') || getStoredJson<Institution>('siksha_institution'));
  const [isLoading, setIsLoading] = useState<boolean>(() => !localStorage.getItem('sikchakhub_token') && !localStorage.getItem('sikcha_token') && !localStorage.getItem('siksha_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authModalRole, setAuthModalRole] = useState<PortalRole>('TEACHER');

  const saveSession = (
    newToken: string,
    newUser: User,
    newProfile?: TeacherProfile | null,
    newInstitution?: Institution | null
  ) => {
    try {
      localStorage.setItem('sikchakhub_token', newToken);
      localStorage.setItem('sikchakhub_user', JSON.stringify(newUser));
      localStorage.removeItem('sikcha_token');
      localStorage.removeItem('siksha_token');
      localStorage.removeItem('sikcha_user');
      localStorage.removeItem('siksha_user');
      if (newProfile) {
        localStorage.setItem('sikchakhub_profile', JSON.stringify(newProfile));
        localStorage.removeItem('sikcha_profile');
        localStorage.removeItem('siksha_profile');
      } else {
        localStorage.removeItem('sikchakhub_profile');
        localStorage.removeItem('sikcha_profile');
        localStorage.removeItem('siksha_profile');
      }
      if (newInstitution) {
        localStorage.setItem('sikchakhub_institution', JSON.stringify(newInstitution));
        localStorage.removeItem('sikcha_institution');
        localStorage.removeItem('siksha_institution');
      } else {
        localStorage.removeItem('sikchakhub_institution');
        localStorage.removeItem('sikcha_institution');
        localStorage.removeItem('siksha_institution');
      }
    } catch (e) {
      console.warn('Storage save warning:', e);
    }
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile || null);
    setInstitution(newInstitution || null);
  };

  const clearSession = () => {
    try {
      localStorage.removeItem('sikchakhub_token');
      localStorage.removeItem('sikcha_token');
      localStorage.removeItem('siksha_token');
      localStorage.removeItem('sikchakhub_user');
      localStorage.removeItem('sikcha_user');
      localStorage.removeItem('siksha_user');
      localStorage.removeItem('sikchakhub_profile');
      localStorage.removeItem('sikcha_profile');
      localStorage.removeItem('siksha_profile');
      localStorage.removeItem('sikchakhub_institution');
      localStorage.removeItem('sikcha_institution');
      localStorage.removeItem('siksha_institution');
    } catch (e) {}
    setToken(null);
    setUser(null);
    setProfile(null);
    setInstitution(null);
  };

  const openAuthModal = (defaultTab: 'LOGIN' | 'REGISTER' = 'LOGIN', defaultRole: PortalRole = 'TEACHER') => {
    setAuthModalTab(defaultTab);
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(false);
    navigate(`/${defaultTab === 'REGISTER' ? 'signup' : 'login'}?role=${defaultRole}`);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Restore session
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('sikchakhub_token') || localStorage.getItem('sikcha_token') || localStorage.getItem('siksha_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(apiUrl('/api/v1/auth/me'), {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.status === 401) {
          // Token expired or invalid
          clearSession();
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          saveSession(storedToken, data.user, data.profile, data.institution);
        }
      } catch (err) {
        console.warn('Session verification warning (retaining offline session):', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string, expectedRole?: PortalRole) => {
    try {
      const res = await fetch(apiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password: pass,
          expectedRole 
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { 
          success: false, 
          message: data.message || 'Login failed. Please verify your credentials.',
          userRole: data.userRole
        };
      }

      // Strict role verification: Prevent Job Poster from logging in on Job Seeker/Admin page, etc.
      const isRoleAllowed = !expectedRole || 
        data.user?.role === expectedRole || 
        (expectedRole === 'ADMIN' && data.user?.role === 'HR') || 
        (expectedRole === 'HR' && data.user?.role === 'ADMIN');

      if (!isRoleAllowed && data.user?.role) {
        const portalNames: Record<string, string> = {
          TEACHER: 'Job Seeker (Educator)',
          EMPLOYER: 'Job Poster (School / Coaching Institute)',
          ADMIN: 'Super Admin Governance',
          HR: 'HR Recruiter Governance',
        };
        const actualName = portalNames[data.user.role] || data.user.role;
        const expectedName = portalNames[expectedRole] || expectedRole;
        return {
          success: false,
          message: `Account role mismatch: This account is registered as a ${actualName}. You cannot log in through the ${expectedName} portal. Please use the ${actualName} login page.`,
          userRole: data.user.role,
        };
      }

      if (data.token && data.user) {
        saveSession(data.token, data.user, data.profile, data.institution);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch(apiUrl('/api/v1/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        saveSession(data.token, data.user, data.profile, data.institution || null);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const loginWithGoogle = async (
    role: PortalRole,
    googleData: { email: string; fullName?: string; avatarUrl?: string }
  ) => {
    try {
      if (!googleData?.email) {
        return { success: false, message: 'Google account email is required' };
      }

      const res = await fetch(apiUrl('/api/v1/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleData.email.trim().toLowerCase(),
          fullName: googleData.fullName || googleData.email.split('@')[0],
          avatarUrl: googleData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleData.fullName || googleData.email)}`,
          role,
        }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        saveSession(data.token, data.user, data.profile, data.institution);
        return { success: true };
      }
      return { success: false, message: data.message || 'Google sign-in failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network connection error' };
    }
  };

  const logout = () => {
    clearSession();
    navigate('/');
  };

  const updateProfile = async (profileData: Partial<TeacherProfile>) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/v1/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        try {
          localStorage.setItem('sikchakhub_profile', JSON.stringify(data.profile));
          localStorage.removeItem('sikcha_profile');
          localStorage.removeItem('siksha_profile');
        } catch (e) {}
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const updateAccount = async (accountData: any) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(apiUrl('/api/v1/auth/account'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('sikchakhub_user', JSON.stringify(data.user));
            localStorage.removeItem('sikcha_user');
            localStorage.removeItem('siksha_user');
          } catch (e) {}
        }
        if (data.institution) {
          setInstitution(data.institution);
          try {
            localStorage.setItem('sikchakhub_institution', JSON.stringify(data.institution));
            localStorage.removeItem('sikcha_institution');
            localStorage.removeItem('siksha_institution');
          } catch (e) {}
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to update account' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch(apiUrl('/api/v1/auth/password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const uploadResume = async (file: File) => {
    if (!token) return { success: false, message: 'Please log in to upload your CV.' };

    // Strict PDF check
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { success: false, message: 'Only PDF format resumes are accepted (.pdf).' };
    }

    // 1MB strict size limit (1,048,576 bytes)
    const MAX_SIZE = 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { 
        success: false, 
        message: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 1MB limit. Please upload a PDF under 1MB.` 
      };
    }

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(apiUrl('/api/v1/auth/upload-resume'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          base64Data,
          fileName: file.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (profile) {
          setProfile({
            ...profile,
            resumeUrl: data.resumeUrl,
            resumeFileName: data.resumeFileName,
            profileCompletionScore: Math.min(100, (profile.profileCompletionScore || 75) + 20),
          });
        }
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during CV upload.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        institution,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        updateAccount,
        changePassword,
        uploadResume,
        isAuthModalOpen,
        authModalTab,
        authModalRole,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
