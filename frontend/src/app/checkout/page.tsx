'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Check, CreditCard, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { api } from '../../utils/api';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { items, summary, coupon, couponDiscount, clearCart, fetchCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address Form State
  const [newTitle, setNewTitle] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('India');
  const [newPhone, setNewPhone] = useState('');

  // Payment Simulation Modal State
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [pendingOrderDetails, setPendingOrderDetails] = useState<any>(null);

  // Authenticate user check and load details
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Authentication Required', 'Please log in to finalize checkout.');
      router.push('/auth/login');
    } else if (isAuthenticated) {
      loadAddresses();
      fetchCart();
    }
  }, [isAuthenticated, authLoading, router, fetchCart]);

  const loadAddresses = async () => {
    try {
      const response: any = await api.get('/addresses');
      const data = response.data.addresses;
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: Address) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : data[0].id);
      }
    } catch (err: any) {
      toast.error('Error Loading Addresses', 'Could not load saved locations.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState || !newPostalCode || !newPhone) {
      toast.error('Validation Error', 'Please complete all address details.');
      return;
    }

    try {
      const response: any = await api.post('/addresses', {
        title: newTitle,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        country: newCountry,
        phone: newPhone,
        isDefault: addresses.length === 0,
      });

      const addedAddress = response.data.address;
      setAddresses([...addresses, addedAddress]);
      setSelectedAddressId(addedAddress.id);
      setShowAddressForm(false);
      
      // Reset form
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewPostalCode('');
      setNewPhone('');
      toast.success('Address Added', 'Delivery location registered successfully.');
    } catch (err: any) {
      toast.error('Failed to Add Address', err.response?.data?.message || 'Error occurred.');
    }
  };

  // Loads Razorpay Script dynamically for real transactions
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async () => {
    if (!selectedAddressId) {
      toast.error('Checkout Error', 'Please select a delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const checkoutPayload = {
        addressId: selectedAddressId,
        couponCode: coupon?.code || undefined,
      };

      const response: any = await api.post('/orders/checkout', checkoutPayload);
      const orderData = response.data.data; // contains orderId, orderNumber, totalAmount, razorpayOrder
      
      if (orderData.razorpayOrder?.isMock) {
        // Razorpay is not configured (Mock/Simulation mode)
        setPendingOrderDetails(orderData);
        setShowSimulationModal(true);
        setIsSubmitting(false);
      } else {
        // Proceed with live/test Razorpay SDK integration
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Payment Error', 'Failed to load payment gateway SDK.');
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
          amount: orderData.razorpayOrder.amount,
          currency: orderData.razorpayOrder.currency,
          name: 'Luxe Blooms',
          description: `Order Ref: ${orderData.orderNumber}`,
          order_id: orderData.razorpayOrder.id,
          handler: async (paymentResponse: any) => {
            try {
              const verificationPayload = {
                orderId: orderData.orderId,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              };

              await api.post('/orders/verify', verificationPayload);
              clearCart();
              toast.success('Payment Verified', 'Your luxury arrangement is scheduled for preparation.');
              router.push(`/order-tracking/${orderData.orderId}`);
            } catch (err: any) {
              toast.error('Payment Verification Failed', 'Contact customer support.');
              router.push(`/dashboard?tab=orders`);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#1b3b2b', // Luxe Blooms Forest Green
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error('Checkout Failed', err.response?.data?.message || err.message || 'Error executing checkout.');
      setIsSubmitting(false);
    }
  };

  const handleSimulatedPaymentSuccess = async () => {
    if (!pendingOrderDetails) return;
    setIsSubmitting(true);
    try {
      const verificationPayload = {
        orderId: pendingOrderDetails.orderId,
        razorpayOrderId: pendingOrderDetails.razorpayOrder.id,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
        razorpaySignature: 'mock_verified_sig_luxe_blooms_auth',
      };

      await api.post('/orders/verify', verificationPayload);
      clearCart();
      setShowSimulationModal(false);
      toast.success('Order Placed Successfully', 'Simulated transaction completed.');
      router.push(`/order-tracking/${pendingOrderDetails.orderId}`);
    } catch (err: any) {
      toast.error('Verification Error', 'Failed to resolve simulated order status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !showSimulationModal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl text-forest-950 dark:text-cream-50 mb-4">Your checkout bag is empty</h1>
        <p className="text-forest-550 dark:text-cream-200/60 font-light mb-8">Add gorgeous flowers to your bag first.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded-full transition-colors cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-light text-forest-950 dark:text-cream-50 mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Address Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Location Box */}
          <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-forest-950 dark:text-cream-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-500" /> Delivery Address
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gold-600 hover:text-gold-500 transition-colors font-semibold"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="space-y-4 bg-cream-50/20 dark:bg-forest-950/20 p-5 rounded-2xl border border-cream-100/50 dark:border-forest-850">
                <h3 className="text-sm font-medium text-forest-900 dark:text-cream-100 mb-2">New Delivery Destination</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Label</label>
                    <select
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-950 dark:text-cream-100 focus:outline-none"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Recipient">Recipient's House</option>
                      <option value="Hotel">Hotel / Venue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="Apartment, suite, street name"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-950 dark:text-cream-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-950 dark:text-cream-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="Pincode"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-950 dark:text-cream-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-forest-100 dark:border-forest-800 text-forest-700 dark:text-cream-200 text-xs uppercase tracking-wider rounded-xl hover:bg-cream-50/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-forest-900 text-white text-xs uppercase tracking-wider rounded-xl hover:bg-forest-850"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-forest-100 dark:border-forest-800 rounded-2xl">
                    <p className="text-sm text-forest-550 dark:text-cream-300 font-light mb-4">No saved addresses found.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-4 py-2 bg-forest-900 text-white text-xs uppercase tracking-wider rounded-full hover:bg-forest-850"
                    >
                      Create First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-gold-500 bg-gold-50/10 dark:bg-gold-950/10 shadow-sm'
                            : 'border-forest-100 dark:border-forest-800 bg-transparent hover:border-forest-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs uppercase tracking-wider font-semibold text-forest-900 dark:text-cream-100 bg-cream-50 dark:bg-forest-800 px-2 py-0.5 rounded">
                            {addr.title}
                          </span>
                          {selectedAddressId === addr.id && (
                            <span className="w-5 h-5 bg-gold-500 text-white rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-forest-950 dark:text-cream-100 font-light leading-tight">
                          {addr.street}
                        </p>
                        <p className="text-xs text-forest-550 dark:text-cream-300 font-light mt-1">
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p className="text-[11px] text-forest-450 dark:text-cream-400 mt-2 font-mono">
                          Ph: {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-forest-950 dark:text-cream-100 flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-gold-500" /> Payment Provider
            </h2>
            <div className="p-4 border border-gold-500/35 bg-gold-50/5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center font-bold">
                  RP
                </span>
                <div>
                  <p className="text-sm font-semibold text-forest-900 dark:text-cream-100">Razorpay Payment Gateway</p>
                  <p className="text-xs text-forest-550 dark:text-cream-300 font-light">Cards, UPI, Netbanking, Wallet</p>
                </div>
              </div>
              <span className="w-5 h-5 bg-gold-500 text-white rounded-full flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-forest-450 dark:text-cream-400 mt-4 leading-relaxed font-light">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Your transaction is encrypted. In simulated development environments, Razorpay transactions bypass standard signatures.
            </div>
          </div>

        </div>

        {/* Right Side: Cart Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-forest-950 dark:text-cream-100 mb-6 pb-2 border-b border-cream-50 dark:border-forest-850">
              Order Breakdown
            </h2>

            {/* Items Summary list */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-forest-950 dark:text-cream-100 line-clamp-1">{item.product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-forest-550 dark:text-cream-300">Qty: {item.quantity}</span>
                      {item.customFlowerConfig && (
                        <span className="text-[10px] bg-gold-100 dark:bg-gold-950/40 text-gold-700 px-1.5 py-0.5 rounded font-medium">Custom</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-mono font-medium text-forest-950 dark:text-cream-50">
                    ₹{(item.totalPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary Details */}
            <div className="space-y-3 pt-4 border-t border-cream-50 dark:border-forest-850 text-sm">
              <div className="flex justify-between text-forest-550 dark:text-cream-300">
                <span>Subtotal</span>
                <span className="font-mono">₹{summary.subtotal.toFixed(2)}</span>
              </div>
              
              {coupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> Coupon ({coupon.code})</span>
                  <span className="font-mono">- ₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-forest-550 dark:text-cream-300">
                <span>Delivery Fee</span>
                <span className="font-mono">
                  {summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-lg font-serif text-forest-950 dark:text-cream-100 pt-3 border-t border-cream-50 dark:border-forest-850">
                <span>Grand Total</span>
                <span className="font-mono font-semibold">₹{summary.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              disabled={isSubmitting || addresses.length === 0}
              className="w-full mt-6 py-4 px-4 bg-forest-900 hover:bg-forest-850 disabled:bg-forest-900/60 text-white rounded-full flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 cursor-pointer shadow-md shadow-forest-900/10"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating Order...
                </>
              ) : (
                <>
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Simulated Payment Gateway Modal */}
      {showSimulationModal && pendingOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-forest-900 w-full max-w-md rounded-3xl p-6 border border-gold-500/20 shadow-2xl relative">
            <h3 className="font-serif text-2xl text-center text-forest-950 dark:text-cream-50 mb-3">
              Razorpay Simulation
            </h3>
            <p className="text-xs text-forest-550 dark:text-cream-200/60 text-center font-light leading-relaxed mb-6">
              Luxe Blooms API credentials are currently empty. The server automatically generated a mock order container.
            </p>

            <div className="bg-cream-50/40 dark:bg-forest-950/40 border border-cream-100 dark:border-forest-850 rounded-2xl p-5 mb-6 text-sm">
              <div className="flex justify-between py-1.5 border-b border-cream-50/50 dark:border-forest-800">
                <span className="text-forest-550 dark:text-cream-300">Order Ref</span>
                <span className="font-mono font-medium text-forest-950 dark:text-cream-100">{pendingOrderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-cream-50/50 dark:border-forest-800">
                <span className="text-forest-550 dark:text-cream-300">Gateway Order ID</span>
                <span className="font-mono font-medium text-forest-950 dark:text-cream-100">{pendingOrderDetails.razorpayOrder.id}</span>
              </div>
              <div className="flex justify-between py-1.5 pt-2 font-serif text-base">
                <span className="text-forest-950 dark:text-cream-100">Amount Due</span>
                <span className="font-mono font-semibold text-gold-600">₹{pendingOrderDetails.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSimulatedPaymentSuccess}
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Simulating verification...' : 'Simulate Success Payment'}
              </button>
              
              <button
                onClick={() => {
                  setShowSimulationModal(false);
                  toast.error('Payment Cancelled', 'Razorpay session closed.');
                }}
                className="w-full py-3 border border-forest-100 dark:border-forest-800 text-forest-700 dark:text-cream-200 text-sm font-medium rounded-xl hover:bg-cream-50/40 transition-colors cursor-pointer"
              >
                Simulate Payment Failure / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
