import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Store,
  Bike,
  Heart,
  Search,
  MapPin,
  Star,
  Award,
  Flame,
  CheckCircle,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Loader2,
  Navigation,
} from "lucide-react";
import { useAuth } from "../context/use-auth";
import { useTheme } from "../context/use-theme";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchCurrentLocation } from "../slices/location/locationSlice";
import { toast } from "sonner";
import { LocationModal } from "../components/ui/location-modal";
import { LoadingScreen } from "../components/feedback/loading-screen";

interface CategoryItem {
  id: string;
  name: string;
  emoji: string;
  places: string;
  tag: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "1",
    name: "Artisan Pizza",
    emoji: "🍕",
    places: "38 places",
    tag: "Trending",
  },
  {
    id: "2",
    name: "Gourmet Burgers",
    emoji: "🍔",
    places: "44 places",
    tag: "Fast",
  },
  {
    id: "3",
    name: "Tokyo Sushi & Bowls",
    emoji: "🍣",
    places: "21 places",
    tag: "Premium",
  },
  {
    id: "4",
    name: "Spicy Dumplings & Wok",
    emoji: "🥟",
    places: "29 places",
    tag: "Popular",
  },
  {
    id: "5",
    name: "Indian Tandoor & Curries",
    emoji: "🍛",
    places: "32 places",
    tag: "Chef Choice",
  },
  {
    id: "6",
    name: "Crispy Taco Fiesta",
    emoji: "🌮",
    places: "19 places",
    tag: "Offers",
  },
  {
    id: "7",
    name: "Healthy Greens & Acai",
    emoji: "🥗",
    places: "16 places",
    tag: "Clean Eat",
  },
  {
    id: "8",
    name: "Pastries & Desserts",
    emoji: "🍰",
    places: "25 places",
    tag: "Sweet",
  },
];

interface RestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: string;
  deliveryTime: string;
  minOrder: string;
  offer: string;
  imageBg: string;
  tags: string[];
}

