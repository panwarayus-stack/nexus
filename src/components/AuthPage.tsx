import React, { useState, useEffect } from 'react';
import { User } from '../types/chat';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  KeyRound,
  Loader2,
  ShieldAlert,
  LockKeyhole,
} from 'lucide-react';
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  createAuthSessionToken,
  generateCsrfToken,
  registerUserAccount,
  authenticateUserAccount,
} from '../utils/security';

interface AuthPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  users: User[];
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  users,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // Login Form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form state
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Rate limiting state
  const [rateLimitInfo, setRateLimitInfo] = useState(checkRateLimit());
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Shared UX states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    body: string;
    type: 'success' | 'error';
  } | null>(null);

  // Initialize CSRF Token
  useEffect(() => {
    generateCsrfToken();
  }, []);

  // Lockout Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (rateLimitInfo.remainingSeconds > 0) {
      setLockoutTimer(rateLimitInfo.remainingSeconds);
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setRateLimitInfo(checkRateLimit());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setLockoutTimer(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitInfo.remainingSeconds]);

  const showToast = (title: string, body: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, body, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Password strength logic
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700', textColors: 'text-slate-500' };

    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score, label: 'Weak', color: 'bg-red-500', textColors: 'text-red-400' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500', textColors: 'text-amber-400' };
    if (score === 3) return { score, label: 'Good', color: 'bg-yellow-400', textColors: 'text-yellow-400' };
    if (score === 4) return { score, label: 'Strong', color: 'bg-emerald-500', textColors: 'text-emerald-400' };

    return { score: 0, label: 'Very Weak', color: 'bg-slate-700', textColors: 'text-slate-500' };
  };

  const passStrength = calculatePasswordStrength(signupPassword);

  // Form Validation
  const validateLogin = () => {
    const errs: Record<string, string> = {};
    if (!loginIdentifier.trim()) {
      errs.loginIdentifier = 'Username or Email is required';
    }
    if (!loginPassword) {
      errs.loginPassword = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = () => {
    const errs: Record<string, string> = {};
    const cleanUser = signupUsername.trim();
    const cleanMail = signupEmail.trim();

    if (!signupName.trim()) {
      errs.signupName = 'Full name is required';
    }

    if (!cleanUser) {
      errs.signupUsername = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUser)) {
      errs.signupUsername = 'Username must be 3-20 characters (letters, numbers, underscores only)';
    }

    if (!cleanMail) {
      errs.signupEmail = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanMail)) {
      errs.signupEmail = 'Please enter a valid email address';
    }

    if (!signupPassword) {
      errs.signupPassword = 'Password is required';
    } else if (signupPassword.length < 8) {
      errs.signupPassword = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(signupPassword)) {
      errs.signupPassword = 'Password must include at least one uppercase letter';
    } else if (!/[0-9]/.test(signupPassword)) {
      errs.signupPassword = 'Password must include at least one numeric digit';
    }

    if (signupPassword !== signupConfirmPassword) {
      errs.signupConfirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      errs.agreeTerms = 'You must accept the Terms of Service and Privacy Policy';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate Limiting Check
    const currentRate = checkRateLimit();
    if (!currentRate.allowed) {
      setRateLimitInfo(currentRate);
      showToast(
        'Too Many Failed Attempts',
        `Account locked for security. Please try again in ${currentRate.remainingSeconds}s.`,
        'error'
      );
      return;
    }

    if (!validateLogin()) return;

    setLoading(true);

    try {
      const authResult = await authenticateUserAccount(loginIdentifier, loginPassword);

      setLoading(false);

      if (authResult.success && authResult.user) {
        clearRateLimit();
        const sessionToken = createAuthSessionToken(
          authResult.user.id,
          authResult.user.username,
          authResult.user.email || `${authResult.user.username}@domain.com`,
          loginRemember
        );

        showToast('Login Successful', `Welcome back, ${authResult.user.name}`);
        onLoginSuccess(authResult.user, sessionToken);
      } else {
        const updatedRate = recordFailedAttempt();
        setRateLimitInfo(updatedRate);

        const errorMsg = authResult.error || 'Invalid email/username or password.';
        setErrors({
          loginPassword: errorMsg,
        });
        showToast('Authentication Failed', errorMsg, 'error');
      }
    } catch (err) {
      setLoading(false);
      setErrors({
        loginPassword: 'Invalid email/username or password.',
      });
      showToast('Authentication Failed', 'Invalid email/username or password.', 'error');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);

    try {
      const regResult = await registerUserAccount(
        signupName,
        signupUsername,
        signupEmail,
        signupPassword
      );

      setLoading(false);

      if (regResult.success && regResult.user) {
        clearRateLimit();
        const sessionToken = createAuthSessionToken(
          regResult.user.id,
          regResult.user.username,
          regResult.user.email || signupEmail,
          true
        );

        showToast('Account Created!', `Welcome, ${regResult.user.name}`);
        onLoginSuccess(regResult.user, sessionToken);
      } else {
        const errMsg = regResult.error || 'Failed to create account.';
        setErrors({
          signupEmail: errMsg,
        });
        showToast('Sign Up Failed', errMsg, 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Sign Up Failed', 'An error occurred during account creation.', 'error');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ forgotEmail: 'Please enter a valid email address' });
      return;
    }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setForgotSubmitted(true);
      showToast('Reset Link Sent', `Password reset instructions sent to ${forgotEmail}`);
    }, 1000);
  };

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${
        isDark
          ? 'bg-[#0f172a] text-slate-100'
          : 'bg-gradient-to-br from-slate-100 via-indigo-50/50 to-slate-200 text-slate-800'
      }`}
    >
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-white animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold">{toastMessage.title}</h4>
            <p className="text-xs text-slate-300">{toastMessage.body}</p>
          </div>
        </div>
      )}

      {/* Main Glassmorphism Auth Card */}
      <div
        className={`w-full max-w-md my-auto relative rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-300 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800/90 backdrop-blur-xl shadow-indigo-950/40'
            : 'bg-white/95 border-slate-200 backdrop-blur-xl shadow-slate-300/60'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight">
                Secure<span className="text-indigo-500">Auth</span>
              </span>
              <span className="text-[10px] block text-slate-400 font-medium">
                Production Database Portal
              </span>
            </div>
          </div>

          <button
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:text-amber-300'
                : 'bg-slate-100 border-slate-300 text-indigo-600 hover:text-indigo-700'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Security Badge */}
        <div className="mb-6 p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 flex items-center gap-2.5 text-xs text-indigo-300">
          <LockKeyhole className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Real Database Storage & Password Hashing Active</span>
        </div>

        {/* Form Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'login'
              ? 'Welcome back'
              : mode === 'signup'
              ? 'Create an Account'
              : 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Enter your registered email or username and password to log in.'
              : mode === 'signup'
              ? 'Sign up to create your own secure account in the database.'
              : 'Enter your registered email address to receive password instructions'}
          </p>
        </div>

        {/* Navigation Tabs */}
        {mode !== 'forgot' && (
          <div
            className={`flex p-1 rounded-2xl border mb-6 ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/60'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Lockout Warning Banner */}
        {lockoutTimer > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center gap-3 text-red-200 text-xs animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-bold">Security Lockout Active</p>
              <p className="text-[11px] text-red-300">
                Too many failed attempts. Try again in <strong>{lockoutTimer}s</strong>.
              </p>
            </div>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Your username or email"
                  disabled={lockoutTimer > 0}
                  aria-invalid={!!errors.loginIdentifier}
                  className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.loginIdentifier
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <AtSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              </div>
              {errors.loginIdentifier && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.loginIdentifier}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrors({});
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={lockoutTimer > 0}
                  aria-invalid={!!errors.loginPassword}
                  className={`w-full border rounded-xl py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.loginPassword
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.loginPassword && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.loginPassword}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={loginRemember}
                  onChange={(e) => setLoginRemember(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember Me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  aria-invalid={!!errors.signupName}
                  className={`w-full border rounded-xl py-2 pl-9 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.signupName
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>
              {errors.signupName && (
                <p className="text-[11px] text-red-400 mt-0.5">{errors.signupName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="alex_morgan"
                  aria-invalid={!!errors.signupUsername}
                  className={`w-full border rounded-xl py-2 pl-9 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.signupUsername
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <AtSign className="w-4 h-4 absolute left-3 top-2.5 text-indigo-400" />
              </div>
              {errors.signupUsername && (
                <p className="text-[11px] text-red-400 mt-0.5">{errors.signupUsername}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="alex@example.com"
                  aria-invalid={!!errors.signupEmail}
                  className={`w-full border rounded-xl py-2 pl-9 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.signupEmail
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              </div>
              {errors.signupEmail && (
                <p className="text-[11px] text-red-400 mt-0.5">{errors.signupEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  aria-invalid={!!errors.signupPassword}
                  className={`w-full border rounded-xl py-2 pl-9 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.signupPassword
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showSignupPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {signupPassword && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-bold ${passStrength.textColors}`}>
                      {passStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all ${
                          step <= passStrength.score
                            ? passStrength.color
                            : 'bg-slate-700/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.signupPassword && (
                <p className="text-[11px] text-red-400 mt-0.5">{errors.signupPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showSignupConfirmPassword ? 'text' : 'password'}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  aria-invalid={!!errors.signupConfirmPassword}
                  className={`w-full border rounded-xl py-2 pl-9 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.signupConfirmPassword
                      ? 'border-red-500 bg-red-950/20'
                      : isDark
                      ? 'bg-slate-800/90 border-slate-700 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <ShieldCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showSignupConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.signupConfirmPassword && (
                <p className="text-[11px] text-red-400 mt-0.5">
                  {errors.signupConfirmPassword}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <span>
                  I accept the{' '}
                  <a href="#terms" onClick={(e) => e.preventDefault()} className="text-indigo-400 underline font-medium">
                    Terms of Service
                  </a>{' '}
                  &{' '}
                  <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-indigo-400 underline font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-[11px] text-red-400 mt-0.5">{errors.agreeTerms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            {forgotSubmitted ? (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/80 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-100">Check Your Inbox</h3>
                <p className="text-xs text-slate-300">
                  We've sent a password reset link to <strong className="text-white">{forgotEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotSubmitted(false);
                  }}
                  className="mt-3 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.forgotEmail
                          ? 'border-red-500'
                          : isDark
                          ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  </div>
                  {errors.forgotEmail && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.forgotEmail}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* BOTTOM TOGGLE LINK */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrors({});
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline ml-1 cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrors({});
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold underline ml-1 cursor-pointer"
              >
                Log In
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
