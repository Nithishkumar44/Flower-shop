import { create } from 'zustand';
import { api } from '../utils/api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  customFlowerConfig?: any;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    images: string[];
    stock: number;
  };
  totalPrice: number;
}

interface CartSummary {
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
}

interface CouponDetails {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  coupon: CouponDetails | null;
  couponDiscount: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, customConfig?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  clearCart: () => void;
  calculateCouponDiscount: (coupon: CouponDetails, subtotal: number) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  summary: { subtotal: 0, deliveryFee: 0, totalAmount: 0 },
  coupon: null,
  couponDiscount: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.get('/cart');
      const { items, summary } = response.data;
      
      set({ items, summary, isLoading: false });
      
      // Re-apply coupon if present
      const currentCoupon = get().coupon;
      if (currentCoupon) {
        get().calculateCouponDiscount(currentCoupon, summary.subtotal);
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  addItem: async (productId, quantity, customConfig) => {
    set({ isLoading: true });
    try {
      await api.post('/cart/add', { productId, quantity, customFlowerConfig: customConfig });
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message || 'Failed to add item', isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      await api.put(`/cart/item/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message || 'Failed to update quantity', isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      await api.delete(`/cart/item/${itemId}`);
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove item', isLoading: false });
      throw err;
    }
  },

  applyCoupon: async (code) => {
    set({ isLoading: true, error: null });
    const subtotal = get().summary.subtotal;
    try {
      const response: any = await api.get(`/coupons/validate?code=${code}&amount=${subtotal}`);
      const coupon = response.data.coupon;
      
      set({ coupon, isLoading: false });
      get().calculateCouponDiscount(coupon, subtotal);
    } catch (err: any) {
      set({ error: err.message || 'Failed to apply coupon', isLoading: false });
      throw err;
    }
  },

  removeCoupon: () => {
    const summary = get().summary;
    set({
      coupon: null,
      couponDiscount: 0,
      summary: {
        ...summary,
        totalAmount: summary.subtotal + summary.deliveryFee
      }
    });
  },

  clearCart: () => {
    set({
      items: [],
      summary: { subtotal: 0, deliveryFee: 0, totalAmount: 0 },
      coupon: null,
      couponDiscount: 0
    });
  },

  // Helper method inside create (accessed via helper binding)
  calculateCouponDiscount: (coupon: CouponDetails, subtotal: number) => {
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    const currentSummary = get().summary;
    set({
      couponDiscount: discount,
      summary: {
        ...currentSummary,
        totalAmount: Math.max(0, subtotal - discount + currentSummary.deliveryFee)
      }
    });
  }
}));
