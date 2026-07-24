import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Account created successfully! Check your email to confirm registration.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back to LendWise!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#1e1b17] flex items-center justify-center p-4 font-['Inter'] selection:bg-[#ffd9e2] selection:text-[#8d034b]">
      <div className="bg-[#ffffff] border border-[#ddbfc6] rounded-2xl max-w-md w-full p-8 shadow-xl relative overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#620032] tracking-tight mb-2">LendWise</h1>
          <p className="text-[#574147] text-sm">
            Private Loan & Accruing Interest Ledger
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147] block">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none font-['Inter']"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#574147] block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 bg-[#fff8f3] border border-[#ddbfc6] rounded-lg text-sm focus:border-[#620032] focus:ring-1 focus:ring-[#620032] outline-none font-['Inter']"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#8b004a] text-white font-['JetBrains_Mono'] text-sm font-bold rounded-lg hover:bg-[#620032] transition-all active:scale-95 shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#ddbfc6] text-center">
          <p className="text-xs text-[#574147]">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#620032] font-bold font-['JetBrains_Mono'] hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
