'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroSlider from '../components/HeroSlider';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';
import { Heart, Sparkles, Star, ShieldCheck, Clock, Gift } from 'lucide-react';

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [sameDay, setSameDay] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bestRes, sameRes, wishRes]: any = await Promise.all([
          api.get('/products/bestsellers').catch(() => ({ data: { products: [] } })),
          api.get('/products/same-day').catch(() => ({ data: { products: [] } })),
          api.get('/wishlist').catch(() => ({ data: { wishlist: [] } }))
        ]);

        setBestsellers(bestRes.data.products || []);
        setSameDay(sameRes.data.products || []);
        setWishlistIds((wishRes.data.wishlist || []).map((w: any) => w.productId));
      } catch (err) {
        console.error("Failed to load storefront data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const refreshWishlist = async () => {
    try {
      const wishRes: any = await api.get('/wishlist');
      setWishlistIds((wishRes.data.wishlist || []).map((w: any) => w.productId));
    } catch (err) {
      console.log(err);
    }
  };

  const categories = [
    { name: 'Roses', slug: 'roses', count: '12 Items', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80' },
    { name: 'Lilies', slug: 'lilies', count: '8 Items', img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&auto=format&fit=crop&q=80' },
    { name: 'Tulips', slug: 'tulips', count: '15 Items', img: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=500&auto=format&fit=crop&q=80' },
    { name: 'Orchids', slug: 'orchids', count: '6 Items', img: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=500&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="w-full space-y-20 pb-20 bg-cream-50/20 dark:bg-forest-950 font-sans">
      
      {/* Parallax Hero Slider */}
      <HeroSlider />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600">Premium Curations</span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-forest-900 dark:text-cream-50 mt-2">
            Browse by Floral Varieties
          </h2>
          <p className="text-xs text-forest-550 dark:text-cream-200 mt-2">
            Each stem is carefully chosen at peak morning bloom to ensure absolute freshness.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-forest-100/50 dark:border-forest-800 shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[10px] tracking-wider text-gold-400 font-semibold">{cat.count}</span>
                <h4 className="font-serif font-bold text-lg group-hover:text-gold-400 transition-colors leading-tight mt-0.5">{cat.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600">The Favorites</span>
            <h2 className="font-serif font-bold text-3xl text-forest-900 dark:text-cream-50 mt-1">
              Bestseller Arrangements
            </h2>
          </div>
          <Link href="/products?sortBy=rating" className="text-sm font-semibold text-gold-600 hover:text-gold-700 transition-colors mt-2 sm:mt-0 underline decoration-gold-500 underline-offset-4">
            See All Bestsellers →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="animate-pulse flex flex-col space-y-4">
                <div className="aspect-[4/5] bg-forest-100 dark:bg-forest-900 rounded-2xl w-full" />
                <div className="h-4 bg-forest-100 dark:bg-forest-900 rounded w-2/3" />
                <div className="h-4 bg-forest-100 dark:bg-forest-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                inWishlist={wishlistIds.includes(product.id)}
                onWishlistToggle={refreshWishlist}
              />
            ))}
          </div>
        )}
      </section>

      {/* Same-Day Express Banners */}
      <section className="relative py-24 bg-forest-900 text-white overflow-hidden font-sans">
        <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1600&auto=format&fit=crop&q=80')` }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-gold-500">Same-Day Dispatch</span>
              <h2 className="font-serif font-bold text-4xl sm:text-5xl leading-tight">
                Fresh Flowers, Delivered In Hours
              </h2>
              <p className="text-sm text-cream-200 leading-relaxed">
                Forgot an important date? We have got you covered. Our same-day delivery service ensures fresh, hand-tied luxury bouquets arrive at their doorstep within 4 hours. Available across major metro locations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/products?deliveryType=SAME_DAY" className="inline-flex items-center justify-center px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm rounded-full shadow-lg transition-colors">
                  Order Same-Day Now
                </Link>
                <Link href="/customize" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/40 hover:bg-white hover:text-forest-900 text-white font-semibold text-sm rounded-full transition-all">
                  Build Custom Bouquet
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              {isLoading ? null : sameDay.slice(0, 2).map((product) => (
                <div key={product.id} className="bg-white/5 rounded-2xl border border-white/10 p-4 backdrop-blur-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-xl mb-3"
                  />
                  <h4 className="font-serif font-bold text-sm tracking-tight truncate">{product.name}</h4>
                  <p className="text-xs text-gold-400 font-semibold mt-1">INR {product.salePrice || product.price}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Values Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 dark:bg-forest-800 text-gold-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">4-Hour Express</h4>
            <p className="text-xs text-forest-550 dark:text-cream-200">Guaranteed hand-delivered shipping options within metro areas.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 dark:bg-forest-800 text-gold-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">Premium Stems</h4>
            <p className="text-xs text-forest-550 dark:text-cream-200">Exquisite flower breeds imported daily from Ecuador and Holland.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 dark:bg-forest-800 text-gold-500 flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">Bespoke Boxes</h4>
            <p className="text-xs text-forest-550 dark:text-cream-200">Arranged in luxury velvet boxes and craft wrapping configurations.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-50 dark:bg-forest-800 text-gold-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">Secure Transactions</h4>
            <p className="text-xs text-forest-550 dark:text-cream-200">Protected standard 256-bit SSL encryptions and Razorpay checkout.</p>
          </div>

        </div>
      </section>

    </div>
  );
}
