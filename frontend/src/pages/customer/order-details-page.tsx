import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/account?orderId=${id}`, { replace: true });
    } else {
      navigate('/account', { replace: true });
    }
  }, [id, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
      <div className="h-8 w-44 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60" />
      <div className="h-64 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-56 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
        <div className="h-56 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
      </div>
    </div>
  );
};

export default OrderDetailsPage;
