'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import { api } from '../../utils/api';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>({ totalPages: 1, currentPage: 1 });
  
  // Active Filter Inputs
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [flowerType, setFlowerType] = useState(searchParams.get('flowerType') || '');
  const [occasion, setOccasion] = useState(searchParams.get('occasion') || '');
  const [deliveryType, setDeliveryType] = useState(searchParams.get('deliveryType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  // Sync state if URL changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setFlowerType(searchParams.get('flowerType') || '');
    setOccasion(searchParams.get('occasion') || '');
    setDeliveryType(searchParams.get('deliveryType') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sortBy') || 'createdAt');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  // Load products based on queries
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category) queryParams.append('category', category);
        if (flowerType) queryParams.append('flowerType', flowerType);
        if (occasion) queryParams.append('occasion', occasion);
        if (deliveryType) queryParams.append('deliveryType', deliveryType);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (sortBy) queryParams.append('sortBy', sortBy);
        queryParams.append('page', String(page));
        queryParams.append('limit', '9');

        const [prodRes, wishRes]: any = await Promise.all([
          api.get(`/products?${queryParams.toString()}`),
          api.get('/wishlist').catch(() => ({ data: { wishlist: [] } }))
        ]);

        setProducts(prodRes.data.products);
        setMetadata(prodRes.metadata);
        setWishlistIds((wishRes.data.wishlist || []).map((w: any) => w.productId));
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [search, category, flowerType, occasion, deliveryType, minPrice, maxPrice, sortBy, page]);

  const refreshWishlist = async () => {
    try {
      const wishRes: any = await api.get('/wishlist');
      setWishlistIds((wishRes.data.wishlist || []).map((w: any) => w.productId));
    } catch (err) {
      console.log(err);
    }
  };

  // Push updates to URL
  const updateUrlParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // reset page on filter change
    router.push(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setFlowerType('');
    setOccasion('');
    setDeliveryType('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setPage(1);
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Title Header */}
      <div className="mb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600">Luxe Blooms Catalogue</span>
        <h1 className="font-serif font-bold text-3xl text-forest-900 dark:text-cream-50 mt-1">
          Explore Our Floral Collection
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Filter Form Panel */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 p-6 rounded-2xl shadow-sm sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-forest-100 dark:border-forest-850">
            <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-500" />
              Filter Arrangements
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold tracking-wider text-forest-550 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Search bar inside filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Roses, Crimson..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateUrlParams('search', e.target.value);
                }}
                className="w-full px-3.5 py-2 pr-10 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none focus:border-gold-500"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-forest-400" />
            </div>
          </div>

          {/* Flower Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5">Flower Variety</label>
            <select
              value={flowerType}
              onChange={(e) => {
                setFlowerType(e.target.value);
                updateUrlParams('flowerType', e.target.value);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-900 dark:text-cream-50 focus:outline-none"
            >
              <option value="">All Varieties</option>
              <option value="Rose">Roses</option>
              <option value="Lily">Lilies</option>
              <option value="Tulip">Tulips</option>
              <option value="Orchid">Orchids</option>
              <option value="Mixed">Mixed Bouquets</option>
            </select>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5">Occasion</label>
            <select
              value={occasion}
              onChange={(e) => {
                setOccasion(e.target.value);
                updateUrlParams('occasion', e.target.value);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-900 dark:text-cream-50 focus:outline-none"
            >
              <option value="">All Occasions</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Birthday">Birthday</option>
              <option value="Sympathy">Sympathy</option>
              <option value="Congratulations">Congratulations</option>
              <option value="Love">Love & Romance</option>
              <option value="Business">Corporate</option>
            </select>
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5">Delivery Option</label>
            <select
              value={deliveryType}
              onChange={(e) => {
                setDeliveryType(e.target.value);
                updateUrlParams('deliveryType', e.target.value);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-900 dark:text-cream-50 focus:outline-none"
            >
              <option value="">Any Delivery</option>
              <option value="SAME_DAY">Same-Day Courier</option>
              <option value="HAND_DELIVERED">Bespoke Hand-Delivered</option>
              <option value="COURIER">Standard Courier</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1.5">Price Range (INR)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateUrlParams('minPrice', e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateUrlParams('maxPrice', e.target.value);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Sorting & Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting panel */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 px-6 py-4 rounded-2xl shadow-sm">
            <span className="text-xs text-forest-550 dark:text-cream-200">
              Showing <span className="font-bold text-forest-900 dark:text-cream-50">{products.length}</span> arrangements
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gold-500" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateUrlParams('sortBy', e.target.value);
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-forest-150 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-900 dark:text-cream-50 focus:outline-none cursor-pointer"
              >
                <option value="createdAt">New Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Product grid container */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="animate-pulse flex flex-col space-y-4">
                  <div className="aspect-[4/5] bg-forest-100 dark:bg-forest-900 rounded-2xl w-full" />
                  <div className="h-4 bg-forest-100 dark:bg-forest-900 rounded w-2/3" />
                  <div className="h-4 bg-forest-100 dark:bg-forest-900 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 rounded-3xl p-16 text-center max-w-lg mx-auto">
              <span className="text-4xl block mb-4">🍂</span>
              <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50">No Arrangements Found</h3>
              <p className="text-xs text-forest-550 dark:text-cream-200 mt-2 max-w-xs mx-auto">
                We could not find any flowers matching your active filters. Try broadening your selection parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    inWishlist={wishlistIds.includes(product.id)}
                    onWishlistToggle={refreshWishlist}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {metadata.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => {
                      setPage(page - 1);
                      updateUrlParams('page', String(page - 1));
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-full border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-900 dark:text-cream-50 hover:bg-cream-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-forest-550 dark:text-cream-200">
                    Page <span className="font-bold text-forest-900 dark:text-cream-50">{metadata.currentPage}</span> of {metadata.totalPages}
                  </span>
                  <button
                    disabled={page >= metadata.totalPages}
                    onClick={() => {
                      setPage(page + 1);
                      updateUrlParams('page', String(page + 1));
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-full border border-forest-100 dark:border-forest-800 bg-white dark:bg-forest-900 text-forest-900 dark:text-cream-50 hover:bg-cream-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500 mx-auto" />
        <p className="mt-4 text-xs text-forest-550">Loading floral collection...</p>
      </div>
    }>
      <ProductsCatalogContent />
    </Suspense>
  );
}
