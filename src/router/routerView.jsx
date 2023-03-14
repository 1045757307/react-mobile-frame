import { Routes, Route, Navigate } from 'react-router-dom';

function RouterView({ routes }) {
  const routerArr = routes && routes.filter(item => !item.to); //非重定向的数组
  const redirectArr = routes && routes.filter(item => item.to); //重定向的数组

  return (
    <Routes>
      {routerArr &&
        routerArr.map((item, index) => (
          <Route key={index} path={item.path} element={item.element} />
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
  );
}

export default RouterView;
