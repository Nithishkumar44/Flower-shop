'use client';

import React from 'react';
import { Check, ClipboardList, Flame, Truck, Award } from 'lucide-react';

interface OrderTimelineProps {
  status: 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
}

const STAGES = [
  { id: 'PLACED', label: 'Order Placed', desc: 'We have received your floral request.', icon: ClipboardList },
  { id: 'PREPARING', label: 'Preparing Bouquet', desc: 'Our florist is select-arranging your stems.', icon: Flame },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Our courier is hand-dispatching the flowers.', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', desc: 'Bespoke bouquet has successfully bloomed at destination.', icon: Award },
];

export default function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-5 rounded-2xl text-center">
        <h4 className="font-serif font-bold text-red-700 dark:text-red-400 text-lg">Order Cancelled</h4>
        <p className="text-xs text-red-650 dark:text-red-300 mt-1">This order was cancelled. Please contact customer support for details.</p>
      </div>
    );
  }

  // Get index of current status
  const currentIdx = STAGES.findIndex(stage => stage.id === status);

  return (
    <div className="py-6 font-sans">
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
        
        {/* Connector Line (Desktop) */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-forest-100 dark:bg-forest-800 -translate-y-1/2 hidden md:block z-0" />
        
        {/* Active connector bar (Desktop) */}
        {currentIdx > 0 && (
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gold-500 -translate-y-1/2 hidden md:block z-0 transition-all duration-700" 
            style={{ width: `${(currentIdx / (STAGES.length - 1)) * 100}%` }}
          />
        )}

        {/* Connector Line (Mobile) */}
        <div className="absolute top-5 bottom-5 left-5 w-0.5 bg-forest-100 dark:bg-forest-800 md:hidden z-0">
          {/* Active connector bar (Mobile) */}
          {currentIdx > 0 && (
            <div 
              className="absolute top-0 left-0 w-full bg-gold-500 transition-all duration-700" 
              style={{ height: `${(currentIdx / (STAGES.length - 1)) * 100}%` }}
            />
          )}
        </div>

        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 md:text-center flex-1 w-full md:w-auto">
              
              {/* Timeline bubble */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-md ${
                isDone 
                  ? 'bg-gold-500 border-gold-500 text-white' 
                  : isActive
                  ? 'bg-white dark:bg-forest-900 border-gold-500 text-gold-500 scale-110 ring-4 ring-gold-100 dark:ring-forest-800'
                  : 'bg-white dark:bg-forest-900 border-forest-200 dark:border-forest-800 text-forest-300'
              }`}>
                {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Texts */}
              <div className="flex-1 md:flex-initial">
                <h4 className={`text-sm font-bold leading-tight ${
                  isActive ? 'text-gold-600 dark:text-gold-400' : 'text-forest-900 dark:text-cream-50'
                }`}>
                  {stage.label}
                </h4>
                <p className="text-[10px] text-forest-550 dark:text-cream-200 mt-0.5 leading-snug">
                  {stage.desc}
                </p>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
