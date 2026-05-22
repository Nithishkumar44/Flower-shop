'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Package, Truck, Ticket, Plus, Trash2, Edit, Save, X, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { api } from '../../utils/api';
import AdminSidebar from '../../components/AdminSidebar';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: string[];
  flowerType: string;
  occasion: string;
  deliveryType: 'SAME_DAY' | 'HAND_DELIVERED' | 'COURIER';
  categoryId: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    phone: string;
  };
}

interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  recentOrders: Order[];
  salesByCategory: {
    categoryName: string;
    value: number;
  }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState('analytics');
  
  // States for data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Loadings
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Modal / Form states for Catalog
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(499);
  const [prodSalePrice, setProdSalePrice] = useState<number | null>(null);
  const [prodStock, setProdStock] = useState(10);
  const [prodImage, setProdImage] = useState('');
  const [prodFlowerType, setProdFlowerType] = useState('Roses');
  const [prodOccasion, setProdOccasion] = useState('Anniversary');
  const [prodDeliveryType, setProdDeliveryType] = useState<'SAME_DAY' | 'HAND_DELIVERED' | 'COURIER'>('HAND_DELIVERED');
  const [prodCategoryId, setProdCategoryId] = useState('');

  // Coupon Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMinOrder, setCouponMinOrder] = useState(999);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState<number | null>(null);
  const [couponExpiresAt, setCouponExpiresAt] = useState('');
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  // Security Access Protection
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Access Denied', 'Please log in as an administrator.');
        router.push('/auth/login');
      } else if (user?.role !== 'ADMIN') {
        toast.error('Unauthorized Room', 'Access restricted to system administrators.');
        router.push('/');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch Categories on catalog/load
  const loadCategories = async () => {
    try {
      const response: any = await api.get('/products/categories');
      setCategories(response.data.categories || []);
      if (response.data.categories?.length > 0) {
        setProdCategoryId(response.data.categories[0].id);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const response: any = await api.get('/admin/analytics');
      setAnalytics(response.data.data);
    } catch (err: any) {
      toast.error('Analytics Failed', 'Could not load store analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const response: any = await api.get('/products');
      setProducts(response.data.products || []);
      await loadCategories();
    } catch (err: any) {
      toast.error('Catalog Error', 'Could not fetch catalog products.');
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response: any = await api.get('/admin/orders');
      setOrders(response.data.data.orders || []);
    } catch (err: any) {
      toast.error('Orders Error', 'Could not load order registry.');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Fetch data depending on activeTab
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      if (activeTab === 'analytics') fetchAnalytics();
      if (activeTab === 'catalog') fetchCatalog();
      if (activeTab === 'orders') fetchOrders();
    }
  }, [activeTab, isAuthenticated, user, fetchAnalytics, fetchCatalog, fetchOrders]);

  // Create or Update Product Handler
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodDesc || !prodImage || !prodFlowerType || !prodCategoryId) {
      toast.error('Validation Error', 'Please complete all product specifications.');
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      salePrice: prodSalePrice ? Number(prodSalePrice) : null,
      stock: Number(prodStock),
      images: [prodImage],
      flowerType: prodFlowerType,
      occasion: prodOccasion,
      deliveryType: prodDeliveryType,
      categoryId: prodCategoryId,
      isBestSeller: true,
      isSameDayDelivery: prodDeliveryType === 'SAME_DAY'
    };

    try {
      if (editingProduct) {
        // Update product
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success('Product Updated', 'Catalog entry modified successfully.');
      } else {
        // Create product
        await api.post('/admin/products', payload);
        toast.success('Product Added', 'New product appended to catalog.');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchCatalog();
    } catch (err: any) {
      toast.error('Operation Failed', err.response?.data?.message || 'Could not save product.');
    }
  };

  // Open Edit Product Modal
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdSalePrice(prod.salePrice);
    setProdStock(prod.stock);
    setProdImage(prod.images?.[0] || '');
    setProdFlowerType(prod.flowerType);
    setProdOccasion(prod.occasion);
    setProdDeliveryType(prod.deliveryType);
    setProdCategoryId(prod.categoryId);
    setShowProductModal(true);
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? All reviews and cart connections will be removed.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product Deleted', 'Successfully removed from store database.');
      fetchCatalog();
    } catch (err: any) {
      toast.error('Deletion Failed', 'Could not delete product.');
    }
  };

  // Update Order Status Handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/order/${orderId}/status`, { status: newStatus });
      toast.success('Status Updated', `Order marked as ${newStatus}.`);
      fetchOrders();
    } catch (err: any) {
      toast.error('Failed to Update Status', 'Operation rejected by backend.');
    }
  };

  // Create Coupon Handler
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponExpiresAt) {
      toast.error('Validation Error', 'Please input coupon code and expiration date.');
      return;
    }

    setSubmittingCoupon(true);
    try {
      await api.post('/admin/coupons', {
        code: couponCode,
        discountType: couponType,
        discountValue: Number(couponValue),
        minOrderValue: Number(couponMinOrder),
        maxDiscount: couponMaxDiscount ? Number(couponMaxDiscount) : null,
        expiresAt: couponExpiresAt
      });
      toast.success('Coupon Generated', `Voucher ${couponCode} is now active.`);
      setCouponCode('');
      setCouponValue(10);
      setCouponMinOrder(999);
      setCouponMaxDiscount(null);
      setCouponExpiresAt('');
    } catch (err: any) {
      toast.error('Coupon Generation Failed', err.response?.data?.message || 'Error occurred.');
    } finally {
      setSubmittingCoupon(false);
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="md:col-span-1">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Core Contents */}
        <div className="md:col-span-3">

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gold-500" /> Administrative Metrics
                </h2>
                <button 
                  onClick={fetchAnalytics}
                  className="p-2 border border-forest-100 rounded-full hover:bg-cream-50 text-forest-550 cursor-pointer"
                  title="Reload Stats"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="py-12 text-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent inline-block" />
                </div>
              ) : analytics ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-forest-550 dark:text-cream-300">Total Revenue</p>
                      <p className="text-2xl font-mono font-semibold text-gold-600 mt-2">₹{analytics.metrics.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-forest-550 dark:text-cream-300">Paid Orders</p>
                      <p className="text-2xl font-semibold text-forest-950 dark:text-cream-50 mt-2">{analytics.metrics.totalOrders}</p>
                    </div>
                    <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-forest-550 dark:text-cream-300">Active Customers</p>
                      <p className="text-2xl font-semibold text-forest-950 dark:text-cream-50 mt-2">{analytics.metrics.totalCustomers}</p>
                    </div>
                    <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-forest-550 dark:text-cream-300">Catalog Products</p>
                      <p className="text-2xl font-semibold text-forest-950 dark:text-cream-50 mt-2">{analytics.metrics.totalProducts}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-sm uppercase font-bold tracking-wider text-forest-900 dark:text-cream-100 mb-4 pb-2 border-b border-cream-50">Recent Order Flows</h3>
                      <div className="space-y-4">
                        {analytics.recentOrders.length === 0 ? (
                          <p className="text-xs text-forest-550 dark:text-cream-300 font-light">No orders registered yet.</p>
                        ) : (
                          analytics.recentOrders.map((ord) => (
                            <div key={ord.id} className="flex justify-between items-start gap-4 text-xs">
                              <div>
                                <p className="font-semibold text-forest-950 dark:text-cream-50">{ord.user.name}</p>
                                <p className="text-forest-550 dark:text-cream-300 font-mono">{ord.orderNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-medium text-gold-600">₹{ord.totalAmount.toFixed(2)}</p>
                                <span className="text-[9px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">
                                  {ord.paymentStatus}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Sales by Category */}
                    <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-sm uppercase font-bold tracking-wider text-forest-900 dark:text-cream-100 mb-4 pb-2 border-b border-cream-50 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gold-500" /> Category Breakdown
                      </h3>
                      <div className="space-y-4">
                        {analytics.salesByCategory.map((cat, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-forest-950 dark:text-cream-50 font-medium">{cat.categoryName}</span>
                            <span className="font-mono font-medium text-forest-900 dark:text-cream-200">₹{cat.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* CATALOG TAB */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gold-500" /> Catalog Manager
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProdName('');
                    setProdDesc('');
                    setProdPrice(499);
                    setProdSalePrice(null);
                    setProdStock(10);
                    setProdImage('');
                    setProdFlowerType('Roses');
                    setProdOccasion('Anniversary');
                    setProdDeliveryType('HAND_DELIVERED');
                    if (categories.length > 0) setProdCategoryId(categories[0].id);
                    setShowProductModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-full text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {loadingCatalog ? (
                <div className="py-12 text-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent inline-block" />
                </div>
              ) : (
                <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-cream-50/50 dark:bg-forest-900 border-b border-cream-100 dark:border-forest-800 text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-bold">
                          <th className="p-4">Product Info</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Delivery</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-50 dark:divide-forest-850 text-xs">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-cream-50/20">
                            <td className="p-4 flex items-center gap-3">
                              {prod.images?.[0] ? (
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-cream-100"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-cream-50 rounded-lg flex items-center justify-center">💐</div>
                              )}
                              <div>
                                <p className="font-semibold text-forest-950 dark:text-cream-50">{prod.name}</p>
                                <p className="text-[10px] text-forest-450 dark:text-cream-400 mt-0.5">{prod.flowerType} • {prod.occasion}</p>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-medium text-forest-900 dark:text-cream-200">
                              ₹{prod.price.toFixed(2)}
                            </td>
                            <td className="p-4 font-mono">
                              <span className={`font-semibold ${prod.stock <= 3 ? 'text-red-500 animate-pulse' : 'text-forest-750 dark:text-cream-200'}`}>
                                {prod.stock}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] bg-cream-50 dark:bg-forest-800 px-2 py-0.5 rounded uppercase font-medium">
                                {prod.deliveryType}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => openEditModal(prod)}
                                className="p-1 text-gold-600 hover:text-gold-500 rounded hover:bg-gold-50 dark:hover:bg-gold-950/20"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1 text-red-500 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS REGISTRY TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-gold-500" /> Orders Registry
              </h2>

              {loadingOrders ? (
                <div className="py-12 text-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent inline-block" />
                </div>
              ) : (
                <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-cream-50/50 dark:bg-forest-900 border-b border-cream-100 dark:border-forest-800 text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-bold">
                          <th className="p-4">Order Detail</th>
                          <th className="p-4">Customer Info</th>
                          <th className="p-4">Grand Total</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Delivery Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-50 dark:divide-forest-850 text-xs">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-cream-50/20">
                            <td className="p-4">
                              <p className="font-semibold text-forest-950 dark:text-cream-50">{ord.orderNumber}</p>
                              <p className="text-[10px] text-forest-450 dark:text-cream-400 mt-0.5">{new Date(ord.createdAt).toLocaleString()}</p>
                            </td>
                            <td className="p-4">
                              <p className="font-medium text-forest-900 dark:text-cream-200">{ord.user.name}</p>
                              <p className="text-[10px] text-forest-550 dark:text-cream-300">{ord.user.email}</p>
                            </td>
                            <td className="p-4 font-mono font-semibold text-gold-600">
                              ₹{ord.totalAmount.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                ord.paymentStatus === 'PAID' 
                                  ? 'text-emerald-600' 
                                  : ord.paymentStatus === 'PENDING'
                                  ? 'text-amber-500'
                                  : 'text-rose-500'
                              }`}>
                                {ord.paymentStatus}
                              </span>
                            </td>
                            <td className="p-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                className="px-2 py-1 text-xs rounded border border-forest-150 dark:border-forest-800 bg-transparent text-forest-900 dark:text-cream-100 focus:outline-none cursor-pointer"
                              >
                                <option value="PLACED">PLACED</option>
                                <option value="PREPARING">PREPARING</option>
                                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-light text-forest-950 dark:text-cream-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-gold-500" /> Create Promotion Voucher
              </h2>

              <div className="bg-white dark:bg-forest-900/20 border border-cream-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm max-w-xl">
                <form onSubmit={handleCouponSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Coupon Code</label>
                      <input
                        type="text"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LUXE50"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 placeholder-forest-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Expiration Date</label>
                      <input
                        type="date"
                        required
                        value={couponExpiresAt}
                        onChange={(e) => setCouponExpiresAt(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Discount Type</label>
                      <select
                        value={couponType}
                        onChange={(e: any) => setCouponType(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Discount Value</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={couponValue}
                        onChange={(e) => setCouponValue(Number(e.target.value))}
                        placeholder="e.g. 15"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Min Order Threshold (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={couponMinOrder}
                        onChange={(e) => setCouponMinOrder(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Max Cap Discount (₹, Optional)</label>
                      <input
                        type="number"
                        min={0}
                        value={couponMaxDiscount || ''}
                        onChange={(e) => setCouponMaxDiscount(e.target.value ? Number(e.target.value) : null)}
                        placeholder="Unlimited"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingCoupon}
                    className="w-full mt-4 py-3 bg-forest-900 hover:bg-forest-850 disabled:bg-forest-900/60 text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer"
                  >
                    {submittingCoupon ? 'Generating Voucher...' : 'Generate Coupon Code'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Catalog Create/Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleProductSubmit}
            className="bg-white dark:bg-forest-900 w-full max-w-xl rounded-3xl p-6 border border-gold-500/20 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-cream-50 dark:border-forest-800 pb-3">
              <h3 className="font-serif text-xl text-forest-950 dark:text-cream-50">
                {editingProduct ? 'Modify Catalog Product' : 'Add Catalog Product'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowProductModal(false)}
                className="text-forest-400 hover:text-forest-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Royal Velvet Orchids"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Category</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Specify floral scents, packaging detail, wrapper styles..."
                  className="w-full p-3 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Sale Price (₹, Opt)</label>
                  <input
                    type="number"
                    min={0}
                    value={prodSalePrice || ''}
                    onChange={(e) => setProdSalePrice(e.target.value ? Number(e.target.value) : null)}
                    placeholder="None"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Flower Type</label>
                  <input
                    type="text"
                    required
                    value={prodFlowerType}
                    onChange={(e) => setProdFlowerType(e.target.value)}
                    placeholder="e.g. Orchids"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Occasion</label>
                  <input
                    type="text"
                    required
                    value={prodOccasion}
                    onChange={(e) => setProdOccasion(e.target.value)}
                    placeholder="e.g. Birthday"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Delivery Type</label>
                  <select
                    value={prodDeliveryType}
                    onChange={(e: any) => setProdDeliveryType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                  >
                    <option value="SAME_DAY">Same-Day Delivery</option>
                    <option value="HAND_DELIVERED">Hand Delivered</option>
                    <option value="COURIER">Standard Courier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-forest-550 dark:text-cream-300 font-medium mb-1">Product Image URL</label>
                <input
                  type="text"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-forest-100 dark:border-forest-800 bg-transparent text-forest-950 dark:text-cream-100 focus:outline-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setProdImage('https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=600')}
                    className="text-[10px] bg-cream-50 border border-forest-100 px-2 py-1 rounded"
                  >
                    Preset Bouquet 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdImage('https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600')}
                    className="text-[10px] bg-cream-50 border border-forest-100 px-2 py-1 rounded"
                  >
                    Preset Bouquet 2
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cream-50 dark:border-forest-800">
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-forest-100 rounded-xl text-xs uppercase tracking-wider text-forest-750 dark:text-cream-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white rounded-xl text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
