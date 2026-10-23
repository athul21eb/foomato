import React from "react";
import { Outlet, Link, ScrollRestoration } from "react-router-dom";

import { ThemeToggle } from "../components/common/theme-toggle";
import { useTheme } from "../context/use-theme";
import { useAuth } from "../context/use-auth";

export const AuthLayout: React.FC = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // Disable home navigation when logged in without an assigned role
  const isRolePending = isAuthenticated && !user?.role;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between items-center px-4 sm:px-6 relative transition-colors duration-300 ${
        theme === "dark" ?
          "bg-[#09090b] text-zinc-100"
        : "bg-[#f4f4f5] text-zinc-900"
      }`}
    >
      <ScrollRestoration />

      {/* Background ambient radial gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-orange-500/15 to-amber-500/15 rounded-full blur-3xl" />
      </div>

      {/* Top action bar in natural document flow */}
      <header className="w-full max-w-5xl mx-auto pt-6 pb-2 flex items-center justify-between z-10">
        {isRolePending ?
          <div
            className="flex items-center gap-2.5 select-none opacity-90"
            title="Please select a role to proceed"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-orange-500/20">
              <img
                src="/foomato.png"
                alt="Foomato"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Foomato
            </span>
          </div>
        : <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <img
                src="/foomato.png"
                alt="Foomato"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Foomato
            </span>
          </Link>
        }
        <ThemeToggle />
      </header>

      {/* Main Content centered vertically and horizontally */}
      <main className="w-full flex-1 flex flex-col justify-center items-center py-6 sm:py-10 z-10">
        <Outlet />
      </main>

      <footer className="text-xs text-zinc-500 pb-6 pt-2 text-center z-10">
        Secured with industrial cryptographic authentication
      </footer>
    </div>
  );
};
