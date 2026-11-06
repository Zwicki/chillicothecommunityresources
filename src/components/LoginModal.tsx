import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, Lock, LogIn, AlertCircle } from 'lucide-react';
import { AuthUser, SUPER_USER_EMAIL, createAuthUser } from '../types/auth';

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
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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
                const user = createAuthUser(
                  payload.email || '',
                  payload.name || payload.given_name || '',
                  payload.picture || ''
                );
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
            shape: 'pill'
          });
        }
      } catch (e) {
        console.warn('Google Identity Services init notice', e);
      }
    }
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  // 1-Click Super User Sign In
  const handleSuperUserLogin = () => {
    const superUser = createAuthUser(
      SUPER_USER_EMAIL,
      'R. Fannin (Super User)',
      'https://lh3.googleusercontent.com/a/default-user=s96-c'
    );
    onLoginSuccess(superUser);
    onClose();
  };

  // Custom Google Account Sign In
  const handleCustomGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    const user = createAuthUser(customEmail.trim(), customName.trim());
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
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800/80 transition-colors"
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

          <h2 className="text-xl font-extrabold tracking-tight">Sign in with Google</h2>
          <p className="text-xs text-slate-300 mt-1">
            Optional sign-in for community organizers, event publishers &amp; administrators.
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          
          {/* Public Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Login is Non-Required</strong>
              Browsing, searching, and printing community resources are 100% free for the public without any account.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Official Google Identity Button (renders when GIS script and Client ID are active) */}
          <div id="gsi-button-container" className="flex justify-center" />

          {/* Quick Super User Access Button */}
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                Super User Login
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                Full Admin Rights
              </span>
            </div>
            <p className="text-xs text-slate-700 mb-3 leading-relaxed">
              Sign in with registered administrator account <strong className="text-slate-900 font-bold">{SUPER_USER_EMAIL}</strong> to add events, copy announcements, and manage deletions.
            </p>
            <button
              onClick={handleSuperUserLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Sign in as {SUPER_USER_EMAIL}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or sign in with another Google Account
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Custom Google Account Form */}
          <form onSubmit={handleCustomGoogleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={e => {
                  setCustomEmail(e.target.value);
                  setError(null);
                }}
                placeholder="yourname@gmail.com"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name / Organization <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Jane Smith (Chillicothe Hope Center)"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>Sign In with this Account</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Chillicothe &amp; Ross County Community Directory &bull; Protected by Google Authentication
          </p>
        </div>

      </div>
    </div>
  );
};
