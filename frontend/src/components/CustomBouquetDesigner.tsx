'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../utils/api';
import { toast } from '../store/useToastStore';
import { Plus, Minus, CreditCard, Sparkles } from 'lucide-react';

const WRAP_STYLES = [
  { id: 'vintage-craft', name: 'Vintage Craft Paper', price: 150, image: '🟤' },
  { id: 'silk-wrap', name: 'Bespoke Soft Silk Wrap', price: 250, image: '🌸' },
  { id: 'premium-box', name: 'Royal Velvet Gift Box', price: 399, image: '📦' },
  { id: 'glass-vase', name: 'Deluxe Clear Glass Vase', price: 499, image: '🏺' },
];

const WRAP_COLORS = [
  { id: 'blush-pink', name: 'Blush Rose Pink', hex: '#FFD3D8' },
  { id: 'crimson-gold', name: 'Crimson Red & Gold', hex: '#A82B3B' },
  { id: 'vanilla-cream', name: 'Vanilla Linen Cream', hex: '#F2ECE0' },
  { id: 'emerald-botanical', name: 'Emerald Botanical Green', hex: '#1A4335' },
];

const FLOWER_SELECTIONS = [
  { id: 'rose', name: 'Ecuadorian Rose', price: 79, color: 'Red', emoji: '🌹' },
  { id: 'lily', name: 'White Oriental Lily', price: 120, color: 'White', emoji: '🌸' },
  { id: 'tulip', name: 'Dutch Spring Tulip', price: 90, color: 'Yellow', emoji: '🌷' },
  { id: 'orchid', name: 'Exotic Cymbidium Orchid', price: 150, color: 'Violet', emoji: '🌺' },
];

