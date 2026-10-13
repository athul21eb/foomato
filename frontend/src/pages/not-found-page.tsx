import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { useTheme } from "../context/use-theme";

export const NotFoundPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${
        theme === "dark" ?
          "bg-[#09090b] text-white"
        : "bg-[#fafafa] text-zinc-900"
      }`}
    >
      <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8 animate-spin duration-3000" />
      </div>
      <h1 className="text-6xl font-black tracking-tight text-orange-500 mb-2">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
      <p className="text-sm text-zinc-500 max-w-sm mb-8">
        The delicious dish or destination you're looking for was moved or
        doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};
