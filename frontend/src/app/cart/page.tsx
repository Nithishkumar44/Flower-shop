'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { Trash2, ShoppingBag, ArrowRight, Ticket, Sparkles } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    summary,
    coupon,
    couponDiscount,
    isLoading,
    fetchCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon
  } = useCartStore();
  
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQtyChange = async (itemId: string, currentQty: number, increment: boolean) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    try {
      await updateQuantity(itemId, newQty);
    } catch (err: any) {
      toast.error('Quantity update failed', err.message);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success('Removed', 'Floral arrangement removed from your shopping bag.');
    } catch (err: any) {
      toast.error('Removal failed', err.message);
    }
  };

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }

    setIsApplying(true);
    try {
      await applyCoupon(couponCode.trim().toUpperCase());
      toast.success('Coupon Applied!', `Discount applied successfully.`);
      setCouponCode('');
    } catch (err: any) {
      toast.error('Failed to apply coupon', err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    router.push('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <span className="text-4xl block mb-4">🔒</span>
        <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">Session Required</h3>
        <p className="text-xs text-forest-550 dark:text-cream-200 mt-2">Please login to view and manage your shopping bag.</p>
        <Link href="/auth/login?redirect=/cart" className="mt-6 inline-block px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-full font-semibold text-xs transition-colors">
          Login Session
        </Link>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500 mx-auto" />
        <p className="mt-4 text-xs text-forest-550">Polishing your shopping bag details...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center max-w-lg mx-auto font-sans bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 rounded-3xl p-16">
        <div className="w-16 h-16 rounded-full bg-gold-50 dark:bg-forest-800 text-gold-500 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">Your Bag is Empty</h3>
        <p className="text-xs text-forest-550 dark:text-cream-200 mt-2 max-w-xs mx-auto">
          You have not added any luxury floral arrangements yet. Start browsing to build your collection.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/products" className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-full text-xs font-semibold shadow-md">
            Shop Catalog
          </Link>
          <Link href="/customize" className="px-6 py-2.5 border border-forest-200 dark:border-forest-800 hover:bg-cream-50 text-forest-900 dark:text-cream-200 rounded-full text-xs font-semibold">
            Customize Bouquet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      <div className="mb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600">Shopping Bag</span>
        <h1 className="font-serif font-bold text-3xl text-forest-900 dark:text-cream-50 mt-1">
          Review Your Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const isCustom = !!item.customFlowerConfig;
            const customDetails: any = item.customFlowerConfig;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-forest-900 rounded-2xl border border-forest-100 dark:border-forest-800 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-forest-200"
              >
                {/* Item Thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-50 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info parameters */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50 truncate">
                      {item.product.name}
                    </h3>
                    {isCustom && (
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-gold-600 bg-gold-50 dark:bg-forest-850 px-2 py-0.5 rounded-full flex items-center gap-1 border border-gold-200/20">
                        <Sparkles className="w-2 h-2 fill-current" />
                        Custom Design
                      </span>
                    )}
                  </div>

                  {/* Render customization configs if custom bouquet */}
                  {isCustom && customDetails && (
                    <div className="mt-1 text-[10px] text-forest-550 dark:text-cream-200 leading-normal max-w-sm">
                      <p>• Wrap: {customDetails.wrapType} ({customDetails.wrapColor})</p>
                      <p>• Flowers: {customDetails.flowers.map((fl: any) => `${fl.flowerType} (x${fl.quantity})`).join(', ')}</p>
                      {customDetails.cardMessage && (
                        <p className="italic text-gold-600 mt-0.5">💌 Card: "{customDetails.cardMessage.message.substring(0, 30)}..."</p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-forest-400 mt-1">Single Price: INR {item.product.price}</p>
                </div>

                {/* Controls quantity & remove */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 flex-shrink-0">
                  <div className="flex items-center border border-forest-200 dark:border-forest-800 rounded-lg overflow-hidden bg-white dark:bg-forest-950">
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity, false)}
                      className="px-2 py-1 bg-cream-50 dark:bg-forest-900 text-forest-600 font-bold hover:bg-cream-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-forest-900 dark:text-cream-50">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity, true)}
                      className="px-2 py-1 bg-cream-50 dark:bg-forest-900 text-forest-600 font-bold hover:bg-cream-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-serif font-bold text-sm text-forest-900 dark:text-gold-100">
                      INR {item.totalPrice}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-forest-400 hover:text-red-500 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right: Coupon & Pricing Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Coupon discount block */}
          <div className="bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-forest-900 dark:text-cream-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-gold-500" />
              Apply Promo Code
            </h3>
            
            {coupon ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{coupon.code} Applied</span>
                  <p className="text-[9px] text-emerald-600">Saved INR {couponDiscount}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-[10px] uppercase font-bold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none focus:border-gold-500"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2 bg-forest-900 dark:bg-forest-800 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Pricing aggregates summary */}
          <div className="bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-forest-900 dark:text-cream-100 pb-2 border-b border-forest-100 dark:border-forest-850">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-forest-800 dark:text-cream-200">
              <div className="flex justify-between">
                <span>Subtotal Price:</span>
                <span className="font-semibold text-forest-900 dark:text-cream-50">INR {summary.subtotal}</span>
              </div>
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount:</span>
                  <span className="font-semibold">- INR {couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery & Shipping:</span>
                <span className="font-semibold text-forest-900 dark:text-cream-50">
                  {summary.deliveryFee === 0 ? 'FREE' : `INR ${summary.deliveryFee}`}
                </span>
              </div>

              <p className="text-[10px] text-forest-400 italic pt-1 border-t border-forest-200/20">
                * Free shipping for orders exceeding INR 1500. Same-day premium rates apply if chosen at checkout.
              </p>
            </div>

            <div className="border-t border-forest-100 dark:border-forest-850 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-forest-900 dark:text-cream-50">Total Amount:</span>
              <span className="font-serif font-bold text-xl text-forest-900 dark:text-gold-100">
                INR {summary.totalAmount}
              </span>
            </div>

            {/* Proceed to checkout trigger */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-gold-500 hover:bg-gold-600 text-white font-serif font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-1.5 transform active:scale-98"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
