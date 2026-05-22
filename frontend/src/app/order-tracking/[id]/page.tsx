'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, ArrowLeft, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../../utils/api';
import { toast } from '../../../store/useToastStore';
import OrderTimeline from '../../../components/OrderTimeline';

interface Address {
  title: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  address: Address;
  items: OrderItem[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [resolvedParams.id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response: any = await api.get(`/orders/${resolvedParams.id}`);
      setOrder(response.data.order);
    } catch (err: any) {
      toast.error('Failed to load order', 'No matching order was found.');
      router.push('/dashboard?tab=orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-forest-950 dark:text-cream-50 mb-4">Order Not Found</h1>
        <p className="text-forest-550 dark:text-cream-200/60 font-light mb-8">This tracking link is invalid or expired.</p>
        <button
          onClick={() => router.push('/dashboard?tab=orders')}
          className="px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-white rounded-full text-xs uppercase tracking-wider font-semibold"
        >
          View Order History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard?tab=orders')}
        className="inline-flex items-center text-xs uppercase tracking-wider text-forest-550 dark:text-cream-300 hover:text-gold-500 transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      {/* Main Order Box */}
      <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
        
        {/* Header summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-cream-50 dark:border-forest-850">
          <div>
            <span className="text-[10px] text-forest-450 dark:text-cream-300 font-mono tracking-wider uppercase">Order Invoice</span>
            <h1 className="font-serif text-2xl text-forest-950 dark:text-cream-50 font-semibold">{order.orderNumber}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-forest-550 dark:text-cream-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Timeline Tracking visualization */}
        <div>
          <h2 className="text-sm uppercase tracking-wider font-bold text-forest-900 dark:text-cream-250 mb-6">Delivery Timeline</h2>
          <OrderTimeline status={order.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-cream-50 dark:border-forest-850">
          {/* Shipping destination */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-forest-900 dark:text-cream-205 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-500" /> Shipping Destination
            </h3>
            <div className="bg-cream-50/20 dark:bg-forest-950/25 border border-cream-100 dark:border-forest-850 rounded-2xl p-5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-forest-900 bg-cream-50 dark:bg-forest-800 px-2 py-0.5 rounded">
                {order.address.title}
              </span>
              <p className="text-sm text-forest-950 dark:text-cream-100 font-medium mt-3 leading-relaxed">{order.address.street}</p>
              <p className="text-xs text-forest-550 dark:text-cream-300 mt-1 font-light">
                {order.address.city}, {order.address.state} - {order.address.postalCode}
              </p>
              <p className="text-xs text-forest-550 dark:text-cream-300 font-mono mt-3">
                Recipient Contact: {order.address.phone}
              </p>
            </div>
          </div>

          {/* Receipt detail */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-forest-900 dark:text-cream-205 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gold-500" /> Receipt Details
            </h3>
            <div className="bg-cream-50/20 dark:bg-forest-950/25 border border-cream-100 dark:border-forest-850 rounded-2xl p-5 space-y-4">
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-xs font-light">
                    <span className="text-forest-950 dark:text-cream-100 font-medium line-clamp-1">{item.product.name} (x{item.quantity})</span>
                    <span className="font-mono font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-cream-50 dark:border-forest-800 text-xs">
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span className="font-mono">- ₹{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-forest-550 dark:text-cream-300">
                  <span>Shipping Delivery</span>
                  <span className="font-mono">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-serif text-sm text-forest-950 dark:text-cream-50 pt-2 border-t border-cream-50 dark:border-forest-800">
                  <span>Amount Paid</span>
                  <span className="font-mono font-semibold text-gold-600">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-forest-450 dark:text-cream-400 font-light justify-center pt-4 border-t border-cream-50 dark:border-forest-850">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Thank you for choosing Luxe Blooms. Contact support for inquiries regarding custom arrangements.
        </div>

      </div>
    </div>
  );
}
