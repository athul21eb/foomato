import React from 'react';
import {
  UtensilsCrossed,
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

export const Footer: React.FC = () => {
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
                  : 'bg-zinc-100/80 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-orange-500'
              }`}
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 shrink-0"
            >
              <span>Subscribe</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Multi-column Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Foomato
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              The modern high-concurrency food delivery platform connecting foodies, master chefs, and independent couriers across cities.
            </p>

            {/* Platform status indicator */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Delivery Dispatch Systems Operational</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-3 text-zinc-400">
              <a
                href="#social"
                className="p-2.5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                title="Global Network"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="p-2.5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                title="Community"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="p-2.5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="p-2.5 rounded-xl hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4
              className={`text-sm font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'
              }`}
            >
              Explore Food
            </h4>
            <ul className="text-sm space-y-2.5">
              <li>
                <a href="#categories" className="hover:text-orange-500 transition-colors">
                  Popular Cuisines
                </a>
              </li>
              <li>
                <a href="#restaurants" className="hover:text-orange-500 transition-colors">
                  Top Rated Kitchens
                </a>
              </li>
              <li>
                <a href="#offers" className="hover:text-orange-500 transition-colors">
                  Exclusive Deals
                </a>
              </li>
              <li>
                <a href="#healthy" className="hover:text-orange-500 transition-colors">
                  Organic & Healthy Bowls
                </a>
              </li>
              <li>
                <a href="#late-night" className="hover:text-orange-500 transition-colors">
                  Late Night Express
                </a>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div className="flex flex-col gap-3">
            <h4
              className={`text-sm font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'
              }`}
            >
              For Partners
            </h4>
            <ul className="text-sm space-y-2.5">
              <li>
                <a href="#partner-kitchen" className="hover:text-orange-500 transition-colors">
                  Partner with Us
                </a>
              </li>
              <li>
                <a href="#riders" className="hover:text-orange-500 transition-colors">
                  Drive with Foomato
                </a>
              </li>
              <li>
                <a href="#merchant" className="hover:text-orange-500 transition-colors">
                  Merchant Portal
                </a>
              </li>
              <li>
                <a href="#cloud-kitchens" className="hover:text-orange-500 transition-colors">
                  Cloud Kitchen Facilities
                </a>
              </li>
              <li>
                <a href="#fleet" className="hover:text-orange-500 transition-colors">
                  Fleet Management API
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4
              className={`text-sm font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'
              }`}
            >
              Company
            </h4>
            <ul className="text-sm space-y-2.5">
              <li>
                <a href="#about" className="hover:text-orange-500 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-orange-500 transition-colors flex items-center gap-1.5">
                  <span>Careers</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-500">
                    We're Hiring
                  </span>
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-orange-500 transition-colors">
                  Safety & Hygiene
                </a>
              </li>
              <li>
                <a href="#press" className="hover:text-orange-500 transition-colors">
                  Press Releases
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-orange-500 transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-500/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
            <span>© {new Date().getFullYear()} Foomato Technologies, Inc.</span>
            <span>•</span>
            <a href="#privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#terms" className="hover:text-orange-500 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#cookies" className="hover:text-orange-500 transition-colors">
              Cookie Settings
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit Encrypted Payments & Safe Delivery Guarantee</span>
          </div>

          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for hungry souls</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
