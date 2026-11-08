import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  ShieldCheck,
  Building2,
  GraduationCap
} from 'lucide-react';

export const AdminAuthCard: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, 'ADMIN');
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Authentication verified. Loading Super Admin Governance Console...');
    } else {
      setError(res.message || 'Invalid administrator credentials. Access restricted.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Optional admin security passcode verification
    if (adminPasscode !== 'SIKSHA-ADMIN-2025' && adminPasscode !== 'Admin@1234' && adminPasscode !== '') {
      setError('Invalid Administrator Authorization Passcode. Contact platform owner.');
      return;
    }

    setLoading(true);
    const res = await register({
      fullName,
      email: email.trim().toLowerCase(),
      phone,
      password,
      role: 'ADMIN',
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Administrator account provisioned! Loading Super Admin Console...');
    } else {
      setError(res.message || 'Registration failed. Please verify admin details.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 py-8 sm:py-14 px-3 sm:px-6 lg:px-8 text-white flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Super Admin Governance Access</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
            {mode === 'LOGIN' ? 'Super Admin Secure Login' : 'Register Administrator Account'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Restricted compliance console. Only authorized administrators with Super Admin credentials can sign in.
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 space-y-5">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'LOGIN'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Administrator Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                mode === 'REGISTER'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New Admin
            </button>
          </div>

          {/* Error Alert with Smart Role Redirection */}
          {error && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold leading-relaxed">{error}</p>
                
                {(error.includes('Job Poster') || error.includes('Employer')) && (
                  <button
                    type="button"
                    onClick={() => navigate('/employer-dashboard')}
                    className="font-bold underline text-sky-300 hover:text-sky-200 flex items-center gap-1 text-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Go to Job Poster (Employer) Portal →</span>
                  </button>
                )}

                {(error.includes('Job Seeker') || error.includes('Educator')) && (
                  <button
                    type="button"
                    onClick={() => navigate('/teacher-dashboard')}
                    className="font-bold underline text-emerald-300 hover:text-emerald-200 flex items-center gap-1 text-xs"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Go to Job Seeker (Educator) Portal →</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sikshahub@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Quick default credential helper box */}
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 space-y-1">
                <span className="font-bold flex items-center gap-1 text-purple-300">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Default Super Admin Credentials:</span>
                </span>
                <p>Email: <code className="font-mono bg-purple-900/50 px-1.5 py-0.5 rounded text-white">sikshahub@gmail.com</code> | Pass: <code className="font-mono bg-purple-900/50 px-1.5 py-0.5 rounded text-white">admin@12345</code></p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('sikshahub@gmail.com');
                    setPassword('admin@12345');
                  }}
                  className="text-[10px] font-bold text-purple-300 underline hover:text-white pt-0.5 block"
                >
                  Click to auto-fill admin credentials (sikshahub@gmail.com)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Admin...' : 'Sign In as Super Admin'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Administrator Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Chief Governance Officer"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Mobile Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9783143866"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Create Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] disabled:opacity-50"
              >
                <span>{loading ? 'Registering Admin...' : 'Register Super Admin'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick links to Job Seeker & Job Poster login portals */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/teacher-dashboard')}
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Job Seeker Portal</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employer-dashboard')}
              className="hover:text-sky-400 transition flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Job Poster Portal</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

