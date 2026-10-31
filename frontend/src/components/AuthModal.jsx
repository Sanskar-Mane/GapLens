import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, backendHealth }) {
  const { login, signup, loginAsDemo, isLoading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setShowDemoPrompt(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAuthError = (err) => {
    const status = err.status || err.response?.status;
    const rawMsg = (
      err.response?.data?.msg ||
      err.response?.data?.message ||
      err.message ||
      ''
    ).toLowerCase();

    setShowDemoPrompt(true);

    if (status === 401 || status === 400) {
      if (rawMsg.includes('invalid login credentials') || rawMsg.includes('invalid credentials')) {
        setError("Invalid credentials or account not found. Try switching to 'Create Account'.");
        return;
      }
      if (rawMsg.includes('email not confirmed') || rawMsg.includes('unconfirmed')) {
        setError("Email not confirmed. Please check your inbox or disable email confirmation in Supabase.");
        return;
      }
      if (
        rawMsg.includes('unconfigured') ||
        rawMsg.includes('api key') ||
        rawMsg.includes('placeholder') ||
        rawMsg.includes('missing url')
      ) {
        setError("Supabase credentials unconfigured in .env.");
        return;
      }
    }

    if (rawMsg.includes('user already registered') || rawMsg.includes('already exists')) {
      setError("An account with this email already exists. Try switching to 'Sign In'.");
      return;
    }

    if (
      rawMsg.includes('network') ||
      rawMsg.includes('failed to fetch') ||
      rawMsg.includes('timeout') ||
      rawMsg.includes('econnrefused')
    ) {
      setError("Network timeout connecting to authentication server. You can continue in local demo mode.");
      return;
    }

    if (status === 401) {
      setError("Invalid credentials or account not found. Try switching to 'Create Account'.");
      return;
    }

    const defaultMsg =
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.message ||
      "Authentication failed. Please verify your credentials or continue as Demo User.";
    setError(defaultMsg);
  };

  const handleSignIn = async (trimmedEmail, pwd) => {
    try {
      await login(trimmedEmail, pwd);
      setSuccessMsg('Welcome back! Successfully signed in.');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleSignUp = async (trimmedEmail, pwd) => {
    try {
      await signup(trimmedEmail, pwd);
      setSuccessMsg('Account created successfully! Session connected.');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleContinueAsDemo = () => {
    setError(null);
    const demoEmail = email.trim() || 'demo@gaplens.local';
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: demoEmail,
      role: 'authenticated',
      isLocalDemo: true,
      created_at: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('gaplens_auth_user', JSON.stringify(demoUser));
      localStorage.setItem('gaplens_user', JSON.stringify(demoUser));
      localStorage.setItem('gaplens_auth_token', 'mock-jwt-token');
    }
    loginAsDemo(demoEmail);
    setSuccessMsg(`Signed in as demo user (${demoUser.email})!`);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setShowDemoPrompt(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      await handleSignUp(trimmedEmail, password);
    } else {
      await handleSignIn(trimmedEmail, password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 z-10 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <UserCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {mode === 'login' ? 'Sign In to GapLens' : 'Create GapLens Account'}
                </h3>
                {backendHealth?.data?.supabaseConnected === false && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    Local Fallback
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                {mode === 'login'
                  ? 'Access your saved cross-source audits and history'
                  : 'Register with email to synchronize research sessions'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Close authentication modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setShowDemoPrompt(false);
            }}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setShowDemoPrompt(false);
            }}
            className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert Feedback Messages */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in duration-150 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="leading-snug">{error}</span>
            </div>
            {showDemoPrompt && (
              <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
                <span className="text-[11px] text-rose-600 dark:text-rose-400">Want to test without credentials?</span>
                <button
                  type="button"
                  onClick={handleContinueAsDemo}
                  className="font-semibold text-zinc-900 underline dark:text-white hover:text-rose-700 text-[11px] cursor-pointer"
                >
                  Continue as Demo User &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in duration-150">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50 py-2.5 pl-9 pr-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-100 dark:focus:border-zinc-100"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Password
              </label>
              <span className="text-[10px] text-zinc-400">Minimum 6 characters</span>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50 py-2.5 pl-9 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-100 dark:focus:border-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
            )}
          </button>
        </form>

        {/* Demo User Fallback Section */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="shrink-0 px-2 text-[10px] font-medium uppercase text-zinc-400">or</span>
          <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        <button
          type="button"
          onClick={handleContinueAsDemo}
          className="w-full inline-flex items-center justify-center space-x-2 rounded-xl border border-zinc-200/80 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 dark:hover:text-white transition-all shadow-soft cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Continue as Demo User</span>
          <span className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-[9px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            Hackathon / Evaluation
          </span>
        </button>

        {/* Footer info note */}
        <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Backed by Supabase Authentication with seamless local demo persistence.
          </p>
        </div>

      </div>
    </div>
  );
}
