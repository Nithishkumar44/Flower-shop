'use client';

import React from 'react';
import { BarChart3, Package, Truck, Ticket, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { id: 'analytics', label: 'Analytics Room', icon: BarChart3 },
    { id: 'catalog', label: 'Catalog Manager', icon: Package },
    { id: 'orders', label: 'Orders Registry', icon: Truck },
    { id: 'coupons', label: 'Vouchers & Offers', icon: Ticket },
  ];

  return (
    <div className="bg-white dark:bg-forest-900 rounded-2xl border border-forest-100 dark:border-forest-800 p-6 space-y-6 font-sans">
      
      {/* Sidebar Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-full border border-red-200/20">
          Administrator Terminus
        </span>
        <h3 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50 mt-3">Luxe Blooms Control</h3>
      </div>

      {/* Tabs list */}
      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-2 md:pb-0">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'text-forest-550 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-forest-800 hover:text-forest-900 dark:hover:text-cream-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-forest-550 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-forest-800 whitespace-nowrap transition-all"
        >
          <Home className="w-4 h-4" />
          Return to Storefront
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all mt-0 md:mt-4 whitespace-nowrap"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </nav>

    </div>
  );
}
