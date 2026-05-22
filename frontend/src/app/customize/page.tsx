import React from 'react';
import CustomBouquetDesigner from '../../components/CustomBouquetDesigner';

export default function CustomizePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Intro Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600">Luxe Customizer</span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-forest-900 dark:text-cream-50 mt-2">
          Design Your Own Bouquet
        </h1>
        <p className="text-xs text-forest-550 dark:text-cream-200 mt-2">
          Hand-select each stem, wrapping material, and design theme. Our master florist will arrange it with absolute care.
        </p>
      </div>

      {/* Main editor module */}
      <CustomBouquetDesigner />

    </div>
  );
}
