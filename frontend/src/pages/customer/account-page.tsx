import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Compass,
  ArrowRight,
  Receipt,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/use-auth';
import { useTheme } from '../../context/use-theme';
import { useAppSelector } from '../../app/hooks';
import { LoadingScreen } from '../../components/feedback/loading-screen';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';
import { AddressManager } from '../../features/customer/components/address-manager';
import { useGetMyAddressesQuery } from '../../slices/address/addressApiSlice';

interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantImage: string;
  cuisine: string;
  date: string;
  status: 'delivered' | 'in_progress' | 'cancelled';
  items: OrderItemSummary[];
  totalAmount: number;
  deliveryAddress: string;
  estimatedDelivery?: string;
}


const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'FOO-94821',
    restaurantName: 'The Rustic Neapolitan',
    restaurantImage: '🍕',
    cuisine: 'Authentic Italian & Pizza',
    date: 'Today at 1:45 PM',
    status: 'in_progress',
    items: [
      { name: 'Truffle & Wild Mushroom Pizza', quantity: 1, price: 24.5 },
      { name: 'Wood-fired Garlic Knots', quantity: 2, price: 8.0 },
      { name: 'San Pellegrino Blood Orange', quantity: 1, price: 4.5 },
    ],
    totalAmount: 37.0,
    deliveryAddress: 'Round South, Thrissur Town',
    estimatedDelivery: '20-30 min • Rider on route',
  },
  {
    id: 'ord-102',
    orderNumber: 'FOO-88412',
    restaurantName: 'Kyoto Secret Ramen Bar',
    restaurantImage: '🍜',
    cuisine: 'Japanese Broths & Gyoza',
    date: 'Yesterday at 7:15 PM',
    status: 'delivered',
    items: [
      { name: 'Tonkotsu Black Garlic Ramen', quantity: 2, price: 34.0 },
      { name: 'Handcrafted Pan-Fried Gyoza', quantity: 1, price: 9.5 },
      { name: 'Iced Matcha Green Tea', quantity: 2, price: 8.0 },
    ],
    totalAmount: 51.5,
    deliveryAddress: 'Round South, Thrissur Town',
  },
  {
    id: 'ord-103',
    orderNumber: 'FOO-71049',
    restaurantName: 'Umami Craft Smash Burgers',
    restaurantImage: '🍔',
    cuisine: 'American Prime Burgers',
    date: 'Oct 8, 2026 at 8:30 PM',
    status: 'delivered',
    items: [
      { name: 'Double Bacon Truffle Smash Burger', quantity: 1, price: 17.5 },
      { name: 'Seasoned Sweet Potato Fries', quantity: 1, price: 6.5 },
      { name: 'Vanilla Salted Caramel Shake', quantity: 1, price: 7.0 },
    ],
    totalAmount: 31.0,
    deliveryAddress: 'Infopark Phase 2, Kakkanad',
  },
];

type AccountTab = 'orders' | 'addresses' | 'logout';

