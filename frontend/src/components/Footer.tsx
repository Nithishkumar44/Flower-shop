'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-cream-100 border-t border-forest-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <span className="font-serif text-2xl font-bold tracking-widest text-gold-100">
              LUXE <span className="text-gold-500">BLOOMS</span>
            </span>
            <p className="text-sm text-cream-200 leading-relaxed">
              Curating luxury floral memories and artful arrangements since 2012. Hand-crafted with devotion and delivered in bespoke signatures.
            </p>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-semibold text-gold-500 tracking-wider uppercase mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-cream-200">
              <li><Link href="/help" className="hover:text-gold-500 transition-colors">Help Center / FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-gold-500 transition-colors">Same-Day Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-gold-500 transition-colors">Flower Care Guide</Link></li>
              <li><Link href="/contact" className="hover:text-gold-500 transition-colors">Contact Floral Support</Link></li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-sm font-semibold text-gold-500 tracking-wider uppercase mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-sm text-cream-200">
              <li><Link href="/products?category=roses" className="hover:text-gold-500 transition-colors">Luxury Red Roses</Link></li>
              <li><Link href="/products?category=lilies" className="hover:text-gold-500 transition-colors">Fragrant Lilies</Link></li>
              <li><Link href="/products?category=tulips" className="hover:text-gold-500 transition-colors">Bright Spring Tulips</Link></li>
              <li><Link href="/products?category=orchids" className="hover:text-gold-500 transition-colors">Exotic White Orchids</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gold-500 tracking-wider uppercase mb-4">Floral Newsletter</h4>
            <p className="text-sm text-cream-200 leading-relaxed">
              Subscribe to unlock 10% off your first luxury arrangement and access to seasonal releases.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Enter email address"
                required
                className="w-full px-4 py-2 text-sm bg-forest-950 border border-forest-800 rounded-l-md focus:outline-none focus:border-gold-500 text-cream-50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm rounded-r-md transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-forest-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-300">
          <p>© {new Date().getFullYear()} Luxe Blooms Floral Co. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/sitemap" className="hover:underline">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
