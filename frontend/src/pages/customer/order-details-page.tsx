import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/account?orderId=${id}` : '/account'} replace />;
};

export default OrderDetailsPage;
