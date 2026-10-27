import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  PlusCircle,
  ShoppingBag,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  Award,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
  Shield,
  FileCheck,
  MapPin,
  Zap,
} from 'lucide-react';
import { useGetMyRiderQuery } from '../../features/rider/api/rider.api';
import { RiderAvailabilityToggle } from '../../features/rider/components/rider-availability-toggle';
import { RiderProfileCard } from '../../features/rider/components/rider-profile-card';
import { RiderEditModal } from '../../features/rider/components/rider-edit-modal';
import { RiderOrdersTab } from '../../features/rider/components/rider-orders-tab';
import { RiderWalletTab } from '../../features/rider/components/rider-wallet-tab';
import { LoadingScreen } from '../../components/feedback/loading-screen';
import {
  AnimatedSidebarTab,
  AnimatedTabContent,
  AnimatedBentoStatCard,
  AnimatedNumberTicker,
  FadeInUp,
  ScaleIn,
  SlideInBottom,
  StaggerContainer,
  RevealItem,
  InteractiveCard,
} from '../../lib/animations';

export type RiderDashboardTab = 'profile' | 'orders' | 'wallet';

export const RiderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rider, isLoading, error } = useGetMyRiderQuery();
  const [activeTab, setActiveTab] = useState<RiderDashboardTab>('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <LoadingScreen
        message="Loading Rider Portal..."
        subtext="Fetching courier credentials and fleet status"
        fullScreen={false}
      />
    );
  }

  // If rider has no profile yet (404), show welcoming onboarding CTA
  const isNotFound =
    !rider ||
    (error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status: number }).status === 404);

  if (isNotFound) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SlideInBottom className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-linear-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/25">
            <Bike className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Welcome to the Foomato Rider Fleet
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
            Deliver delicious meals across your city with maximum flexibility, daily earnings, and dedicated courier support.
          </p>

          <div className="mt-8">
            <ScaleIn>
              <button
                type="button"
                onClick={() => navigate('/rider/new')}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-orange-600/30 transition-all duration-200 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Rider Profile Now</span>
              </button>
            </ScaleIn>
          </div>
        </SlideInBottom>

        {/* 3 Step Milestone Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RevealItem>
            <InteractiveCard className="h-full p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 font-bold">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                  1. Submit KYC Documents
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Provide your Aadhaar number, permanent Driving License, and a clear profile photo.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-orange-500 uppercase tracking-wider">
                Takes 2 minutes
              </div>
            </InteractiveCard>
          </RevealItem>

          <RevealItem>
            <InteractiveCard className="h-full p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 font-bold">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                  2. Choose Base Hub
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Select your primary delivery zone or detect your GPS position for localized orders.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
                Instant GPS Sync
              </div>
            </InteractiveCard>
          </RevealItem>

          <RevealItem>
            <InteractiveCard className="h-full p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                  3. Go Online & Earn
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Once verified by admin, toggle online anytime and receive nearby restaurant pickup dispatches.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                Flexible Timings
              </div>
            </InteractiveCard>
          </RevealItem>
        </StaggerContainer>
      </div>
    );
  }

  const TABS = [
    {
      id: 'profile' as const,
      label: 'Courier Profile',
      mobileLabel: 'Profile',
      subtext: 'KYC & Credentials',
      icon: Bike,
    },
    {
      id: 'orders' as const,
      label: 'Live Dispatches',
      mobileLabel: 'Orders',
      subtext: 'Active Deliveries',
      icon: ShoppingBag,
    },
    {
      id: 'wallet' as const,
      label: 'Courier Wallet',
      mobileLabel: 'Wallet',
      subtext: 'Earnings & Payouts',
      icon: Wallet,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:h-[calc(100vh-4.25rem)] md:overflow-hidden flex flex-col md:flex-row gap-6 lg:gap-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Mobile Top Header & Segmented Tabs (< md) */}
      <div className="md:hidden shrink-0 space-y-2.5">
        {/* Mobile Rider Quick Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {rider.picture ? (
              <img
                src={rider.picture}
                alt={rider.riderName || 'Rider Avatar'}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/10 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Bike className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black truncate text-zinc-900 dark:text-white">
                  {rider.riderName || 'Courier Partner'}
                </h4>
                {rider.isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    rider.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                />
                <span>{rider.isAvailable ? 'Online' : 'Offline'}</span>
                {!rider.isVerified && (
                  <span className="text-amber-500 font-semibold">• Verification Pending</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {rider.isVerified ? 'Location' : 'Edit'}
          </button>
        </div>

        {/* 3-Column Balanced Segmented Switcher */}
        <div className="p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-3 gap-1 shadow-inner">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
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
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT COLUMN: Fixed width, permanently anchored */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 space-y-4 select-none">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-3 shadow-xs space-y-1.5">
          {/* Rider Mini Identity Header */}
          <div className="p-3 mb-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            {rider.picture ? (
              <img
                src={rider.picture}
                alt={rider.riderName || 'Courier Avatar'}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black truncate text-zinc-900 dark:text-white">
                  {rider.riderName || 'Courier Partner'}
                </h4>
                {rider.isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    rider.isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                />
                <span>{rider.isAvailable ? 'Duty: Online' : 'Duty: Offline'}</span>
              </div>
            </div>
          </div>

          {/* Vertical Tabs using AnimatedSidebarTab */}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <AnimatedSidebarTab
                key={tab.id}
                isActive={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-2xl flex items-center gap-3 ${
                  isSelected ? 'text-white font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
              </AnimatedSidebarTab>
            );
          })}
        </div>

        {/* Courier Performance Summary Card on Left Sidebar */}
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-4 shadow-xs space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Courier Fleet Metrics
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Rating</span>
              <span className="font-extrabold text-amber-500 flex items-center gap-1">
                ★ 5.0
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Today's Payout</span>
              <span className="font-extrabold text-emerald-500">₹0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Verification</span>
              <span
                className={`font-bold ${
                  rider.isVerified ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {rider.isVerified ? 'Approved' : 'In Review'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: Tab views with smooth AnimatedTabContent */}
      <main className="flex-1 min-w-0 md:h-full md:overflow-y-auto custom-scrollbar px-1.5 sm:px-3 md:px-5 lg:px-6 pb-8 pt-0.5">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {activeTab === 'profile' && (
            <AnimatedTabContent activeKey="profile" className="space-y-6">
              {/* Availability Header Bar */}
              <RiderAvailabilityToggle rider={rider} />

              {/* Main Profile & Credentials Card */}
              <RiderProfileCard
                rider={rider}
                onEditClick={() => setIsEditModalOpen(true)}
              />

              {/* Quick Operational Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedBentoStatCard
                  delay={0.05}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Deliveries
                    </span>
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                      <Bike className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-white">
                    <AnimatedNumberTicker value={0} />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Starting fresh today</p>
                </AnimatedBentoStatCard>

                <AnimatedBentoStatCard
                  delay={0.1}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Customer Rating
                    </span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <AnimatedNumberTicker value={5.0} decimals={1} />
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Based on courier ratings</p>
                </AnimatedBentoStatCard>

                <AnimatedBentoStatCard
                  delay={0.15}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Acceptance Rate
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-white">
                    <AnimatedNumberTicker value={100} suffix="%" />
                  </div>
                  <p className="text-xs text-emerald-500 font-medium mt-1">Excellent tier</p>
                </AnimatedBentoStatCard>

                <AnimatedBentoStatCard
                  delay={0.2}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Safety & Compliance
                    </span>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-white">
                    {rider.isVerified ? 'Compliant' : 'In Review'}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Standard courier safety</p>
                </AnimatedBentoStatCard>
              </div>

              {/* Safety & Guidelines Info Banner */}
              <FadeInUp delay={0.25}>
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        Live Dispatch & Tracking Ready
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        When you go Online, the dispatch engine monitors active restaurant orders within your radius and alerts your phone.
                      </p>
                    </div>
                  </div>

                  {!rider.isVerified && (
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <span>Update details if needed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </FadeInUp>
            </AnimatedTabContent>
          )}

          {activeTab === 'orders' && (
            <AnimatedTabContent activeKey="orders">
              <RiderOrdersTab
                rider={rider}
                onEditClick={() => setIsEditModalOpen(true)}
              />
            </AnimatedTabContent>
          )}

          {activeTab === 'wallet' && (
            <AnimatedTabContent activeKey="wallet">
              <RiderWalletTab
                rider={rider}
                onEditClick={() => setIsEditModalOpen(true)}
              />
            </AnimatedTabContent>
          )}
        </div>
      </main>

      {/* Global Rider Edit Modal */}
      {isEditModalOpen && (
        <RiderEditModal
          rider={rider}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RiderDashboardPage;
