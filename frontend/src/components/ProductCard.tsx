'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star, Truck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';
import { api } from '../utils/api';

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  isBestSeller: boolean;
  isSameDayDelivery: boolean;
  rating: number;
  flowerType: string;
}

interface ProductCardProps {
  product: ProductType;
  inWishlist?: boolean;
  onWishlistToggle?: () => void;
}

export default function ProductCard({ product, inWishlist = false, onWishlistToggle }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to add products to your cart.');
      return;
    }
    try {
      await addItem(product.id, 1);
      toast.success('Added to Cart', `${product.name} has been added to your shopping bag.`);
    } catch (err: any) {
      toast.error('Failed to add item', err.message);
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to manage your wishlist.');
      return;
    }
    try {
      await api.post('/wishlist/toggle', { productId: product.id });
      if (onWishlistToggle) {
        onWishlistToggle();
      }
      toast.success(
        inWishlist ? 'Removed from Wishlist' : 'Saved to Wishlist',
        inWishlist ? `${product.name} removed.` : `${product.name} added to your collection.`
      );
    } catch (err: any) {
      toast.error('Wishlist error', err.message);
    }
  };

  const priceToDisplay = product.salePrice !== null ? product.salePrice : product.price;

  return (
    <div className="group relative bg-white dark:bg-forest-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-forest-100 dark:border-forest-800 transition-all duration-300 flex flex-col font-sans">
      
      {/* Product Image section */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-cream-50">
        
        {/* badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.isBestSeller && (
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-gold-500 text-white shadow">
              Bestseller
            </span>
          )}
          {product.salePrice !== null && (
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-rose-650 text-white shadow">
              Sale
            </span>
          )}
        </div>

        {/* Same day express delivery badge */}
        {product.isSameDayDelivery && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-[9px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-forest-900/80 backdrop-blur-sm text-cream-100 border border-cream-200/20">
            <Truck className="w-2.5 h-2.5" />
            Same Day
          </div>
        )}

        {/* Hover Zoom Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Wishlist Icon trigger */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-1/2 -translate-y-[120%] right-4 p-2.5 rounded-full shadow-lg border backdrop-blur-sm transform transition-all duration-300 z-10 ${
          inWishlist
            ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 scale-105'
            : 'bg-white/80 border-forest-100 text-forest-550 hover:bg-white hover:text-rose-500 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Details section */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-1 text-xs text-forest-550 dark:text-cream-200 mb-1.5">
          <span>{product.flowerType} Arrangements</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
            <span className="font-semibold text-forest-900 dark:text-cream-50">{product.rating}</span>
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className="block flex-1 mb-3">
          <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50 leading-snug group-hover:text-gold-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pricing & Add to Cart button */}
        <div className="flex items-center justify-between gap-4 mt-auto">
          <div className="flex flex-col">
            {product.salePrice !== null && (
              <span className="text-xs text-forest-400 line-through">
                INR {product.price}
              </span>
            )}
            <span className="font-serif font-bold text-base text-forest-900 dark:text-gold-100">
              INR {priceToDisplay}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-forest-900 dark:bg-gold-500 text-white dark:text-forest-950 hover:bg-gold-500 dark:hover:bg-gold-600 dark:hover:text-forest-900 hover:text-white transition-all duration-300 transform group-hover:scale-[1.02]"
          >
            Add to Bag
          </button>
        </div>

      </div>

    </div>
  );
}
