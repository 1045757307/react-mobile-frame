import axios from './utils/request';
import Loading from './components/Loading';
import NoFound from './components/NoFound';
import './index.scss';
export * from './utils/util';

// 暴露公共组件
export { Loading, NoFound };

// 默认暴露axios
export default axios;
