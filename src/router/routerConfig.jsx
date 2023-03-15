import { lazy } from 'react';
// import { Navigate } from 'react-router-dom';

const routes = [
  {
    path: '/login',
    element: lazy(() => import('@pages/Login')),
  },
  {
    path: '/home',
    element: lazy(() => import('@pages/Home')),
  },
  {
    path: '/',
    to: '/home',
    // element: <Navigate to="/home" />, // 重定向,
  },
  {
    path: '*',
    element: lazy(() => import('@common/components/NoFound')),
  },
];

export default routes;
