import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { GoogleLoginBtn } from "../features/auth/components/google-login-btn";
import { useAuth } from "../context/use-auth";
import { useTheme } from "../context/use-theme";
import { LoadingScreen } from "../components/feedback/loading-screen";
import { ScaleIn, FadeInUp } from "../lib/animations";

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user, isLoading, isLoggingOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent bouncing to '/' or any route while logging out
    if (!isLoading && !isLoggingOut && isAuthenticated) {
      if (!user?.role) {
        navigate("/select-role", { replace: true });
      } else if (user.role === "seller") {
        navigate("/seller", { replace: true });
      } else if (user.role === "rider") {
        navigate("/rider", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, isLoggingOut, user, navigate]);

  if (isLoading || isLoggingOut || isAuthenticated) {
    return (
      <LoadingScreen
        fullScreen={false}
        message={
          isLoggingOut
            ? "Signing out safely..."
            : isAuthenticated
            ? "Taking you to your dashboard..."
            : "Verifying session..."
        }
        subtext={
          isLoggingOut
            ? "Securing your session"
            : isAuthenticated
            ? "Welcome back! Connecting to your workspace"
            : "Checking your login status"
        }
      />
    );
  }

  return (
    <ScaleIn
      duration={0.35}
      initialScale={0.96}
      className={`p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
        theme === "dark" ?
          "bg-zinc-900/80 border-zinc-800/90 text-white shadow-black/60"
        : "bg-white/90 border-zinc-200/90 text-zinc-900 shadow-zinc-300/40"
      }`}
    >
      {/* Header */}
      <FadeInUp delay={0.05} className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/25 mb-4 hover:scale-105 transition-transform">
          <img
            src="/foomato.png"
            alt="Foomato Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Welcome to Foomato
        </h2>
        <p className="text-sm text-zinc-500 max-w-xs">
          Sign in securely to explore menus, manage deliveries, or run your
          kitchen.
        </p>
      </FadeInUp>

      {/* Google Login Component */}
      <FadeInUp delay={0.1} className="w-full flex justify-center my-4">
        <GoogleLoginBtn />
      </FadeInUp>

      {/* Privacy & Terms Note */}
      <FadeInUp delay={0.15} className="mt-8 pt-6 border-t border-zinc-500/10 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Single sign-on protected by Google Identity Services</span>
        </div>
      </FadeInUp>
    </ScaleIn>
  );
};
