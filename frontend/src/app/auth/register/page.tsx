'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from '../../../store/useToastStore';

export default function RegisterPage() {
  const { register, isAuthenticated, error, clearError, isLoading } = useAuthStore();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clear errors on load
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/products');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Registration Error', 'Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Validation Error', 'Passwords do not match.');
      return;
    }

    try {
      await register({ name, email, password });
      toast.success('Registration Complete', 'Welcome to Luxe Blooms! Your account has been created.');
      router.push('/products');
    } catch (err: any) {
      toast.error('Registration Failed', err.response?.data?.message || err.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-cream-50/20 dark:bg-forest-950">
      {/* Left Column: Premium Floral Visual */}
      <div className="hidden lg:block lg:w-1/2 relative bg-forest-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-80 scale-105 transition-transform duration-[10000ms] hover:scale-100"
          style={{ backgroundImage: `url('/images/login_flowers.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 z-10 text-white">
          <span className="text-gold-400 font-medium tracking-widest text-xs uppercase mb-3 block">
            Artisan Floral Delivery
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-light leading-tight mb-4 text-cream-100">
            Create Elegant <br />
            Floral Memories
          </h2>
          <p className="text-cream-200/80 font-light text-sm max-w-md">
            Join Luxe Blooms to track orders, save curated delivery addresses, manage customized floral arrangements, and receive exclusive priority notifications.
          </p>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-forest-900/40 p-8 rounded-3xl border border-cream-100/50 dark:border-forest-800/40 shadow-xl backdrop-blur-sm">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-light text-forest-950 dark:text-cream-50">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-forest-550 dark:text-cream-200/60 font-light">
              Register for custom bouquets and express checkout
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-forest-805 dark:text-cream-205 font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-forest-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-cream-50/20 dark:bg-forest-950/40 text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs uppercase tracking-wider text-forest-805 dark:text-cream-205 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-forest-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-cream-50/20 dark:bg-forest-950/40 text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-forest-805 dark:text-cream-205 font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-forest-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-cream-50/20 dark:bg-forest-950/40 text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 flex items-center justify-center px-4 py-3.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-gold-600 hover:bg-gold-500 disabled:bg-gold-400/60 shadow-lg shadow-gold-500/10 hover:shadow-gold-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Registering...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Register Account <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-forest-550 dark:text-cream-200/60 font-light mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-gold-600 hover:text-gold-500 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
