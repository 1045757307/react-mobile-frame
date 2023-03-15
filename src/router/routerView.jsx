import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// useRoutes
import routes from './routerConfig';
import { Loading } from '@common';

function RouterView() {
  const routerArr = routes && routes.filter(item => !item.to); //非重定向的数组
  const redirectArr = routes && routes.filter(item => item.to); //重定向的数组
  // const element = useRoutes(routes);

  return (
    <Routes>
      {routerArr &&
        routerArr.map((item, index) => (
          <Route
            key={index}
            path={item.path}
            element={
              <Suspense fallback={<Loading />}>
                <item.element />
              </Suspense>
            }
          />
        ))}
      {redirectArr &&
        redirectArr.map((item, index) => (
          <Route
            key={index}
            path={item.path}
            element={<Navigate to={item.to} />}
          />
        ))}
    </Routes>
    // <>{element}</>
  );
}

export default RouterView;
