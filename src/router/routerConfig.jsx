import Home from "../pages/Home";
import Login from "../pages/Login";
 
const routes = [
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/home",
        element: <Home />,
    },
    {
      path: "/",
      to: "/home"  // 重定向,
  }
]
 
 
export default routes;