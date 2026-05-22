'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { api } from '../../../utils/api';
import { toast } from '../../../store/useToastStore';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Required Field', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset Link Sent', 'Check your email inbox for further instructions.');
    } catch (err: any) {
      toast.error('Request Failed', err.response?.data?.message || err.message || 'No account was found with that email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-cream-50/20 dark:bg-forest-950">
      <div className="w-full max-w-md bg-white dark:bg-forest-900/40 p-8 sm:p-10 rounded-3xl border border-cream-100/50 dark:border-forest-800/40 shadow-xl backdrop-blur-sm">
        
        {/* Back Link */}
        <Link 
          href="/auth/login" 
          className="inline-flex items-center text-xs uppercase tracking-wider text-forest-550 dark:text-cream-300 hover:text-gold-500 dark:hover:text-gold-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
        </Link>

        {!isSent ? (
          <>
            <div className="text-left mb-6">
              <h1 className="font-serif text-3xl font-light text-forest-950 dark:text-cream-50">
                Reset Password
              </h1>
              <p className="mt-2 text-sm text-forest-550 dark:text-cream-200/60 font-light leading-relaxed">
                Enter the email address associated with your Luxe Blooms account, and we will email you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-forest-805 dark:text-cream-205 font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-forest-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-cream-50/20 dark:bg-forest-950/40 text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-gold-600 hover:bg-gold-500 disabled:bg-gold-400/60 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Sending Link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 font-semibold">
                    Send Reset Link <Send className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-cream-50 dark:bg-forest-900 border border-gold-500 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-50 mb-3">
              Check Your Email
            </h2>
            <p className="text-sm text-forest-550 dark:text-cream-200/70 font-light leading-relaxed mb-6">
              A temporary password reset link has been dispatched to <strong className="font-medium text-forest-900 dark:text-cream-50">{email}</strong>. Please follow the instructions in the email to set up your new credentials.
            </p>
            <p className="text-xs text-forest-450 dark:text-cream-400 font-light">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setIsSent(false)} 
                className="text-gold-600 hover:text-gold-500 underline font-medium transition-colors cursor-pointer"
              >
                try another address
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
