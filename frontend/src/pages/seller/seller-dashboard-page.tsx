import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMySellerQuery } from "../../features/seller/api/seller.api";
import { SellerProfileView } from "../../features/seller/components/seller-profile-view";
import { SellerEditModal } from "../../features/seller/components/seller-edit-modal";
import {
  Store,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export const SellerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: seller, isLoading, isError, error } = useGetMySellerQuery();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if seller profile is not created (404 status from backend)
  const isNotFound =
    isError && error != null && "status" in error && error.status === 404;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
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
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white font-bold text-base shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Restaurant Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
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
