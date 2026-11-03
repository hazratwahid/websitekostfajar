import React from 'react';
import { UserRole } from '../types';
import { Building2, Moon, Sun, UserCheck, Shield, Wrench, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isDark: boolean;
  toggleDark: () => void;
  onOpenDbModal: () => void;
  unverifiedCount: number;
  openTicketsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  role,
  setRole,
  isDark,
  toggleDark,
  onOpenDbModal,
  unverifiedCount,
  openTicketsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                SiKost<span className="text-emerald-600 dark:text-emerald-400">Pro</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Adyatma Residence BSD
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monitoring Center
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'rooms'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Denah Kamar
            </button>
            <button
              onClick={() => setActiveTab('tenants')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'tenants'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Data Penghuni
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors relative ${
                activeTab === 'billing'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tagihan & Kas
              {unverifiedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-mono">
                  {unverifiedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors relative ${
                activeTab === 'tickets'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tiket Keluhan
              {openTicketsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-mono">
                  {openTicketsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('control')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === 'control'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Meteran & Kunci
            </button>
          </nav>

          {/* Zone 3: Actions & Role Persona Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Persona Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setRole('owner')}
                title="Super Admin / Owner"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  role === 'owner'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Owner</span>
              </button>
              <button
                onClick={() => setRole('staff')}
                title="Penjaga / Caretaker"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  role === 'staff'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Penjaga</span>
              </button>
              <button
                onClick={() => setRole('tenant')}
                title="Portal Penghuni"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  role === 'tenant'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Penghuni</span>
              </button>
            </div>

            {/* DB Schema View Button */}
            <button
              onClick={onOpenDbModal}
              title="Lihat Skema Database (Prisma/SQL)"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
            >
              Schema DB
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              aria-label="Toggle Theme"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monitoring
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === 'rooms' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Kamar
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === 'tenants' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Penghuni
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === 'billing' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tagihan ({unverifiedCount})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === 'tickets' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tiket ({openTicketsCount})
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded ${
              activeTab === 'control' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Meteran & PIN
          </button>
        </div>
      </div>
    </header>
  );
};
