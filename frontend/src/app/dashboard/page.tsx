'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, MapPin, Heart, User as UserIcon, Plus, Trash2, Calendar, Star, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { toast } from '../../store/useToastStore';
import { api } from '../../utils/api';
import DashboardSidebar from '../../components/DashboardSidebar';

interface Address {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
    slug: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  items: OrderItem[];
  address: Address;
}

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Add Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [title, setTitle] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Review Form Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Sync tab with query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'addresses', 'wishlist'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Authentication Required', 'Please log in to view your dashboard.');
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch functions memoized
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response: any = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (err: any) {
      toast.error('Failed to load orders', 'Could not fetch order logs.');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const response: any = await api.get('/addresses');
      setAddresses(response.data.addresses || []);
    } catch (err: any) {
      toast.error('Failed to load addresses', 'Could not fetch saved locations.');
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      const response: any = await api.get('/wishlist');
      setWishlist(response.data.wishlist || []);
    } catch (err: any) {
      toast.error('Failed to load wishlist', 'Could not fetch wishlist products.');
    } finally {
      setLoadingWishlist(false);
    }
  }, []);

  // Fetch relevant tab data
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'addresses') fetchAddresses();
      if (activeTab === 'wishlist') fetchWishlist();
    }
  }, [activeTab, isAuthenticated, fetchOrders, fetchAddresses, fetchWishlist]);

  // Add Address Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !phone) {
      toast.error('Validation Error', 'Please complete all address details.');
      return;
    }

    try {
      await api.post('/addresses', {
        title,
        street,
        city,
        state,
        postalCode,
        country: 'India',
        phone,
        isDefault: addresses.length === 0,
      });

      setShowAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhone('');
      toast.success('Success', 'Address added successfully.');
      fetchAddresses();
    } catch (err: any) {
      toast.error('Submission Failed', err.response?.data?.message || 'Failed to add address.');
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('Address Deleted', 'Location successfully removed.');
      fetchAddresses();
    } catch (err: any) {
      toast.error('Deletion Failed', 'Failed to remove address.');
    }
  };

  // Remove Wishlist Handler
  const handleRemoveWishlist = async (productId: string) => {
    try {
      await api.post('/wishlist/toggle', { productId });
      toast.success('Wishlist Updated', 'Item removed from your favorites.');
      fetchWishlist();
    } catch (err: any) {
      toast.error('Action Failed', 'Could not update wishlist.');
    }
  };

  // Quick Add To Cart
  const handleQuickAdd = async (productId: string) => {
    try {
      await addItem(productId, 1);
      toast.success('Added to Bag', 'Item successfully added to your shopping cart.');
    } catch (err: any) {
      toast.error('Error Adding Item', 'Could not add product to cart.');
    }
  };

  // Submit Review Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Required Field', 'Please add a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/reviews`, {
        productId: selectedProductId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setShowReviewModal(false);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review Submitted', 'Thank you for sharing your feedback!');
    } catch (err: any) {
      toast.error('Submission Failed', err.response?.data?.message || 'Could not save review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
      case 'PREPARING': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'PAID': return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'PENDING': return 'text-amber-500 font-medium';
      case 'FAILED': return 'text-rose-500 font-medium';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="md:col-span-1">
          <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 mb-6 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gold-500" /> Account Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Full Name</p>
                    <p className="text-base text-forest-950 dark:text-cream-50 font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Email Address</p>
                    <p className="text-base text-forest-950 dark:text-cream-50 font-mono font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Account Role</p>
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest-900 text-gold-500 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Date Joined</p>
                    <p className="text-sm text-forest-950 dark:text-cream-50 flex items-center gap-1.5 font-light">
                      <Calendar className="w-4 h-4 text-gold-500" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Welcome Card */}
              <div className="relative rounded-3xl bg-forest-900 overflow-hidden p-6 md:p-8 text-white flex flex-col justify-end min-h-[200px]">
                <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url('/images/login_flowers.png')` }} />
                <div className="relative z-10 space-y-2">
                  <h3 className="font-serif text-2xl font-light text-cream-100">Welcome to Luxe Blooms Club</h3>
                  <p className="text-xs text-cream-200/80 font-light max-w-lg leading-relaxed">
                    As a registered customer, you receive free shipping on orders exceeding ₹1500, access to the Custom Bouquet Designer visual tool, and automatic order timeline tracking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-gold-500" /> Order History
                </h2>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent inline-block" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-forest-900/20 border border-dashed border-forest-100 dark:border-forest-800 rounded-3xl">
                  <p className="text-sm text-forest-550 dark:text-cream-300 font-light mb-6">You haven't ordered any luxury arrangements yet.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm space-y-4"
                    >
                      {/* Header bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cream-50 dark:border-forest-850">
                        <div>
                          <p className="text-[10px] text-forest-450 dark:text-cream-300 font-mono tracking-wider">ORDER NUMBER</p>
                          <h4 className="text-sm font-semibold text-forest-950 dark:text-cream-50">{order.orderNumber}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-forest-550 dark:text-cream-300">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-4 items-center justify-between">
                            <div className="flex gap-3 items-center">
                              {item.product.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-cream-100"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center text-xs">💐</div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-forest-950 dark:text-cream-100">{item.product.name}</p>
                                <p className="text-xs text-forest-550 dark:text-cream-300 font-light">Quantity: {item.quantity}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-sm font-mono font-medium text-forest-950 dark:text-cream-50">
                                ₹{item.price.toFixed(2)}
                              </span>
                              {order.status === 'DELIVERED' && (
                                <button
                                  onClick={() => {
                                    setSelectedProductId(item.productId);
                                    setShowReviewModal(true);
                                  }}
                                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-gold-600 hover:text-gold-500"
                                  title="Write Review"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Review
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer bar */}
                      <div className="flex flex-wrap justify-between items-center pt-4 border-t border-cream-50 dark:border-forest-850 gap-4">
                        <div className="text-sm">
                          <span className="text-forest-550 dark:text-cream-300 mr-2">Payment:</span>
                          <span className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-serif text-forest-950 dark:text-cream-50">
                            Total: <strong className="font-mono font-semibold">₹{order.totalAmount.toFixed(2)}</strong>
                          </p>
                          <button
                            onClick={() => router.push(`/order-tracking/${order.id}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gold-500/35 hover:bg-gold-500 hover:text-white rounded-full text-xs font-semibold text-gold-600 transition-all cursor-pointer"
                          >
                            Track Order <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gold-500" /> Saved Addresses
                </h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-xs uppercase tracking-wider text-gold-600 hover:text-gold-500 font-semibold transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-850 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-forest-950 dark:text-cream-100">Add New Delivery Location</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Title (Home, Work)</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Home"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Apartment, building, street detail"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Pincode"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-forest-100 dark:border-forest-800 rounded-xl text-xs uppercase tracking-wider text-forest-700 dark:text-cream-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-forest-900 hover:bg-forest-850 text-white rounded-xl text-xs uppercase tracking-wider font-semibold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {loadingAddresses ? (
                <div className="py-12 text-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent inline-block" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-forest-900/20 border border-dashed border-forest-100 dark:border-forest-800 rounded-3xl">
                  <p className="text-sm text-forest-550 dark:text-cream-300 font-light mb-4">No registered delivery locations found.</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white text-xs uppercase tracking-wider font-semibold rounded-full"
                  >
                    Add Your First Location
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-5 shadow-sm relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-forest-900 bg-cream-50 px-2.5 py-0.5 rounded">
                            {addr.title}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-forest-950 dark:text-cream-50 leading-snug">{addr.street}</p>
                        <p className="text-xs text-forest-550 dark:text-cream-300 mt-1 font-light">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      </div>

                      <div className="flex justify-between items-center mt-5 pt-3 border-t border-cream-50 dark:border-forest-850">
                        <span className="text-xs font-mono text-forest-550 dark:text-cream-300">Ph: {addr.phone}</span>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors"
                          title="Delete Location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-gold-500" /> My Wishlist
              </h2>

              {loadingWishlist ? (
                <div className="py-12 text-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent inline-block" />
                </div>
              ) : wishlist.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-forest-900/20 border border-dashed border-forest-100 dark:border-forest-800 rounded-3xl">
                  <p className="text-sm text-forest-550 dark:text-cream-300 font-light mb-6">Your wishlist is empty.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl overflow-hidden shadow-sm relative group"
                    >
                      {/* Product Image */}
                      <div className="h-48 overflow-hidden relative">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-cream-50 flex items-center justify-center font-serif text-lg text-forest-400">💐</div>
                        )}
                        <button
                          onClick={() => handleRemoveWishlist(item.product.id)}
                          className="absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-forest-950/80 backdrop-blur-md rounded-full text-red-500 hover:bg-red-50 hover:scale-110 transition-all cursor-pointer"
                          title="Remove Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 
                            onClick={() => router.push(`/products/${item.product.slug}`)}
                            className="text-sm font-semibold text-forest-950 dark:text-cream-100 hover:text-gold-500 transition-colors cursor-pointer line-clamp-1"
                          >
                            {item.product.name}
                          </h4>
                          <p className="text-sm font-mono font-medium text-forest-950 dark:text-cream-50 mt-1">₹{item.product.price.toFixed(2)}</p>
                        </div>

                        <button
                          onClick={() => handleQuickAdd(item.product.id)}
                          disabled={item.product.stock === 0}
                          className="w-full py-2 bg-forest-900 hover:bg-forest-850 disabled:bg-forest-900/40 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          {item.product.stock === 0 ? 'Out of stock' : 'Add to Bag'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Review Comment Form Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleReviewSubmit}
            className="bg-white dark:bg-forest-900 w-full max-w-md rounded-3xl p-6 border border-gold-500/20 shadow-2xl relative space-y-4"
          >
            <h3 className="font-serif text-xl text-forest-950 dark:text-cream-50">Write Product Review</h3>
            
            {/* Rating */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= reviewRating 
                          ? 'fill-gold-500 text-gold-500' 
                          : 'text-forest-200 dark:text-forest-800'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-2">Your Feedback</label>
              <textarea
                required
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this beautiful luxury arrangement..."
                className="w-full p-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-forest-100 dark:border-forest-800 text-forest-700 dark:text-cream-200 text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-gold-600 hover:bg-gold-500 disabled:bg-gold-600/60 text-white text-xs uppercase tracking-wider font-semibold rounded-xl cursor-pointer"
              >
                {submittingReview ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-gold-500 border-t-transparent" />
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}