export const CustomerAccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, isLoggingOut, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const locationState = useAppSelector((state) => state.location);
  const { data: addresses = [] } = useGetMyAddressesQuery();
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'in_progress' | 'delivered'>('all');

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !isLoggingOut) {
      toast.error('Please sign in to view your account dashboard');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, isLoggingOut, navigate]);

  const handlePerformLogout = async () => {
    try {
      const logoutTask = logout();
      navigate('/login', { replace: true });
      await logoutTask;
      toast.success('Successfully logged out of your account.');
    } catch {
      toast.error('Logout encountered an issue. Redirecting...');
      navigate('/login', { replace: true });
    }
  };

  if (isLoggingOut) {
    return (
      <LoadingScreen
        message="Signing out safely..."
        subtext="Clearing your customer account session"
      />
    );
  }

  const filteredOrders = INITIAL_ORDERS.filter((order) => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  });

  return (
    <div
      className={`min-h-[calc(100vh-4.5rem)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#09090b] text-zinc-100' : 'bg-zinc-50/70 text-zinc-900'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Customer Header Banner */}
        <section
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border-zinc-800/80 shadow-black/40'
              : 'bg-gradient-to-r from-white via-orange-50/40 to-amber-50/30 border-zinc-200/90 shadow-zinc-200/50'
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-20 h-20 rounded-2xl ring-4 ring-orange-500/30 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/25">
                    {user?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {user?.name || 'Customer Profile'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-500 border border-orange-500/30 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5" />
                    {user?.role || 'Customer'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{user?.email}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Consumer</span>
                </p>
                {locationState.city && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5 flex items-center gap-1 font-medium">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Serving nearby: {locationState.city}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Summary Chips */}
            <div className="grid grid-cols-3 sm:flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              <div
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border text-center ${
                  theme === 'dark' ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-white/90 border-zinc-200 shadow-xs'
                }`}
              >
                <div className="text-base sm:text-lg font-black text-orange-500">
                  {INITIAL_ORDERS.length}
                </div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Orders
                </div>
              </div>

              <div
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border text-center ${
                  theme === 'dark' ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-white/90 border-zinc-200 shadow-xs'
                }`}
              >
                <div className="text-base sm:text-lg font-black text-amber-500">
                  {addresses.length}
                </div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Places
                </div>
              </div>

              <div
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border text-center ${
                  theme === 'dark' ? 'bg-zinc-800/60 border-zinc-700/60' : 'bg-white/90 border-zinc-200 shadow-xs'
                }`}
              >
                <div className="text-base sm:text-lg font-black text-emerald-500">
                  Gold
                </div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Tier
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1 touch-pan-x">
          <button
            id="tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[44px] ${
              activeTab === 'orders'
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 bg-orange-500/10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>My Orders</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'orders'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {INITIAL_ORDERS.length}
            </span>
          </button>

          <button
            id="tab-addresses"
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[44px] ${
              activeTab === 'addresses'
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 bg-orange-500/10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Saved Addresses</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'addresses'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {addresses.length}
            </span>
          </button>

          <button
            id="tab-logout"
            onClick={() => setActiveTab('logout')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-t-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[44px] ${
              activeTab === 'logout'
                ? 'text-rose-600 dark:text-rose-500 border-b-2 border-rose-500 bg-rose-500/10'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>

        {/* TAB CONTENT: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Sub-bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    orderFilter === 'all'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  All Orders ({INITIAL_ORDERS.length})
                </button>
                <button
                  onClick={() => setOrderFilter('in_progress')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    orderFilter === 'in_progress'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  In Progress (1)
                </button>
                <button
                  onClick={() => setOrderFilter('delivered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    orderFilter === 'delivered'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  Delivered (2)
                </button>
              </div>

              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div
                className={`text-center py-16 px-4 rounded-3xl border ${
                  theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <ShoppingBag className="w-12 h-12 mx-auto text-zinc-400 mb-3 opacity-60" />
                <h3 className="text-lg font-bold">No orders found</h3>
                <p className="text-sm opacity-60 max-w-sm mx-auto mt-1 mb-5">
                  You do not have any orders matching the selected filter.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Explore Restaurants
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-sm hover:shadow-md ${
                      theme === 'dark'
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-500/10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-2xl flex items-center justify-center shrink-0">
                          {order.restaurantImage}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{order.restaurantName}</h3>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">• {order.orderNumber}</span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{order.cuisine}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.status === 'in_progress' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Active Delivery
                          </span>
                        ) : order.status === 'delivered' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Cancelled
                          </span>
                        )}

                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {order.date}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="py-4 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Items Ordered
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              theme === 'dark'
                                ? 'bg-zinc-800/40 border-zinc-800/70'
                                : 'bg-zinc-50 border-zinc-200/70'
                            }`}
                          >
                            <span className="font-medium truncate pr-2 text-zinc-800 dark:text-zinc-200">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-bold text-orange-500 shrink-0">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Tracking Banner for In Progress Orders */}
                    {order.status === 'in_progress' && order.estimatedDelivery && (
                      <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          </span>
                          <span className="font-bold text-amber-500">
                            Estimated Arrival: {order.estimatedDelivery}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-orange-500 underline cursor-pointer">
                          Track Live Map
                        </span>
                      </div>
                    )}

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-zinc-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Delivered to: {order.deliveryAddress}</span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right sm:pr-2">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-semibold">
                            Total Paid
                          </span>
                          <span className="text-base font-extrabold text-orange-500">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast.success(`Receipt for ${order.orderNumber} downloaded.`)}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                              theme === 'dark'
                                ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                                : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                            }`}
                            title="Download Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>

                          <button
                            onClick={() => {
                              toast.success(`Items from ${order.restaurantName} added to cart!`);
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Reorder</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <AddressManager showHeader={true} />
        )}


        {/* TAB CONTENT: LOGOUT TAB */}
        {activeTab === 'logout' && (
          <div className="max-w-xl mx-auto py-8">
            <div
              className={`p-6 sm:p-8 rounded-3xl border text-center shadow-xl space-y-6 ${
                theme === 'dark'
                  ? 'bg-zinc-900/80 border-zinc-800 shadow-black/40'
                  : 'bg-white border-zinc-200 shadow-zinc-200'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
                <LogOut className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Confirm Logout</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                  You are signed in as <span className="font-bold text-orange-600 dark:text-orange-400">{user?.email}</span>. Are you sure you want to log out of your session?
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border text-left text-xs space-y-2.5 ${
                  theme === 'dark' ? 'bg-zinc-800/40 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Customer Name:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Account Role:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400 uppercase">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Cart & Session Storage:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Safe in browser</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                    theme === 'dark'
                      ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Stay Logged In
                </button>

                <button
                  id="confirm-logout-btn"
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handlePerformLogout}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-red-600 shadow-lg shadow-rose-600/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log Out Now'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default CustomerAccountPage;
