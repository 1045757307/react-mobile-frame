import { BrowserRouter } from 'react-router-dom';
import routes from './routerConfig';
import RouterView from './routerView';

export default function RootRouter() {
  return (
    <BrowserRouter>
      <RouterView routes={routes}></RouterView>
    </BrowserRouter>
  );
}
