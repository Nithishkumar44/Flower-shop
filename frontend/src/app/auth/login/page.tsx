'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from '../../../store/useToastStore';

export default function LoginPage() {
  const { login, isAuthenticated, error, clearError, isLoading } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear errors when entering page
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/products');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Required Fields', 'Please fill in all details.');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Welcome Back!', 'Successfully logged in to Luxe Blooms.');
      router.push('/products');
    } catch (err: any) {
      toast.error('Login Failed', err.response?.data?.message || err.message || 'Invalid email or password.');
    }
  };

  const handleGoogleLogin = async () => {
    // Simulated Google Login using authStore
    try {
      const mockGoogleData = {
        email: 'user@luxeblooms.com',
        name: 'Luxe Customer',
        googleId: 'google_mock_123456'
      };
      // We will call the actual endpoint mock Google sign in
      const { googleLogin } = useAuthStore.getState();
      await googleLogin(mockGoogleData);
      toast.success('Google Login Successful', 'Logged in as Luxe Customer.');
      router.push('/products');
    } catch (err: any) {
      toast.error('Google Sign-In Failed', err.message || 'Unable to sign in with Google.');
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
            Hand-Crafted Luxury <br />
            For Every Moment
          </h2>
          <p className="text-cream-200/80 font-light text-sm max-w-md">
            Welcome to Luxe Blooms. Step inside to design customized bouquets, access same-day signature collections, and view personalized shipping timelines.
          </p>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-forest-900/40 p-8 rounded-3xl border border-cream-100/50 dark:border-forest-800/40 shadow-xl backdrop-blur-sm">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-light text-forest-950 dark:text-cream-50">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-forest-550 dark:text-cream-200/60 font-light">
              Access your premium luxury floral account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-wider text-forest-805 dark:text-cream-205 font-medium">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-gold-600 hover:text-gold-500 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-forest-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-cream-50/20 dark:bg-forest-950/40 text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  />
                </div>
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
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            {/* Google Authentication Button */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-forest-100 dark:border-forest-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white dark:bg-forest-900 text-forest-400 dark:text-cream-300">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-forest-100 dark:border-forest-800 rounded-xl text-sm font-medium text-forest-750 dark:text-cream-100 bg-white hover:bg-cream-50/30 dark:bg-transparent dark:hover:bg-forest-800/20 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </form>

          <p className="text-center text-sm text-forest-550 dark:text-cream-200/60 font-light mt-6">
            New to Luxe Blooms?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-gold-600 hover:text-gold-500 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
