import { BrowserRouter } from 'react-router-dom';

import RouterView from './routerView';

export default function RootRouter() {
  return (
    <BrowserRouter>
      <RouterView></RouterView>
    </BrowserRouter>
  );
}
