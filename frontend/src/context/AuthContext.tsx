import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TeacherProfile, Institution, UserRole } from '@sikchakhub/shared-types';

interface AuthContextType {
  user: User | null;
  profile: TeacherProfile | null;
  institution: Institution | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<TeacherProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('siksha_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('siksha_token');
      if (!storedToken) {
        // Automatically default to Teacher demo login on first visit for frictionless exploration
        await quickDemoLogin('TEACHER');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setProfile(data.profile || null);
          setInstitution(data.institution || null);
          setToken(storedToken);
        } else {
          localStorage.removeItem('siksha_token');
          await quickDemoLogin('TEACHER');
        }
      } catch (err) {
        console.error('Session load failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('siksha_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile || null);
        setInstitution(data.institution || null);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('siksha_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile || null);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    try {
      const res = await fetch('/api/v1/auth/quick-demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('siksha_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile || null);
        setInstitution(data.institution || null);
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('siksha_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setInstitution(null);
  };

  const updateProfile = async (profileData: Partial<TeacherProfile>) => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Profile update failed:', err);
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
        quickDemoLogin,
        logout,
        updateProfile,
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
