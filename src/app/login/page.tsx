'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const DEMO_ACCOUNTS = [
  {
    label: "Try as Sales Rep",
    email: "salesrep@eliselens.com",
    password: "Eliselens@2026",
    role: "SDR Account",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7C3AED]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#A855F7]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
            <span className="text-[#7C3AED]">Elise</span>
            <span className="text-[#1A1A2E]"> Lens</span>
          </h1>
          <p className="text-[#6B7280] mt-2 text-sm">AI-powered lead intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#EDE9FE]">
          <h2
            className="text-2xl font-bold text-[#1A1A2E] mb-2"
            style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-[#6B7280] mb-6 text-sm">
            {isSignUp ? 'Start enriching leads instantly' : 'Sign in to your workspace'}
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="you@company.com"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-[#1A1A2E] placeholder-gray-400 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-[#1A1A2E] placeholder-gray-400 transition-all"
            />
          </div>

          {/* Error / success message */}
          {error && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm text-center ${
                error.includes('Check your email')
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-500'
              }`}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full py-3 px-6 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(124,58,237,0.35)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)]"
            style={{ background: 'linear-gradient(135deg,#6D28D9,#7C3AED)' }}
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          {/* Demo accounts divider */}
          <div className="flex items-center gap-2 mt-5">
            <div className="flex-1 h-px bg-[#EDE9FE]" />
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-widest whitespace-nowrap">
              or try the live demo
            </span>
            <div className="flex-1 h-px bg-[#EDE9FE]" />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-1 gap-3 mt-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                disabled={loading}
                onClick={async () => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setIsSignUp(false);
                  setLoading(true);
                  setError('');
                  try {
                    const { error } = await supabase.auth.signInWithPassword({
                      email: account.email,
                      password: account.password,
                    });
                    if (error) throw error;
                    router.push('/dashboard');
                    router.refresh();
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Demo login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-[#EDE9FE] bg-[#F5F3FF] hover:border-[#7C3AED] hover:bg-white transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  SR
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-[#1A1A2E] text-sm group-hover:text-[#7C3AED] transition-colors">
                    Sales Rep Demo
                  </p>
                  <p className="text-xs text-[#6B7280]">{account.email}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-[#6B7280] mt-2">
            Click to instantly access the demo workspace
          </p>

          {/* Toggle sign up / sign in */}
          <p className="text-center text-sm text-[#6B7280] mt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-[#7C3AED] font-medium ml-1 hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-4">
          <a
            href="/"
            className="text-[#6B7280] text-sm hover:text-[#7C3AED] transition-colors"
          >
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
}
