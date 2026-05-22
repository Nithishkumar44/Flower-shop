'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1600&auto=format&fit=crop&q=80',
    title: 'The Language of Elegance',
    subtitle: 'Artisan Floral Arrangements For Every Occasion',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
    align: 'left'
  },
  {
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1600&auto=format&fit=crop&q=80',
    title: 'Bespoke Bouquet Workshop',
    subtitle: 'Select Blooms, Wrappers, & Colors Crafted By Hand',
    ctaText: 'Design Yours Now',
    ctaLink: '/customize',
    align: 'center'
  },
  {
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1600&auto=format&fit=crop&q=80',
    title: 'Signature Same-Day Blooms',
    subtitle: 'Fresh Hand-Delivered Arrangements Right to Their Doorstep',
    ctaText: 'Shop Express Delivery',
    ctaLink: '/products?deliveryType=SAME_DAY',
    align: 'right'
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-forest-950 font-sans">
      
      {/* Slides images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0.3, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.3, scale: 0.95 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SLIDES[current].image})` }}
          />
          {/* Overlay dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950/70 via-forest-900/40 to-forest-950/70 dark:from-forest-950/90 dark:via-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`max-w-2xl text-white ${
            SLIDES[current].align === 'center' ? 'mx-auto text-center' :
            SLIDES[current].align === 'right' ? 'ml-auto text-right' : 'text-left'
          }`}>
            <motion.h4
              key={`sub-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xs uppercase tracking-widest text-gold-400 font-semibold mb-2"
            >
              {SLIDES[current].subtitle}
            </motion.h4>
            <motion.h1
              key={`title-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl sm:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight"
            >
              {SLIDES[current].title}
            </motion.h1>
            <motion.div
              key={`cta-${current}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Link
                href={SLIDES[current].ctaLink}
                className="inline-flex items-center px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {SLIDES[current].ctaText}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/20 bg-black/10 hover:bg-black/30 text-white hover:scale-115 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/20 bg-black/10 hover:bg-black/30 text-white hover:scale-115 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === current ? 'w-8 bg-gold-500' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
