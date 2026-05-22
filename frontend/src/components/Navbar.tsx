'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export default function Navbar() {
  const { user, logout, isAuthenticated, checkAuth } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Check user session and fetch cart
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalCartQty = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-forest-950/95 backdrop-blur-md shadow-md py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-serif text-2xl font-bold tracking-widest text-forest-900 dark:text-gold-100">
              LUXE <span className="text-gold-500">BLOOMS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium text-forest-800 dark:text-cream-200 hover:text-gold-500 dark:hover:text-gold-300 transition-colors">
              Shop Flowers
            </Link>
            <Link href="/products?occasion=anniversary" className="text-sm font-medium text-forest-800 dark:text-cream-200 hover:text-gold-500 dark:hover:text-gold-300 transition-colors">
              Anniversary
            </Link>
            <Link href="/products?deliveryType=SAME_DAY" className="text-sm font-medium text-forest-800 dark:text-cream-200 hover:text-gold-500 dark:hover:text-gold-300 transition-colors">
              Same-Day Delivery
            </Link>
            <Link href="/customize" className="text-sm font-semibold px-4 py-1.5 rounded-full border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white transition-all duration-300">
              Customize Bouquet
            </Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Search flowers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-1.5 pr-10 text-sm rounded-full border border-forest-200 dark:border-forest-800 bg-cream-50/50 dark:bg-forest-900 text-forest-900 dark:text-cream-50 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-550 dark:text-cream-200 hover:text-gold-500">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right side utility icons */}
          <div className="flex items-center space-x-4">
            
            {/* Admin control flag */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link href="/admin" className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors relative group" title="Admin Control Room">
                <ShieldAlert className="w-5 h-5" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-red-600 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Admin Room
                </span>
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/dashboard?tab=wishlist" className="p-2 text-forest-900 dark:text-cream-200 hover:text-gold-500 dark:hover:text-gold-300 transition-colors relative">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="p-2 text-forest-900 dark:text-cream-200 hover:text-gold-500 dark:hover:text-gold-300 transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalCartQty}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Login link */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/dashboard" className="hidden sm:flex items-center space-x-1 p-2 text-forest-900 dark:text-cream-200 hover:text-gold-500 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user?.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="p-2 text-forest-550 dark:text-cream-300 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center space-x-1 p-2 text-forest-900 dark:text-cream-200 hover:text-gold-500 transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Login</span>
              </Link>
            )}

            {/* Hamburger menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-forest-900 dark:text-cream-200 hover:text-gold-500 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-forest-950 border-b border-forest-100 dark:border-forest-900 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
            <input
              type="text"
              placeholder="Search flowers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 text-sm rounded-full border border-forest-200 dark:border-forest-800 bg-cream-50/50 dark:bg-forest-900 text-forest-900 dark:text-cream-50 focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-550 dark:text-cream-200">
              <Search className="w-4 h-4" />
            </button>
          </form>
          
          <Link href="/products" onClick={() => setIsOpen(false)} className="block text-base font-medium py-2 border-b border-forest-50 dark:border-forest-900 text-forest-800 dark:text-cream-200">
            Shop Flowers
          </Link>
          <Link href="/products?occasion=anniversary" onClick={() => setIsOpen(false)} className="block text-base font-medium py-2 border-b border-forest-50 dark:border-forest-900 text-forest-800 dark:text-cream-200">
            Anniversary Arrangements
          </Link>
          <Link href="/products?deliveryType=SAME_DAY" onClick={() => setIsOpen(false)} className="block text-base font-medium py-2 border-b border-forest-50 dark:border-forest-900 text-forest-800 dark:text-cream-200">
            Same-Day Collections
          </Link>
          <Link href="/customize" onClick={() => setIsOpen(false)} className="block text-base font-semibold py-2 text-gold-600">
            Custom Bouquet Builder
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-base font-medium py-2 text-forest-800 dark:text-cream-200">
              My Profile Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
