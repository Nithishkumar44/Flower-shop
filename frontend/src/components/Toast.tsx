'use client';

import React from 'react';
import { useToastStore, ToastMessage } from '../store/useToastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border bg-white dark:bg-forest-900 pointer-events-auto ${
              toast.type === 'success' ? 'border-emerald-200 dark:border-emerald-800' :
              toast.type === 'error' ? 'border-red-200 dark:border-red-800' :
              'border-gold-200 dark:border-gold-800'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-gold-600 dark:text-gold-400" />}
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-semibold font-sans text-forest-900 dark:text-cream-50 leading-tight">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="mt-1 text-xs text-forest-550 dark:text-cream-200">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-forest-400 hover:text-forest-900 dark:hover:text-cream-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
