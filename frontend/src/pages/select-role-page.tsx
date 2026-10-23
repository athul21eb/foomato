import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { RoleSelectCards } from "../features/auth/components/role-select-cards";
import { useAuth } from "../context/use-auth";
import { useTheme } from "../context/use-theme";
import { ScaleIn, FadeInUp } from "../lib/animations";

export const SelectRolePage: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
      } else if (user?.role === "seller") {
        navigate("/seller", { replace: true });
      } else if (user?.role === "rider") {
        navigate("/rider", { replace: true });
      } else if (user?.role === "customer") {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user?.role, navigate]);

  return (
    <ScaleIn
      duration={0.35}
      initialScale={0.96}
      className={`w-full max-w-4xl mx-auto p-5 sm:p-8 lg:p-10 rounded-3xl border backdrop-blur-2xl transition-all duration-300 shadow-2xl ${
        theme === "dark" ?
          "bg-zinc-900/80 border-zinc-800/90 text-white shadow-black/60"
        : "bg-white/90 border-zinc-200/90 text-zinc-900 shadow-zinc-300/40"
      }`}
    >
      <FadeInUp delay={0.05} className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Account Setup</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Select Your Foomato Role
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Hey {user?.name || "there"}! Tell us how you'll be participating in
          the Foomato network.
        </p>
      </FadeInUp>

      <RoleSelectCards />
    </ScaleIn>
  );
};
