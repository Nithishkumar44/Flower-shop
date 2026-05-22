import React from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToastContainer from '../components/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Luxe Blooms | Premium Flower Delivery & Custom Bouquets',
  description: 'Experience premium luxury flower delivery. Order hand-crafted artisan bouquets, custom arrangements, and same-day express florals online.',
  keywords: 'flower delivery, luxury florist, fresh roses, custom bouquets, order flowers online, same day delivery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-cream-50/20 dark:bg-forest-950">
        
        {/* Navigation header */}
        <Navbar />

        {/* Page content wrapper with top offset for fixed navbar */}
        <main className="flex-grow pt-16">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global Toast Alerts */}
        <ToastContainer />

      </body>
    </html>
  );
}
