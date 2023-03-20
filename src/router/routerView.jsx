import React, { Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import routes from './routerConfig';
import { Loading, cancelAxios } from '@common';

function RouterView() {
  const location = useLocation();

  // 浏览器路由改变
  useEffect(() => {
    cancelAxios();
  }, [location]);

  return (
    <>
      <Routes>
        {routes &&
          routes.map((item, index) => (
            <Route
              key={index}
              path={item.path}
              element={
                <Suspense fallback={<Loading />}>{item.element}</Suspense>
              }
            />
          ))}
      </Routes>
    </>
  );
}

export default RouterView;
