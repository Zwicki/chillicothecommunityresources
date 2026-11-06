import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock, LogIn, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import {
  AuthUser,
  isSuperUserEmail,
  verifySuperUserPassword,
  createAuthUser,
} from '../types/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();
  const isSuperUser = isSuperUserEmail(cleanEmail);

  // Initialize official Google Identity Services button if script & client ID are available
  useEffect(() => {
    if (!isOpen) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              try {
                // Decode JWT payload (standard unencrypted client-side read)
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                const gEmail = (payload.email || '').trim().toLowerCase();
                const gName = payload.name || payload.given_name || '';

                if (isSuperUserEmail(gEmail)) {
                  // Admin email detected: populate fields and require password verification
                  setEmail(gEmail);
                  setName(gName);
                  setError('Google account verified. Please enter your administrator password to unlock Super User rights.');
                  return;
                }

                // Regular community user
                const user = createAuthUser(gEmail, gName, payload.picture || '', false);
                onLoginSuccess(user);
                onClose();
              } catch (err) {
                console.error('Failed to parse Google JWT credential', err);
                setError('Could not parse Google credential. Please try again.');
              }
            }
          },
        });

        const btnContainer = document.getElementById('gsi-button-container');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'pill',
          });
        }
      } catch (e) {
        console.warn('Google Identity Services init notice', e);
      }
    }
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  // Handle Sign In submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // If logging in with a Super User email, verify password
    if (isSuperUser) {
      if (!password.trim()) {
        setError('Super User administrator account requires a password.');
        return;
      }

      if (!verifySuperUserPassword(password)) {
        setError('Incorrect password for Super User administration. Access denied.');
        return;
      }

      // Validated successfully as Super User
      const user = createAuthUser(cleanEmail, name.trim(), undefined, true);
      onLoginSuccess(user);
      onClose();
      return;
    }

    // Community user (non-super user)
    const user = createAuthUser(cleanEmail, name.trim(), undefined, false);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg mb-3">
            {/* Google Colorful G SVG */}
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">Account Sign In</h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in to post community events, manage announcements, or administer the directory.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {/* Public Notice Banner */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Public Access is 100% Free &amp; Open</strong>
              Browsing, searching, and printing community resources never require an account.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Official Google Identity Button (renders if GIS script and Client ID are active) */}
          <div id="gsi-button-container" className="flex justify-center" />

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password {isSuperUser ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(Admin only)</span>}
                </label>
                {isSuperUser && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <KeyRound className="w-2.5 h-2.5" />
                    Super User Password Required
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={isSuperUser ? 'Enter administrator password' : 'Required only for Super User administration'}
                  className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl outline-none transition-all font-medium ${
                    isSuperUser
                      ? 'bg-amber-50/50 border-2 border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500'
                      : 'bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {isSuperUser ? (
                <p className="text-[11px] text-amber-800 mt-1 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                  Administrator account detected. Password verification is required to access full Super User privileges.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Community event organizers can sign in without a password.
                </p>
              )}
            </div>

            {/* Display Name / Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name / Organization <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Jane Smith (Paper City Mentoring)"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isSuperUser
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isSuperUser ? 'Sign In as Super User Administrator' : 'Sign In to Portal'}</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Chillicothe &amp; Ross County Community Directory &bull; Secure Authentication
          </p>
        </div>

      </div>
    </div>
  );
};
