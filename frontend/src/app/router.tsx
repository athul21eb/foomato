import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/root-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { HomePage } from '../pages/home-page';
import { LoginPage } from '../pages/login-page';
import { SelectRolePage } from '../pages/select-role-page';
import { NotFoundPage } from '../pages/not-found-page';
import { ErrorPage } from '../pages/error-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/select-role',
        element: <SelectRolePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
