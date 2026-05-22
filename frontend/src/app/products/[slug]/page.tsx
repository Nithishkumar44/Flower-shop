'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from '../../../store/useToastStore';
import { api } from '../../../utils/api';
import { Star, Truck, ShieldCheck, Heart, ArrowLeft, StarHalf } from 'lucide-react';
import Link from 'next/link';

interface ProductDetailProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<any | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'IDLE' | 'AVAILABLE' | 'UNAVAILABLE'>('IDLE');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response: any = await api.get(`/products/slug/${slug}`);
        setProduct(response.data.product);
        if (response.data.product.images?.length > 0) {
          setActiveImage(response.data.product.images[0]);
        }

        // Check if in wishlist
        if (isAuthenticated) {
          const wishRes: any = await api.get('/wishlist');
          const isLiked = wishRes.data.wishlist.some((w: any) => w.productId === response.data.product.id);
          setInWishlist(isLiked);
        }
      } catch (err) {
        console.error("Failed to load product details", err);
        toast.error("Error Loading Product", "The requested product could not be found.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, isAuthenticated]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to manage wishlist.');
      return;
    }
    try {
      const response: any = await api.post('/wishlist/toggle', { productId: product.id });
      setInWishlist(response.data.inWishlist);
      toast.success(
        response.data.inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
        response.data.inWishlist ? 'Saved to your collection.' : 'Removed.'
      );
    } catch (err: any) {
      toast.error('Wishlist error', err.message);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to add items to cart.');
      router.push('/auth/login?redirect=' + window.location.pathname);
      return;
    }
    try {
      await addItem(product.id, quantity);
      toast.success('Added to Bag', `${quantity} x ${product.name} added to your shopping bag.`);
    } catch (err: any) {
      toast.error('Failed to add', err.message);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to checkout.');
      router.push('/auth/login?redirect=' + window.location.pathname);
      return;
    }
    try {
      await addItem(product.id, quantity);
      router.push('/cart');
    } catch (err: any) {
      toast.error('Failed to add', err.message);
    }
  };

  // Submit product feedback
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to write a review.');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment is required');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.post(`/reviews/product/${product.id}`, {
        rating: newRating,
        comment: newComment
      });

      // Reload product details to show new review
      const response: any = await api.get(`/products/slug/${slug}`);
      setProduct(response.data.product);
      
      setNewComment('');
      setNewRating(5);
      toast.success('Review Submitted', 'Thank you for sharing your floral experience!');
    } catch (err: any) {
      toast.error('Failed to submit review', err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Check pin delivery availability
  const checkDeliveryPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 6) {
      toast.error('Invalid Pincode', 'Please enter a valid 6-digit pin code.');
      return;
    }

    // In production, cross-verify with shipping API. 
    // Here we'll simulate: if same day delivery is active and pin starts with 4 or 1 (typical metro prefix)
    if (product.isSameDayDelivery && (pincode.startsWith('4') || pincode.startsWith('1'))) {
      setPincodeStatus('AVAILABLE');
    } else if (!product.isSameDayDelivery && pincode) {
      // standard shipping is always available
      setPincodeStatus('AVAILABLE');
    } else {
      setPincodeStatus('UNAVAILABLE');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500 mx-auto" />
        <p className="mt-4 text-xs text-forest-550">Unveiling flower details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <h3 className="font-serif font-bold text-xl text-forest-900">Arrangement Not Found</h3>
        <p className="text-xs text-forest-550 mt-2">The floral display you requested does not exist or has wilted.</p>
        <Link href="/products" className="mt-6 inline-block px-6 py-2 bg-gold-500 text-white rounded-full text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Return link */}
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-forest-550 hover:text-gold-500 transition-colors mb-6 font-semibold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Previews */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-cream-50 rounded-3xl overflow-hidden border border-forest-100/50 shadow-sm relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full bg-gold-500 text-white shadow-md">
                Bestseller
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border transition-all ${
                    activeImage === img
                      ? 'border-gold-500 ring-2 ring-gold-100 scale-95'
                      : 'border-forest-100 hover:border-forest-300'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying controls & detail parameters */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header titles */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                {product.category?.name || 'Flora'}
              </span>
              <div className="flex items-center gap-0.5">
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                <span className="text-xs font-bold text-forest-900 dark:text-cream-50">
                  {product.rating} ({product.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>
            
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-forest-900 dark:text-cream-50 leading-tight mt-2">
              {product.name}
            </h1>
            
            {/* Price tag */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-serif font-bold text-2xl text-forest-900 dark:text-gold-100">
                INR {product.salePrice || product.price}
              </span>
              {product.salePrice !== null && (
                <span className="text-sm text-forest-400 line-through">
                  INR {product.price}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-forest-550 dark:text-cream-200 leading-relaxed border-t border-forest-100 dark:border-forest-850 pt-4">
            {product.description}
          </p>

          {/* Core arrangement parameters metadata */}
          <div className="grid grid-cols-2 gap-4 border-y border-forest-100 dark:border-forest-850 py-4 text-xs">
            <div>
              <span className="text-forest-400 block font-semibold uppercase tracking-wider text-[9px]">Flower type</span>
              <span className="font-bold text-forest-900 dark:text-cream-50 mt-0.5 block">{product.flowerType}</span>
            </div>
            <div>
              <span className="text-forest-400 block font-semibold uppercase tracking-wider text-[9px]">Occasion</span>
              <span className="font-bold text-forest-900 dark:text-cream-50 mt-0.5 block">{product.occasion}</span>
            </div>
            <div>
              <span className="text-forest-400 block font-semibold uppercase tracking-wider text-[9px]">Delivery Mode</span>
              <span className="font-bold text-forest-900 dark:text-cream-50 mt-0.5 block">
                {product.deliveryType === 'SAME_DAY' ? 'Same-day Express' :
                 product.deliveryType === 'HAND_DELIVERED' ? 'Hand-Delivered by Florist' : 'Courier Package'}
              </span>
            </div>
            <div>
              <span className="text-forest-400 block font-semibold uppercase tracking-wider text-[9px]">Stock Status</span>
              <span className={`font-bold mt-0.5 block ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Delivery Check Form */}
          <div className="space-y-2 bg-cream-50/50 dark:bg-forest-900/50 p-4 rounded-xl border border-forest-100/50 dark:border-forest-800">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-forest-900 dark:text-cream-100 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-gold-500" />
              Check Delivery Eligibility
            </h4>
            <form onSubmit={checkDeliveryPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-white dark:bg-forest-950 text-forest-900 dark:text-cream-50 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-forest-900 dark:bg-forest-800 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold"
              >
                Check
              </button>
            </form>
            {pincodeStatus === 'AVAILABLE' && (
              <p className="text-[10px] text-emerald-600 font-medium">✓ Delivery is available for this address!</p>
            )}
            {pincodeStatus === 'UNAVAILABLE' && (
              <p className="text-[10px] text-red-500 font-medium">✗ Same-day express is unavailable for this pincode. Standard courier available.</p>
            )}
          </div>

          {/* Quantities & Actions */}
          {product.stock > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-forest-550 dark:text-cream-200">Quantity:</span>
                <div className="flex items-center border border-forest-200 dark:border-forest-800 rounded-lg overflow-hidden bg-white dark:bg-forest-950">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-cream-50 dark:bg-forest-900 text-forest-600 font-bold hover:bg-cream-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-forest-900 dark:text-cream-50">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 bg-cream-50 dark:bg-forest-900 text-forest-600 font-bold hover:bg-cream-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-white dark:bg-forest-900 border-2 border-forest-900 dark:border-gold-500 text-forest-900 dark:text-gold-500 hover:bg-forest-900 dark:hover:bg-gold-500 hover:text-white dark:hover:text-forest-950 rounded-full font-bold text-sm tracking-wide transition-all"
                >
                  Add to Bag
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-full font-bold text-sm tracking-wide shadow-md transition-all"
                >
                  Buy Now
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full border shadow-sm transition-colors ${
                    inWishlist
                      ? 'bg-rose-50 border-rose-250 text-rose-500'
                      : 'bg-white dark:bg-forest-900 border-forest-150 dark:border-forest-800 text-forest-550 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 p-4 rounded-xl text-center">
              <p className="text-xs font-semibold text-red-650 dark:text-red-400">Temporarily Sold Out</p>
              <p className="text-[10px] text-red-500 mt-1">This luxury display will be back in season soon. Stay tuned!</p>
            </div>
          )}

        </div>

      </div>

      {/* Reviews & Feedback Section */}
      <section className="mt-20 border-t border-forest-100 dark:border-forest-850 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Submit Review Column */}
          <div className="lg:col-span-4 bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm sticky top-24">
            <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50 mb-4">
              Write a Review
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 hover:scale-115 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${
                        star <= newRating 
                          ? 'fill-gold-500 text-gold-500' 
                          : 'text-forest-200 dark:text-forest-850'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5 font-sans">Floral Feedback</label>
                <textarea
                  placeholder="Share your thoughts about freshness, arrangement, or packaging..."
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none focus:border-gold-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-2.5 bg-forest-900 dark:bg-gold-500 hover:bg-forest-800 dark:hover:bg-gold-600 text-white dark:text-forest-950 font-semibold text-xs rounded-lg shadow disabled:opacity-50 transition-colors"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Customer Reviews List Column */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50 border-b border-forest-100 dark:border-forest-850 pb-4 flex items-center gap-2">
              Reviews & Endorsements ({product.reviews?.length || 0})
            </h3>

            {(!product.reviews || product.reviews.length === 0) ? (
              <div className="text-center py-10 text-forest-550">
                <p className="text-xs italic">No reviews yet for this arrangement. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-forest-100 dark:divide-forest-850">
                {product.reviews.map((rev: any) => (
                  <div key={rev.id} className="pt-6 first:pt-0 font-sans">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-forest-900 dark:text-cream-50">{rev.user?.name || 'Anonymous'}</h4>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3 h-3 ${
                              star <= rev.rating ? 'fill-gold-500 text-gold-500' : 'text-forest-200'
                            }`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-forest-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-forest-800 dark:text-cream-200 leading-relaxed mt-2.5">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
