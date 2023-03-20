import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Login = lazy(() => import('@pages/Login'));
const Home = lazy(() => import('@pages/Home'));
const NoFound = lazy(() => import('@common/components/NoFound'));

const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/',
    element: <Navigate to="/login" />, // 重定向,
  },
  {
    path: '*',
    element: <NoFound />,
  },
];

export default routes;
