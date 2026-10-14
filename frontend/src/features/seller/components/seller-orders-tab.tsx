import React, { useState } from 'react';
import type { Seller } from '../types/seller.types';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  MapPin,
  CookingPot,
  Bike,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
}

const INITIAL_ORDERS: SellerOrder[] = [
  {
    id: 'o1',
    orderNumber: '#ORD-8492',
    customerName: 'Rahul Verma',
    customerPhone: '+91 98450 12345',
    deliveryAddress: 'Flat 402, Skyline Heights, Marine Drive, Kochi',
    items: [
      { name: 'Butter Chicken Masala', quantity: 2, price: 320 },
      { name: 'Garlic Butter Naan', quantity: 4, price: 65, notes: 'Extra crispy' },
      { name: 'Fresh Mango Lassi', quantity: 2, price: 110 },
    ],
    totalAmount: 1120,
    paymentMethod: 'Paid via UPI',
    status: 'pending',
    createdAt: '3 mins ago',
  },
  {
    id: 'o2',
    orderNumber: '#ORD-8488',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 97412 88921',
    deliveryAddress: 'Villa 12, Palm Meadows, Kakkanad, Kochi',
    items: [
      { name: 'Paneer Tikka Platter', quantity: 1, price: 260 },
      { name: 'Hyderabadi Dum Biryani', quantity: 1, price: 340, notes: 'Mild spicy' },
    ],
    totalAmount: 600,
    paymentMethod: 'Paid via Cards',
    status: 'preparing',
    createdAt: '12 mins ago',
  },
  {
    id: 'o3',
    orderNumber: '#ORD-8481',
    customerName: 'Karthik Menon',
    customerPhone: '+91 99823 44102',
    deliveryAddress: 'Door 24, Panampilly Nagar, Kochi',
    items: [
      { name: 'Hyderabadi Dum Biryani', quantity: 2, price: 340 },
      { name: 'Gulab Jamun with Rabri', quantity: 2, price: 140 },
    ],
    totalAmount: 960,
    paymentMethod: 'Paid via NetBanking',
    status: 'ready',
    createdAt: '25 mins ago',
  },
  {
    id: 'o4',
    orderNumber: '#ORD-8475',
    customerName: 'Pooja Nair',
    customerPhone: '+91 94471 55601',
    deliveryAddress: 'Apt 3B, Silver Mist, Edappally, Kochi',
    items: [
      { name: 'Butter Chicken Masala', quantity: 1, price: 320 },
      { name: 'Garlic Butter Naan', quantity: 2, price: 65 },
    ],
    totalAmount: 450,
    paymentMethod: 'Cash on Delivery',
    status: 'delivered',
    createdAt: '1 hour ago',
  },
];

interface SellerOrdersTabProps {
  seller: Seller;
}

export const SellerOrdersTab: React.FC<SellerOrdersTabProps> = ({ seller }) => {
  const [orders, setOrders] = useState<SellerOrder[]>(INITIAL_ORDERS);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ORDERS_PER_PAGE = 3;

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    );

    const labels: Record<OrderStatus, string> = {
      pending: 'Order marked as Pending',
      preparing: 'Order accepted! Now preparing in kitchen',
      ready: 'Order is ready for rider pickup!',
      delivered: 'Order fulfilled and delivered!',
    };
    toast.success(labels[nextStatus]);
  };

  const filteredOrders = orders.filter((o) => {
    if (activeStatus === 'all') return true;
    return o.status === activeStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE,
  );

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Live Orders
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 animate-pulse">
                {pendingCount} Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Accept incoming customer tickets and coordinate kitchen preparation for {seller.name}
          </p>
        </div>

        {/* Live sync pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Kitchen Live Sync Active</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'pending', label: 'Incoming', count: pendingCount, highlight: pendingCount > 0 },
          { id: 'preparing', label: 'In Kitchen', count: preparingCount },
          { id: 'ready', label: 'Ready for Pickup', count: readyCount },
          { id: 'delivered', label: 'Completed', count: deliveredCount },
        ].map((tab) => {
          const isSelected = activeStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveStatus(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-zinc-900 font-extrabold'
                    : tab.highlight
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isPreparing = order.status === 'preparing';
            const isReady = order.status === 'ready';
            const isDelivered = order.status === 'delivered';

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-black text-sm shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-zinc-400">• {order.createdAt}</span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        Customer: {order.customerName} ({order.customerPhone})
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Incoming Request</span>
                      </span>
                    )}
                    {isPreparing && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        <CookingPot className="w-3.5 h-3.5" />
                        <span>Cooking in Kitchen</span>
                      </span>
                    )}
                    {isReady && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Ready for Rider</span>
                      </span>
                    )}
                    {isDelivered && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Fulfilled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-2 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Ordered Dishes
                  </span>
                  <div className="space-y-1.5">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-zinc-100 dark:border-zinc-800/50 last:border-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-500 font-bold text-xs flex items-center justify-center shrink-0">
                            {it.quantity}x
                          </span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {it.name}
                          </span>
                          {it.notes && (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                              ({it.notes})
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          ₹{(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address & Payment Summary */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-lg">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{order.deliveryAddress}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {order.paymentMethod}
                    </span>
                    <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Workflow */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        Accept & Start Cooking
                      </button>
                    </>
                  )}

                  {isPreparing && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      Mark as Ready for Pickup
                    </button>
                  )}

                  {isReady && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Handover to Rider & Complete
                    </button>
                  )}

                  {isDelivered && (
                    <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Order Delivered</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Orders Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {(safePage - 1) * ORDERS_PER_PAGE + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {Math.min(safePage * ORDERS_PER_PAGE, filteredOrders.length)}
                </strong>{' '}
                of{' '}
                <strong className="text-zinc-900 dark:text-white">
                  {filteredOrders.length}
                </strong>{' '}
                orders
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => handlePageChange(safePage - 1)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      pageNum === safePage
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => handlePageChange(safePage + 1)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No orders found under "{activeStatus}"
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Orders placed by customers will stream directly into your live kitchen queue.
          </p>
        </div>
      )}
    </div>
  );
};
