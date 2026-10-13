import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/use-theme';

export const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const { theme } = useTheme();

  let errorMessage = 'An unexpected error occurred.';
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${
        theme === 'dark' ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold mb-2">Something Went Wrong</h1>
      <p className="text-sm text-zinc-500 max-w-md mb-8">{errorMessage}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reload Application</span>
      </Link>
    </div>
  );
};

export default ErrorPage;
