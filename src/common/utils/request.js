import axios from 'axios';
import { merge, trim } from 'lodash';
import Cookies from 'js-cookie';
import { showSpin, hideSpin, showError, setCookie, getLanguage } from './util';

const getCookie = Cookies.get;

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.queue = {};
    this.limit = {};
  }
  /**
   * 发送请求
   * @param options
   */
  request(options) {
    const { url, extra } = options;
    if (!url) {
      showError('请求url不能为空' /*i18nT('urlMust')*/);
      return Promise.reject(); // 直接抛出错误
    }
    if (extra === undefined || extra.isLimit) {
      if (this.limit[url] === true) return Promise.reject(); // 直接抛出错误
      this.limit[url] = true;
    }
    return this.startRequest(options);
  }
  /**
   * 开始请求
   * @param options
   */
  startRequest(options) {
    // 合并参数
    const newOptions = merge(this.getDefaultConfig(), options);
    const token = getCookie('token');
    if (token) newOptions.headers.Authorization = token;
    const { extra, url } = newOptions;
    const instance = axios.create();
    instance.interceptors.request.use(
      this.beforeRequest(extra, url),
      (error) => {
        this.release(extra, url);
        return Promise.reject(error);
      }
    );
    instance.interceptors.response.use(
      this.succRequest(extra, url),
      this.failRequest(extra, url)
    );
    delete newOptions.extra; // 移除不必要参数
    return instance(newOptions);
  }
  /**
   * 请求拦截处理
   * @param options
   */
  beforeRequest(extra, url) {
    return (config) => {
      // loading控制 不建议开启 请自行控制
      if (
        !Object.keys(this.queue).length &&
        (extra.isShowLoading || extra.loadingWrapper)
      ) {
        showSpin({ wrapper: extra.loadingWrapper });
      }
      // 加入请求队列
      this.queue[url] = true;
      if (
        config.method === 'get' &&
        config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
      ) {
        // 处理国际化
        const lang = getLanguage();
        config.params = Object.assign(Object.assign({}, config.data), {
          local: lang,
        });
      }
      return config;
    };
  }
  /**
   * 请求成功处理
   * @param extra
   */
  succRequest(extra, url) {
    return (res) => {
      const { isReturnFull, isErrorHandle } = extra;
      this.release(extra, url);
      const { data: resData, status } = res;
      const { success, message, data } = resData;
      const currentToken = res.headers.authorization;
      if (currentToken) setCookie('token', currentToken);
      switch (status) {
        case 200:
          if (isReturnFull) return resData;
          if (success) return data;
          if (isErrorHandle) return Promise.reject(resData);
          // 错误自行处理
          else {
            showError(message); // 错误程序自动处理
            return Promise.reject(resData);
          }
        case 401:
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject();
        case 404:
          return Promise.reject();
        default:
          if (isErrorHandle) {
            return Promise.reject(resData);
          }
          showError(message || '请求失败！');
          return Promise.reject();
      }
    };
  }
  /**
   * 请求失败处理
   * @param extra
   */
  failRequest(extra, url) {
    return (error) => {
      if (error.response) {
        const {
          response: { status, statusText, data },
        } = error;
        this.release(extra, url);
        const message = (data && (data.message || statusText)) || statusText;
        switch (status) {
          case 401:
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject();
          default:
            if (extra.isErrorHandle) {
              return Promise.reject({
                success: false,
                message: `${status}: ${message || '请求失败！'}`,
              });
            }
            showError(`${status}: ${message || '请求失败！'}`);
            // eslint-disable-next-line
            return Promise.reject();
        }
      } else {
        // 取消请求
        this.release(extra, url);
        return Promise.reject();
      }
    };
  }
  /**
   * 释放存储资源
   * @param url
   * @param extra
   */
  release({ isShowLoading, loadingWrapper }, url) {
    delete this.limit[url];
    delete this.queue[url];
    if (!Object.keys(this.queue).length && (isShowLoading || loadingWrapper)) {
      hideSpin({ wrapper: loadingWrapper });
    }
  }
  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const cancelTokenList = window.cancelTokenList || [];
    cancelTokenList.push(source.cancel);
    window.cancelTokenList = cancelTokenList;
    const config = {
      method: 'post',
      baseURL: this.baseUrl,
      url: '',
      withCredentials: true,
      // 此方法用于拼接参数，看服务端接收情况 只有post请求会调用此函数
      // 注意 若为post请求 axios要求必须设置data参数，所以此函数必须返回值，
      // 不能返回undefind，不然不会携带content-type
      transformRequest: (data, header) => {
        // 处理国际化
        const lang = getLanguage();
        let params = data;
        if (!(data instanceof Array || typeof data == 'string')) {
          params = Object.assign(Object.assign({}, data), { local: lang });
        }
        if (header['Content-Type'] === 'multipart/form-data') {
          return this.handleFormDataParams(params);
        }
        if (header['Content-Type'] === 'application/x-www-form-urlencoded') {
          return this.handleParams(params);
        }
        if (typeof data === 'object') return JSON.stringify(params);
        return data || '';
      },
      headers: (() => {
        const headerObj = {
          'Content-Type': 'application/json;charset=UTF-8',
        };
        return headerObj;
      })(),
      cancelToken: source.token,
      extra: {
        loadingWrapper: undefined, // loading的加载区域 类型为dom元素 非document，document请设置isShowLoading为true
        isReturnFull: false, // 请求成功的时候是否需要把请求结果全部返回 默认只返回Data数据
        isErrorHandle: false, // 请求失败的时候，是否进行错误处理 默认是处理，如果为true 则不处理
        isShowLoading: false, // 请求url的时候 是否显示加载状态 默认不显示
        isLimit: true, // 默认防止重复提交 注意此判断是以url为基准，如果url相同，参数不同，请求也会拦截，若碰到此情况，请设置为false
      },
    };
    return config;
  }
  /**
   * content-type:multipart/form-data 参数处理
   * @param data 参数
   * @returns 拼接的参数列表
   */
  handleFormDataParams(data) {
    const formData = new FormData();
    if (data) {
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
    }
    return formData;
  }
  /**
   * content-type:application/x-www-form-urlencoded参数处理
   * @param data 参数
   * @returns 拼接的参数列表
   */
  handleParams(data) {
    const ret = [];
    if (data) {
      Object.keys(data).forEach((key) => {
        let paramVal = data[key];
        if (paramVal === 0 || paramVal === '' || paramVal) {
          if (typeof paramVal === 'string') paramVal = trim(paramVal);
          if (typeof paramVal === 'object') {
            paramVal = JSON.stringify(paramVal);
          }
          ret.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(paramVal)}`
          );
        }
      });
    }
    return ret.join('&');
  }
}
const httpRequest = new HttpRequest('/');
export default httpRequest;
