import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMySellerQuery } from "../../features/seller/api/seller.api";
import { SellerProfileView } from "../../features/seller/components/seller-profile-view";
import { SellerEditModal } from "../../features/seller/components/seller-edit-modal";
import { SellerMenuTab } from "../../features/seller/components/seller-menu-tab";
import { SellerOrdersTab } from "../../features/seller/components/seller-orders-tab";
import { useSellerSocket } from "../../features/seller/hooks/use-seller-socket";
import {
  Store,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  UtensilsCrossed,
  ShieldCheck,
} from "lucide-react";

export type SellerDashboardTab = 'profile' | 'menu' | 'orders';

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: seller, isLoading, isError, error } = useGetMySellerQuery();
  const [activeTab, setActiveTab] = useState<SellerDashboardTab>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Initialize Realtime WebSocket & Audio Chimes at dashboard level so alerts are never missed
  const socketProps = useSellerSocket({
    sellerId: seller?.id,
  });

  // Check if seller profile is not created (404 status from backend)
  const isNotFound =
    isError && error != null && "status" in error && error.status === 404;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-72 rounded-3xl bg-zinc-200/60 dark:bg-zinc-800/60" />
        <div className="h-28 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-32 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50" />
          <div className="h-32 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50" />
          <div className="h-32 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50" />
        </div>
      </div>
    );
  }

  // If seller profile is not found, prompt to create one
  if (isNotFound || !seller) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-6 shadow-md shadow-orange-500/15">
            <Store className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Store Profile Pending</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            No Restaurant Profile Found
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-2 mb-8">
            You're registered as a seller on Foomato, but you haven't set up
            your restaurant or kitchen profile yet. Create it now to start
            selling.
          </p>

          <button
            onClick={() => navigate("/seller/new")}
            type="button"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-linear-to-r from-orange-500 via-amber-500 to-red-500 text-white font-bold text-base shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Restaurant Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    {
      id: 'profile' as const,
      label: 'Store Profile',
      mobileLabel: 'Profile',
      subtext: 'Overview & Details',
      icon: Store,
    },
    {
      id: 'menu' as const,
      label: 'Menu Items',
      mobileLabel: 'Menu',
      subtext: 'Dishes & Catalog',
      icon: UtensilsCrossed,
    },
    {
      id: 'orders' as const,
      label: 'Live Orders',
      mobileLabel: 'Orders',
      subtext: 'Incoming & Fulfilled',
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:h-[calc(100vh-4.25rem)] md:overflow-hidden flex flex-col md:flex-row gap-6 lg:gap-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Mobile Top Header & Segmented Tabs (< md) */}
      <div className="md:hidden shrink-0 space-y-2.5">
        {/* Mobile Restaurant Quick Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={seller.image}
              alt={seller.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/10 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black truncate text-zinc-900 dark:text-white">
                  {seller.name}
                </h4>
                {seller.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    seller.isOpen ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                />
                <span>{seller.isOpen ? 'Open for Orders' : 'Store Closed'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* 3-Column Balanced Segmented Switcher */}
        <div className="p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-3 gap-1 shadow-inner">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            const isOrders = tab.id === 'orders';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none relative ${
                  isSelected
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-4 h-4 shrink-0" />
                  {isOrders && socketProps.isConnected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <span className="truncate">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT COLUMN: Fixed width, permanently anchored */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 space-y-4 select-none">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-3 shadow-xs space-y-1.5">
          {/* Restaurant Mini Identity Header */}
          <div className="p-3 mb-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <img
              src={seller.image}
              alt={seller.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black truncate text-zinc-900 dark:text-white">
                  {seller.name}
                </h4>
                {seller.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    seller.isOpen ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                />
                <span>{seller.isOpen ? 'Store Open' : 'Store Closed'}</span>
              </div>
            </div>
          </div>

          {/* Vertical Tabs */}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            const isOrders = tab.id === 'orders';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer group ${
                  isSelected
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors relative ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-orange-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {isOrders && socketProps.isConnected && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs block leading-tight truncate">
                    {tab.label}
                  </span>
                  <span
                    className={`text-[10px] block leading-tight truncate ${
                      isSelected ? 'text-white/80' : 'text-zinc-400'
                    }`}
                  >
                    {tab.subtext}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Stats Summary Card on Left Sidebar */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-4 shadow-xs space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Kitchen Performance
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Rating</span>
              <span className="font-extrabold text-amber-500 flex items-center gap-1">
                ★ 4.8
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Today's Revenue</span>
              <span className="font-extrabold text-emerald-500">₹0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Avg Prep</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">20 mins</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: Centered with stable scroll gutters & symmetric padding */}
      <main className="flex-1 min-w-0 md:h-full md:overflow-y-auto custom-scrollbar px-1.5 sm:px-3 md:px-5 lg:px-6 pb-8 pt-0.5">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Reusable Seller Profile Component */}
              <SellerProfileView
                seller={seller}
                mode="owner"
                onEditClick={() => setIsEditModalOpen(true)}
              />

              {/* Seller Quick Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Active Orders */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Active Orders
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                      0
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      Awaiting preparation
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                {/* Daily Revenue */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Today's Sales
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                      ₹0.00
                    </h3>
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Ready for orders</span>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>

                {/* Avg Prep Time */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Avg. Prep Time
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                      20 mins
                    </h3>
                    <span className="text-[11px] text-zinc-400">Standard kitchen</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="animate-in fade-in duration-200">
              <SellerMenuTab seller={seller} />
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-200">
              <SellerOrdersTab seller={seller} socketProps={socketProps} />
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <SellerEditModal
          seller={seller}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};