const FEATURED_RESTAURANTS: RestaurantItem[] = [
  {
    id: "r1",
    name: "The Rustic Neapolitan",
    cuisine: "Authentic Italian • Wood-fired Pizza",
    rating: 4.9,
    reviews: "1.4k+",
    deliveryTime: "20-30 min",
    minOrder: "$15 min",
    offer: "20% OFF ABOVE $30",
    imageBg: "from-amber-600/30 to-red-600/40",
    tags: ["Pizza", "Italian", "Vegetarian"],
  },
  {
    id: "r2",
    name: "Umami Craft Smash Burgers",
    cuisine: "American Prime • Loaded Fries",
    rating: 4.8,
    reviews: "980+",
    deliveryTime: "15-25 min",
    minOrder: "$12 min",
    offer: "FREE DELIVERY",
    imageBg: "from-orange-600/30 to-amber-700/40",
    tags: ["Burgers", "Late Night", "Fast"],
  },
  {
    id: "r3",
    name: "Kyoto Secret Ramen Bar",
    cuisine: "Japanese • Tonkotsu & Gyoza",
    rating: 4.9,
    reviews: "2.1k+",
    deliveryTime: "25-35 min",
    minOrder: "$20 min",
    offer: "COMPLIMENTARY GYOZA",
    imageBg: "from-rose-600/30 to-red-800/40",
    tags: ["Ramen", "Japanese", "Hot Broth"],
  },
  {
    id: "r4",
    name: "Botanica Superfood Bowls",
    cuisine: "Plant-Based • Cold Pressed Juices",
    rating: 4.7,
    reviews: "640+",
    deliveryTime: "15-20 min",
    minOrder: "$10 min",
    offer: "HEALTHY WEEKDAY 15%",
    imageBg: "from-emerald-600/30 to-teal-800/40",
    tags: ["Organic", "Vegan", "Bowls"],
  },
];

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const locationState = useAppSelector((state) => state.location);
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // If a seller or rider visits the consumer home page, smoothly redirect to their dedicated dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role) {
      if (user.role === "seller") {
        navigate("/seller", { replace: true });
      } else if (user.role === "rider") {
        navigate("/rider", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user?.role, navigate]);

  // Auto-fetch location if not loaded yet
  useEffect(() => {
    if (locationState.status === "idle") {
      dispatch(fetchCurrentLocation());
    }
  }, [dispatch, locationState.status]);

  const handleOpenLocationPopup = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsLocationModalOpen(true);
    if (
      locationState.status === "idle" ||
      locationState.status === "failed" ||
      locationState.status === "denied"
    ) {
      dispatch(fetchCurrentLocation());
    }
  };

  const filterChips = [
    "All",
    "Fast Delivery (<25m)",
    "Top Rated (4.8+)",
    "Offers & Deals",
    "Pure Veg",
  ];

  if (
    !isLoading &&
    isAuthenticated &&
    (user?.role === "seller" || user?.role === "rider")
  ) {
    return (
      <LoadingScreen
        fullScreen={false}
        message={`Redirecting to ${user.role === "seller" ? "Seller Hub" : "Rider Hub"}...`}
        subtext="Taking you to your dedicated management workspace"
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 backdrop-blur-md border border-orange-500/20 bg-orange-500/10 text-orange-500 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Multi-Tenant Food Delivery Engine</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] mb-6">
            Craving Flavor?{" "}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
              Foomato
            </span>{" "}
            Delivers Instantly.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl max-w-2xl text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            From sizzling local street eats to Michelin-standard bistros.
            Connect diners, artisan kitchens, and swift couriers in real time.
          </p>

          {/* Interactive Search & Location Box */}
          <div
            className={`w-full max-w-2xl p-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all mb-8 flex flex-col sm:flex-row items-center gap-2 ${
              theme === "dark" ?
                "bg-zinc-900/80 border-zinc-800 shadow-black/50"
              : "bg-white/95 border-zinc-200 shadow-zinc-300/40"
            }`}
          >
            {/* Interactive Browser Geolocation Pill */}
            <button
              type="button"
              id="home-location-btn"
              onClick={handleOpenLocationPopup}
              title={
                locationState.formattedAddress ?
                  `Active Location: ${locationState.formattedAddress} (Click to view on popup)`
                : "Click to detect browser GPS location"
              }
              className="flex items-center gap-2.5 px-3 py-2 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-zinc-500/20 rounded-xl hover:bg-orange-500/10 transition-colors text-left group cursor-pointer shrink-0 max-w-full sm:max-w-[210px]"
            >
              {locationState.status === "loading" ?
                <Loader2 className="w-4 h-4 text-orange-500 animate-spin shrink-0" />
              : <MapPin className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform shrink-0" />
              }
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 flex items-center gap-1">
                  <span>Deliver to</span>
                  {locationState.status === "succeeded" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  )}
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {locationState.status === "loading" ?
                    "Detecting GPS..."
                  : locationState.city ||
                    locationState.address ||
                    "Detect Location"
                  }
                </span>
              </div>
              <Navigation className="w-3 h-3 text-zinc-400 group-hover:text-orange-500 transition-colors shrink-0 ml-auto hidden sm:inline-block" />
            </button>

            <div className="flex items-center gap-2 px-3 py-2 flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, ramen, restaurants, or dishes..."
                className="w-full bg-transparent text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 font-medium"
              />
            </div>

            <a
              href="#restaurants"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
            {isAuthenticated ?
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#restaurants"
                  className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Order Food Now</span>
                </a>
                <a
                  href="#categories"
                  className={`px-8 py-3.5 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 ${
                    theme === "dark" ?
                      "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                    : "border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800"
                  }`}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Browse Cuisines</span>
                </a>
              </div>
            : <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  id="hero-get-started-btn"
                  to="/login"
                  className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In with Google</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className={`px-8 py-3.5 rounded-2xl font-bold text-sm border transition-all flex items-center justify-center gap-2 ${
                    theme === "dark" ?
                      "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
                    : "border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800"
                  }`}
                >
                  Explore Ecosystem
                </a>
              </div>
            }
          </div>

          {/* Logged in User Status Box (informational only - NO role change button) */}
          {isAuthenticated && user && (
            <div
              className={`mt-10 p-5 rounded-3xl border backdrop-blur-md max-w-xl w-full flex items-center gap-4 text-left transition-all ${
                theme === "dark" ?
                  "bg-zinc-900/70 border-zinc-800 text-zinc-200 shadow-black/40"
                : "bg-white/90 border-zinc-200 text-zinc-800 shadow-xl shadow-zinc-200/50"
              }`}
            >
              <img
                src={user.image || "https://via.placeholder.com/60"}
                alt={user.name}
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-orange-500/40"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base leading-tight">
                    {user.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/20">
                    {user.role || "Member"}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
                <p className="text-xs text-emerald-500 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Authenticated • Role Assigned</span>
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES & CUISINES SECTION */}
      <section
        id="categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>Gastronomy Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inspiration for Your Next Meal
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
            Hand-curated collections crafted by our culinary experts and local
            neighborhood favorites.
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar touch-pan-x">
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setSelectedFilter(chip)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === chip ?
                  "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                : theme === "dark" ?
                  "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                : "bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group ${
                theme === "dark" ?
                  "bg-zinc-900/60 border-zinc-800 hover:border-orange-500/40 hover:bg-zinc-850"
                : "bg-white border-zinc-200 hover:border-orange-500/40 hover:shadow-md"
              }`}
            >
              <div className="text-3xl mb-2 group-hover:scale-115 transition-transform">
                {item.emoji}
              </div>
              <h4 className="font-bold text-xs sm:text-sm line-clamp-1 mb-0.5">
                {item.name}
              </h4>
              <span className="text-[11px] text-zinc-500 block">
                {item.places}
              </span>
              <span className="mt-2 inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED RESTAURANTS SHOWCASE */}
      <section
        id="restaurants"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Top Rated Kitchens</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trending Restaurants in Your Area
            </h2>
          </div>
          <span className="text-xs font-semibold text-orange-500 cursor-pointer hover:underline flex items-center gap-1">
            <span>View All 184 Kitchens</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_RESTAURANTS.map((resto) => (
            <div
              key={resto.id}
              className={`rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 group flex flex-col ${
                theme === "dark" ?
                  "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-xl"
              }`}
            >
              {/* Card Banner with Gradient & Promo Tag */}
              <div
                className={`h-40 bg-gradient-to-tr ${resto.imageBg} relative p-4 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md">
                    {resto.offer}
                  </span>
                  <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-md">
                    <Star className="w-3 h-3 fill-white" />
                    <span>{resto.rating}</span>
                  </div>
                  <span className="text-xs text-white/90 font-medium drop-shadow-md">
                    ({resto.reviews})
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-base group-hover:text-orange-500 transition-colors mb-1">
                    {resto.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-3 line-clamp-1">
                    {resto.cuisine}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {resto.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          theme === "dark" ?
                            "bg-zinc-800 text-zinc-400"
                          : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-500/10 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{resto.deliveryTime}</span>
                  </div>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                    {resto.minOrder}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ECOSYSTEM METRICS & TRUST COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div
          className={`p-8 sm:p-12 rounded-3xl border ${
            theme === "dark" ?
              "bg-zinc-900/40 border-zinc-800/80 shadow-2xl shadow-black/40"
            : "bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-orange-100 shadow-xl shadow-orange-100/30"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
                18 Min
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-80">
                Average Delivery Time
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                From order to doorstep
              </p>
            </div>

            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
                2,500+
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-80">
                Kitchen Partners
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Verified hygiene rated
              </p>
            </div>

            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
                99.8%
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-80">
                On-Time Success
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                AI route-guided dispatch
              </p>
            </div>

            <div>
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
                150K+
              </div>
              <div className="text-xs sm:text-sm font-semibold opacity-80">
                Active Diners
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Across 14 metro zones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3-STEP EXPERIENCE) */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Frictionless Ordering</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            How Foomato Works
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base">
            Engineered from ground up with real-time sockets and distributed
            microservices for seamless ordering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div
            className={`p-8 rounded-3xl border relative transition-all duration-300 hover:-translate-y-1 ${
              theme === "dark" ?
                "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            <div className="text-4xl font-black text-orange-500/20 absolute top-6 right-6">
              01
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Pick Your Appetite</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Explore dynamic menus, customize dishes with spicy level and
              dietary options, and pay safely via 256-bit encrypted checkout.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-8 rounded-3xl border relative transition-all duration-300 hover:-translate-y-1 ${
              theme === "dark" ?
                "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            <div className="text-4xl font-black text-amber-500/20 absolute top-6 right-6">
              02
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Live Kitchen Preparation</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Chefs receive orders instantly on Kitchen Display Terminals. Watch
              preparation progress live with sub-second websocket status sync.
            </p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-8 rounded-3xl border relative transition-all duration-300 hover:-translate-y-1 ${
              theme === "dark" ?
                "bg-zinc-900/50 border-zinc-800"
              : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            <div className="text-4xl font-black text-emerald-500/20 absolute top-6 right-6">
              03
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Swift Doorstep Handover</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Our intelligent routing algorithm assigns the closest active rider
              for lightning transit. Receive piping hot food with zero delays.
            </p>
          </div>
        </div>
      </section>

      {/* 6. MULTI-TENANT ROLES PILLARS */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Built for Every Member of the Network
          </h2>
          <p className="text-zinc-500 text-sm sm:text-base">
            Every participant enjoys dedicated, custom-tailored capabilities
            designed for peak speed and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer */}
          <div
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              theme === "dark" ?
                "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
              : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Food Lovers</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Browse hyper-local menus, customize dishes with add-ons, and track
              your meals with instant live GPS updates.
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

          {/* Rider */}
          <div
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              theme === "dark" ?
                "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
              : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delivery Riders</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Optimized turn-by-turn routing, flexible delivery batches, and
              transparent daily payout deposits.
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

          {/* Seller */}
          <div
            className={`p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              theme === "dark" ?
                "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
              : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Restaurant Sellers</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              Command your digital storefront, automate kitchen tickets, and
              monitor revenue metrics effortlessly.
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

      {/* 7. APP DOWNLOAD BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div
          className={`p-8 sm:p-14 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 ${
            theme === "dark" ?
              "bg-gradient-to-tr from-zinc-900 via-zinc-900 to-zinc-850 border-zinc-800"
            : "bg-gradient-to-tr from-orange-50 via-amber-50 to-orange-100/60 border-orange-200/70 shadow-lg"
          }`}
        >
          <div className="max-w-lg text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-4">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Experience</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Get the Foomato App for Real-Time Radar
            </h2>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Order on the go, track your delivery driver live on satellite
              maps, and access app-exclusive flash promotions every day.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button className="px-6 py-3 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
                <span>App Store</span>
              </button>
              <button className="px-6 py-3 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
                <span>Google Play</span>
              </button>
            </div>
          </div>

          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 shrink-0">
            <div className="text-center p-6">
              <Smartphone className="w-16 h-16 mx-auto mb-2 opacity-90" />
              <div className="font-extrabold text-sm">Scan to Order</div>
              <div className="text-[11px] opacity-80">iOS & Android Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Details Popup Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={(loc) => {
          toast.success(
            `Delivery address set to ${loc.city || loc.address || "current location"}!`,
          );
        }}
      />
    </div>
  );
};
