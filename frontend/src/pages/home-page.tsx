import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  ChevronRight,
  Store,
  Bike,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useTheme } from '../context/theme-context';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 backdrop-blur-md border border-orange-500/20 bg-orange-500/10 text-orange-500 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multi-Tenant Food Delivery Engine</span>
          </div>

          {/* Big Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
            Craving Flavor?{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
              Foomato
            </span>{' '}
            Delivers Instantly.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl max-w-2xl text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed">
            From sizzling local street food to gourmet fine dining. Connect
            customers, culinary masters, and swift riders seamlessly in real time.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  id="hero-role-btn"
                  to="/select-role"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Active Role: {user?.role ? user.role.toUpperCase() : 'Choose Role'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  id="hero-get-started-btn"
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200'
                      : 'border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800'
                  }`}
                >
                  Explore Ecosystem
                </a>
              </div>
            )}
          </div>

          {/* Logged in User Status Box */}
          {isAuthenticated && user && (
            <div
              className={`mt-12 p-6 rounded-3xl border backdrop-blur-md max-w-xl w-full flex items-center gap-4 text-left ${
                theme === 'dark'
                  ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200'
                  : 'bg-white/80 border-zinc-200 text-zinc-800 shadow-lg'
              }`}
            >
              <img
                src={user.image || 'https://via.placeholder.com/60'}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-500/40"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{user.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                    {user.role || 'No Role Assigned'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{user.email}</p>
                <p className="text-xs text-emerald-500 font-medium mt-1">
                  ✓ Authenticated via Google
                </p>
              </div>
              <Link
                to="/select-role"
                className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-colors"
                title="Change Role"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Built for the modern culinary ecosystem
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base">
            Every participant enjoys dedicated, custom-tailored capabilities designed for peak speed and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Customer */}
          <div
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Customers</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Browse hyper-local menus, customize dishes with add-ons, and track your meals with instant live GPS updates.
            </p>
            <ul className="text-xs space-y-2 text-zinc-500">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span>30-minute average delivery window</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Verified kitchen hygiene audits</span>
              </li>
            </ul>
          </div>

          {/* Feature 2: Rider */}
          <div
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delivery Riders</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Optimized turn-by-turn routing, flexible delivery batches, and transparent daily payout deposits.
            </p>
            <ul className="text-xs space-y-2 text-zinc-500">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant order dispatch notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-orange-500" />
                <span>Smart battery & route optimization</span>
              </li>
            </ul>
          </div>

          {/* Feature 3: Seller */}
          <div
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700'
                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Restaurant Sellers</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Command your digital storefront, automate kitchen tickets, and monitor revenue metrics effortlessly.
            </p>
            <ul className="text-xs space-y-2 text-zinc-500">
              <li className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Real-time dish inventory toggles</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Automated tax & commission receipts</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
