import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Edit3 } from 'lucide-react';
import type { CartItem } from '../../../slices/cart/cartSlice';
import { formatCurrency } from '../../../lib/utils';

interface CheckoutItemsPreviewProps {
  items: CartItem[];
  sellerName: string | null;
  sellerId: string | null;
}

export const CheckoutItemsPreview: React.FC<CheckoutItemsPreviewProps> = ({
  items,
  sellerName,
  sellerId,
}) => {
  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
              {sellerName || 'Your Order Items'}
            </h3>
            {sellerId && (
              <p className="text-[11px] text-zinc-400">
                {items.length} {items.length === 1 ? 'item' : 'items'} in order
              </p>
            )}
          </div>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Cart</span>
        </Link>
      </div>

      <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {items.map((item) => (
          <div
            key={item.id}
            className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full border ${
                      item.isVeg
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-rose-500 bg-rose-500/20'
                    }`}
                  />
                  <h4 className="font-bold text-zinc-900 dark:text-white truncate">
                    {item.name}
                  </h4>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-black text-zinc-900 dark:text-white">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
