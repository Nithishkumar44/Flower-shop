'use client';

import React from 'react';
import { User, ClipboardList, MapPin, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'Order History', icon: ClipboardList },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
  ];

  return (
    <div className="bg-white dark:bg-forest-900 rounded-2xl border border-forest-100 dark:border-forest-800 p-6 space-y-6 font-sans">
      
      {/* Mini Profile header */}
      <div className="flex items-center gap-3 pb-4 border-b border-forest-100 dark:border-forest-800">
        <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-forest-800 flex items-center justify-center font-bold text-gold-600">
          {user?.name.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-forest-900 dark:text-cream-50 leading-tight">{user?.name}</h4>
          <p className="text-[10px] text-forest-550 dark:text-cream-200">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
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

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all mt-0 md:mt-4"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </nav>

    </div>
  );
}