export default function CustomBouquetDesigner() {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Custom configuration states
  const [selectedWrap, setSelectedWrap] = useState(WRAP_STYLES[0]);
  const [selectedColor, setSelectedColor] = useState(WRAP_COLORS[0]);
  const [flowers, setFlowers] = useState<Record<string, number>>({
    rose: 6,
    lily: 2,
    tulip: 0,
    orchid: 0,
  });

  // Message card state
  const [recipient, setRecipient] = useState('');
  const [cardText, setCardText] = useState('');
  const [sender, setSender] = useState('');

  // Count helper functions
  const incrementFlower = (id: string) => {
    setFlowers(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrementFlower = (id: string) => {
    setFlowers(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  // Calculate customized subtotal
  const wrapCost = selectedWrap.price;
  const flowerCost = FLOWER_SELECTIONS.reduce((sum, fl) => {
    const qty = flowers[fl.id] || 0;
    return sum + fl.price * qty;
  }, 0);
  const totalCost = wrapCost + flowerCost;

  // Add to shopping bag
  const handleAddToBag = async () => {
    if (!isAuthenticated) {
      toast.error('Session Required', 'Please login to save your custom bouquet.');
      router.push('/auth/login?redirect=/customize');
      return;
    }

    const totalFlowersCount = Object.values(flowers).reduce((a, b) => a + b, 0);
    if (totalFlowersCount === 0) {
      toast.error('Bouquet is Empty', 'Please select at least one flower to create your bouquet.');
      return;
    }

    // Compile items for JSON
    const flowersList = FLOWER_SELECTIONS.map(fl => ({
      flowerType: fl.name,
      quantity: flowers[fl.id] || 0,
      price: fl.price,
    })).filter(fl => fl.quantity > 0);

    const customConfig = {
      wrapType: selectedWrap.name,
      wrapColor: selectedColor.name,
      flowers: flowersList,
      cardMessage: cardText.trim() ? {
        to: recipient || 'Someone Special',
        message: cardText,
        from: sender || 'Anonymous',
      } : undefined,
    };

    try {
      // Custom bouquet uses a special product ID (we will query category-free or mock id for customize)
      // We will link it to a generic "Bespoke Bouquet" product, which is represented by our categories/products.
      // Let's use a standard template product ID. In our seeder, the "Le Bouquet Parisien" or "Crimson Royalty" can act as base, 
      // but let's query the product list and fetch one or use a mock id:
      // Wait, in order to make it robust, we will look for a product in category 'mixed-bouquets' or just use 'custom-bouquet-id'
      // If we use a valid ID, let's hardcode the seeding of a dedicated 'Custom Flower Bouquet' product in seeds or map to it.
      // Let's use the ID of 'le-bouquet-parisien' or a general placeholder, since our backend controller overrides the price if customFlowerConfig is sent!
      // In the controllers/cart.controller.ts, we did exactly this: "if (customConfig) { price = addonCost; }"
      // Let's use a placeholder uuid or query products. To be safe, let's query products from backend and match or just send a dummy.
      // Let's query products when loading, or send a request. Since the cart requires a valid productId, let's get the list of products and use the first one or a fallback.
      // Let's mock a fixed ID or lookup:
      const response: any = await api.get('/products');
      const customBaseProduct = response.data.products.find((p: any) => p.slug === 'le-bouquet-parisien') || response.data.products[0];
      
      if (!customBaseProduct) {
        throw new Error("No products available to bind custom bouquet");
      }

      await addItem(customBaseProduct.id, 1, customConfig);
      toast.success('Bespoke Bouquet Created!', 'Your customized bouquet is in your shopping bag.');
      router.push('/cart');
    } catch (err: any) {
      toast.error('Failed to create bouquet', err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
      
      {/* Visual Preview Sticky Panel */}
      <div className="lg:col-span-5 bg-white dark:bg-forest-900 border border-forest-100 dark:border-forest-800 p-6 rounded-3xl flex flex-col items-center shadow-sm lg:sticky lg:top-28">
        <div className="relative w-44 h-44 rounded-full bg-white/60 dark:bg-forest-900 flex items-center justify-center text-6xl shadow-md border border-cream-200/50">
          {selectedWrap.image}
          <div className="absolute inset-0 flex items-center justify-center text-4xl mt-6">
            💐
          </div>
          <div 
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: selectedColor.hex }}
            title={selectedColor.name}
          />
        </div>

        <div className="mt-8 text-center w-full">
          <span className="text-[10px] tracking-widest uppercase font-bold text-gold-600 bg-gold-50 dark:bg-forest-800 px-3 py-1 rounded-full border border-gold-200/30">
            Interactive Design Room
          </span>
          <h3 className="font-serif font-bold text-xl text-forest-900 dark:text-cream-50 mt-3">
            Your Bespoke Arrangement
          </h3>
          <p className="text-xs text-forest-550 dark:text-cream-200 mt-1 max-w-xs mx-auto">
            {selectedWrap.name} in {selectedColor.name} themed wrap.
          </p>

          {/* Itemized bill details */}
          <div className="mt-6 border-t border-forest-200/30 pt-4 text-left space-y-1.5 text-xs text-forest-800 dark:text-cream-100 max-w-xs mx-auto">
            <div className="flex justify-between">
              <span>{selectedWrap.name}:</span>
              <span className="font-semibold">INR {selectedWrap.price}</span>
            </div>
            {FLOWER_SELECTIONS.map(fl => {
              const qty = flowers[fl.id] || 0;
              if (qty === 0) return null;
              return (
                <div key={fl.id} className="flex justify-between">
                  <span>{fl.emoji} {fl.name} (x{qty}):</span>
                  <span className="font-semibold">INR {fl.price * qty}</span>
                </div>
              );
            })}
            <div className="flex justify-between border-t border-forest-200/30 pt-2 text-sm font-bold text-forest-900 dark:text-gold-100">
              <span>Total Price:</span>
              <span>INR {totalCost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Step 1: Base wrapper style */}
        <div className="bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-forest-900 dark:text-cream-100 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gold-100 dark:bg-forest-800 text-gold-600 text-xs flex items-center justify-center font-bold">1</span>
            Select Wrapping Vessel
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WRAP_STYLES.map(wrap => (
              <button
                key={wrap.id}
                onClick={() => setSelectedWrap(wrap)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  selectedWrap.id === wrap.id
                    ? 'border-gold-500 bg-gold-50/20 text-gold-600 font-bold scale-[1.02]'
                    : 'border-forest-100 dark:border-forest-800 hover:border-forest-250 hover:bg-cream-50/30'
                }`}
              >
                <span className="text-2xl block mb-2">{wrap.image}</span>
                <span className="text-xs block text-forest-900 dark:text-cream-50 leading-tight">{wrap.name}</span>
                <span className="text-[10px] text-forest-550 dark:text-cream-200 block mt-1">+ INR {wrap.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Color Scheme */}
        <div className="bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-forest-900 dark:text-cream-100 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gold-100 dark:bg-forest-800 text-gold-600 text-xs flex items-center justify-center font-bold">2</span>
            Select Color Tone
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WRAP_COLORS.map(col => (
              <button
                key={col.id}
                onClick={() => setSelectedColor(col)}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                  selectedColor.id === col.id
                    ? 'border-gold-500 bg-gold-50/20 text-gold-600 font-bold scale-[1.02]'
                    : 'border-forest-100 dark:border-forest-800 hover:border-forest-250 hover:bg-cream-50/30'
                }`}
              >
                <div className="w-6 h-6 rounded-full border shadow-inner flex-shrink-0" style={{ backgroundColor: col.hex }} />
                <span className="text-xs text-forest-900 dark:text-cream-50 leading-tight">{col.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Choose flowers and quantities */}
        <div className="bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-forest-900 dark:text-cream-100 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gold-100 dark:bg-forest-800 text-gold-600 text-xs flex items-center justify-center font-bold">3</span>
            Add Flower Stems
          </h3>
          <div className="space-y-3.5">
            {FLOWER_SELECTIONS.map(fl => {
              const qty = flowers[fl.id] || 0;
              return (
                <div key={fl.id} className="flex items-center justify-between p-3.5 rounded-xl border border-forest-100 dark:border-forest-800 bg-cream-50/20 dark:bg-forest-950/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fl.emoji}</span>
                    <div>
                      <h4 className="text-xs font-bold text-forest-900 dark:text-cream-50">{fl.name}</h4>
                      <p className="text-[10px] text-forest-550 dark:text-cream-200">INR {fl.price} / stem • Color: {fl.color}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decrementFlower(fl.id)}
                      className="p-1.5 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-650 hover:bg-forest-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-forest-900 dark:text-cream-50 w-6 text-center">{qty}</span>
                    <button
                      onClick={() => incrementFlower(fl.id)}
                      className="p-1.5 rounded-full bg-forest-100 dark:bg-forest-800 text-emerald-600 hover:bg-forest-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: Add custom message card */}
        <div className="bg-white dark:bg-forest-900 p-6 rounded-2xl border border-forest-100 dark:border-forest-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-forest-900 dark:text-cream-100 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gold-100 dark:bg-forest-800 text-gold-600 text-xs flex items-center justify-center font-bold">4</span>
            Write Message Card (Optional)
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1">To</label>
                <input
                  type="text"
                  placeholder="Recipient name"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1">From</label>
                <input
                  type="text"
                  placeholder="Sender name / Anonymous"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-forest-550 dark:text-cream-200 mb-1">Card Message</label>
              <textarea
                placeholder="Write your heartfelt note here..."
                rows={3}
                value={cardText}
                onChange={(e) => setCardText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-forest-150 dark:border-forest-800 bg-cream-50/20 text-forest-900 dark:text-cream-50 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Purchase checkout banner */}
        <button
          onClick={handleAddToBag}
          className="w-full py-4 rounded-full bg-gold-500 hover:bg-gold-600 text-white font-serif font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-98"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          Add Custom Arrangement to Bag (INR {totalCost})
        </button>

      </div>
    </div>
  );
}
