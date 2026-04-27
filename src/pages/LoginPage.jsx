import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useCandidateStore } from '../store/useCandidateStore.js';

export default function LoginPage() {
  const [email, setEmail] = useState('admin1@example.com');
  const [password, setPassword] = useState('password123');
  const [mfaCode, setMfaCode] = useState('');

  const [isMfaStep, setIsMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const candidates = useCandidateStore((state) => state.candidates);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // ── Step 1: Check dynamically registered HR candidates first ──────────
      const match = candidates.find(
        (c) =>
          (c.email === email || c.username === email) &&
          c.password === password
      );

      if (match) {
        // Candidate found — log them in immediately with their stored userType
        loginSuccess(
          { email: match.email, name: match.fullName, role: match.userType || 'user' },
          `mock-token-candidate-${Date.now()}`
        );
        setLoading(false);
        return;
      }

      // ── Step 2: Fall back to the static mock API (admins + seeded users) ──
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.mfaRequired) {
        setIsMfaStep(true);
        setTempToken(data.tempToken);
      } else {
        loginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode) {
      setError('Please enter the MFA code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: mfaCode, tempToken })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid MFA code');
      }

      // Success
      loginSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-64 w-[500px] h-[500px] bg-brand-500/20 dark:bg-brand-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-sky-500/20 dark:bg-sky-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 transform -translate-x-1/2"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to TalentIntel AI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sign in to access advanced resume analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-800">
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!isMfaStep ? (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                    placeholder="admin1@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 select-none">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6 animate-in fade-in zoom-in-95 duration-300" onSubmit={handleMfaSubmit}>
              <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Two-Step Verification</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Please check your terminal. A 6-digit verification code has been generated for demo purposes.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                  Enter 6-digit Code
                </label>
                <div className="mt-3 relative flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="block w-48 text-center text-3xl tracking-[0.25em] font-mono py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow shadow-inner"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsMfaStep(false);
                    setMfaCode('');
                  }}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Demo Accounts
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">Admin (No MFA)</span>
                admin1@example.com<br/>password123
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="font-semibold block text-slate-700 dark:text-slate-300">User (MFA Email)</span>
                pmahanti@allshore.io<br/>password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
