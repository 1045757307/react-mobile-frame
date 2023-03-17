import React, { Suspense, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
// useRoutes
import routes from './routerConfig';
import { Loading, cancelAxios } from '@common';
import { getUserInfoByToken } from '@api/user';

function RouterView() {
  const navigate = useNavigate();
  const location = useLocation();
  const routerArr = routes && routes.filter(item => !item.to); //非重定向的数组
  const redirectArr = routes && routes.filter(item => item.to); //重定向的数组
  // const element = useRoutes(routes);

  // 浏览器路由改变
  useEffect(() => {
    cancelAxios();
  }, [location]);

  useEffect(() => {
    getUserInfoByToken().then(res => {
      if (res.code === '200') {
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

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
