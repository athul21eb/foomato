import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, Zap, CheckCircle2, Globe, Shield } from 'lucide-react';
import type { PaymentGateway } from '../types/checkout.types';
import { springSnappy } from '../../../lib/motion';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentGateway;
  onSelectMethod: (method: PaymentGateway) => void;
  disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <span>Payment Method</span>
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Select your preferred payment gateway
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Razorpay Option */}
        <motion.div
          whileHover={disabled ? undefined : { y: -2 }}
          whileTap={disabled ? undefined : { scale: 0.985 }}
          transition={springSnappy}
          onClick={() => !disabled && onSelectMethod('razorpay')}
          className={`relative p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            selectedMethod === 'razorpay'
              ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20 shadow-sm'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 bg-zinc-50/50 dark:bg-zinc-800/30'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>Razorpay</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Instant
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  UPI, Cards, NetBanking, Wallets
                </p>
              </div>
            </div>

            <motion.div
              animate={{
                scale: selectedMethod === 'razorpay' ? [0.8, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.25 }}
              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                selectedMethod === 'razorpay'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {selectedMethod === 'razorpay' && (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </motion.div>
          </div>

          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              GPay, PhonePe, Paytm, Cards
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">Fast Checkout</span>
          </div>
        </motion.div>

        {/* Stripe Option */}
        <motion.div
          whileHover={disabled ? undefined : { y: -2 }}
          whileTap={disabled ? undefined : { scale: 0.985 }}
          transition={springSnappy}
          onClick={() => !disabled && onSelectMethod('stripe')}
          className={`relative p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between gap-3 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            selectedMethod === 'stripe'
              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20 shadow-sm'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 bg-zinc-50/50 dark:bg-zinc-800/30'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>Stripe</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Global
                  </span>
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Credit / Debit Cards
                </p>
              </div>
            </div>

            <motion.div
              animate={{
                scale: selectedMethod === 'stripe' ? [0.8, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.25 }}
              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                selectedMethod === 'stripe'
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {selectedMethod === 'stripe' && (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </motion.div>
          </div>

          <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              Visa, Mastercard, Amex
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Encrypted</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
