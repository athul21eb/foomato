import {
  Heart,
  Send,
  ShieldCheck,
  Smartphone,
  Globe,
  Share2,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { useTheme } from '../../context/use-theme';
import { useAuth } from '../../context/use-auth';
import { Link } from 'react-router-dom';

/**
 * Minimal Footer for Restaurant Sellers
 */
const SellerFooter: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`border-t transition-colors duration-300 py-8 ${
        theme === 'dark'
          ? 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
          : 'bg-zinc-50 border-zinc-200 text-zinc-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand & Portal Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0">
              <img
                src="/foomato.png"
                alt="Foomato"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
                  Foomato Seller Hub
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Operations Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Kitchen management, order dispatch, and menu controls.
              </p>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="flex items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Link to="/seller" className="hover:text-orange-500 transition-colors">
              Dashboard
            </Link>
            <Link to="/seller/new" className="hover:text-orange-500 transition-colors">
              New Store
            </Link>
            <span className="hover:text-orange-500 transition-colors cursor-pointer">
              Seller Guidelines
            </span>
            <span className="hover:text-orange-500 transition-colors cursor-pointer">
              Seller Support
            </span>
          </div>

          {/* Right: Copyright */}
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center md:text-right">
            © {new Date().getFullYear()} Foomato Technologies Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * Minimal Footer for Delivery Riders
 */
const RiderFooter: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`border-t transition-colors duration-300 py-8 ${
        theme === 'dark'
          ? 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
          : 'bg-zinc-50 border-zinc-200 text-zinc-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand & Portal Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs shrink-0">
              <img
                src="/foomato.png"
                alt="Foomato"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
                  Foomato Rider Fleet
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Fleet Network Online
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Delivery partner portal, routes, and earnings.
              </p>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="flex items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">
              Safety Protocols
            </span>
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">
              Payout Policies
            </span>
            <span className="hover:text-emerald-500 transition-colors cursor-pointer">
              Rider Support
            </span>
          </div>

          {/* Right: Copyright */}
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center md:text-right">
            © {new Date().getFullYear()} Foomato Technologies Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * Standard Consumer / Customer Footer
 */
const CustomerFooter: React.FC = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`border-t transition-colors duration-300 pt-16 pb-12 ${
        theme === 'dark'
          ? 'bg-zinc-950 border-zinc-800/80 text-zinc-400'
          : 'bg-zinc-50 border-zinc-200 text-zinc-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter / Value Row */}
        <div
          className={`p-8 sm:p-10 rounded-3xl border mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 ${
            theme === 'dark'
              ? 'bg-zinc-900/50 border-zinc-800/80 shadow-2xl shadow-black/40'
              : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50'
          }`}
        >
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Foomato Weekly Digest</span>
            </div>
            <h3
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}
            >
              Get secret chef specials & instant discount codes
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Join over 80,000+ food lovers. Receive seasonal curations, new kitchen alerts, and exclusive weekend vouchers.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center w-full lg:w-auto max-w-md gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-3.5 rounded-2xl text-sm border outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-orange-500'
                  : 'bg-zinc-100 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-orange-500'
              }`}
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Join</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* 4 Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-xs">
                <img
                  src="/foomato.png"
                  alt="Foomato"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                Foomato
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Elevating local dining experiences through lightning-fast logistics and handcrafted dishes from authentic kitchens.
            </p>
            <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
              <Globe className="w-4 h-4 hover:text-orange-500 transition-colors cursor-pointer" />
              <Share2 className="w-4 h-4 hover:text-orange-500 transition-colors cursor-pointer" />
              <MessageCircle className="w-4 h-4 hover:text-orange-500 transition-colors cursor-pointer" />
              <Mail className="w-4 h-4 hover:text-orange-500 transition-colors cursor-pointer" />
            </div>
          </div>

          <div>
            <h4
              className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}
            >
              Quick Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#categories" className="hover:text-orange-500 transition-colors">
                  Top Food Categories
                </a>
              </li>
              <li>
                <a href="#restaurants" className="hover:text-orange-500 transition-colors">
                  Featured Restaurants
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-orange-500 transition-colors">
                  Live GPS Tracking
                </a>
              </li>
              <li>
                <a href="#offers" className="hover:text-orange-500 transition-colors">
                  Deals & Free Delivery
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}
            >
              Partner With Us
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/select-role" className="hover:text-orange-500 transition-colors">
                  List Your Restaurant
                </Link>
              </li>
              <li>
                <Link to="/select-role" className="hover:text-orange-500 transition-colors">
                  Become a Delivery Rider
                </Link>
              </li>
              <li>
                <span className="hover:text-orange-500 transition-colors cursor-pointer">
                  Cloud Kitchen Franchising
                </span>
              </li>
              <li>
                <span className="hover:text-orange-500 transition-colors cursor-pointer">
                  Corporate Catering
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              }`}
            >
              Trust & Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-orange-500 transition-colors cursor-pointer">
                  Help Center & FAQs
                </span>
              </li>
              <li>
                <span className="hover:text-orange-500 transition-colors cursor-pointer">
                  Food Hygiene Guarantee
                </span>
              </li>
              <li>
                <span className="hover:text-orange-500 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-orange-500 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Baseline Bar */}
        <div className="pt-8 border-t border-zinc-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for passionate food enthusiasts everywhere</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>PCI-DSS Encrypted Payments</span>
            </span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Foomato Inc.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === 'seller') {
    return <SellerFooter />;
  }

  if (isAuthenticated && user?.role === 'rider') {
    return <RiderFooter />;
  }

  return <CustomerFooter />;
};

export default Footer;
