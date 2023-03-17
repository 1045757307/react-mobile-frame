import axios from 'axios';
import { Toast } from 'antd-mobile';
import { getLanguage, getCookie, setCookie } from './util';

class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.queue = {};
    this.limit = {};
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
      // 跨域请求，允许保存cookie
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      cancelToken: source.token,
      extra: {
        isReturnFull: false, // 请求成功的时候是否需要把请求结果全部返回 默认只返回Data数据
        isErrorHandle: false, // 请求失败的时候，是否进行错误处理 默认是处理，如果为true 则不处理
        isLimit: true, // 默认防止重复提交 注意此判断是以url为基准，如果url相同，参数不同，请求也会拦截，若碰到此情况，请设置为false
      },
    };
    return config;
  }

  /**
   * 发送请求
   * @param options
   */
  request(options) {
    const { url, extra } = options;
    if (!url) {
      Toast.show({
        icon: 'fail',
        content: '请求url不能为空',
      });
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
    const newOptions = Object.assign({}, this.getDefaultConfig(), options);
    const token = getCookie('token');
    const userInfo = getCookie('userInfo');
    if (token) newOptions.headers.Authorization = token;
    if (userInfo && userInfo.elsAccount && userInfo.elsSubAccount) {
      newOptions.headers.account = `${userInfo.elsAccount}_${userInfo.elsSubAccount}`;
    }
    const { extra, url } = newOptions;
    const instance = axios.create();
    instance.interceptors.request.use(this.beforeRequest(extra, url), error => {
      this.release(url);
      return Promise.reject(error);
    });
    instance.interceptors.response.use(
      this.succRequest(extra, url),
      this.failRequest(extra, url),
    );
    delete newOptions.extra; // 移除不必要参数
    return instance(newOptions);
  }
  /**
   * 请求拦截处理
   * @param options
   */
  beforeRequest(extra, url) {
    return config => {
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
    return res => {
      const { isReturnFull, isErrorHandle } = extra;
      this.release(url);
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
            // 错误程序自动处理
            Toast.show({
              icon: 'fail',
              content: message,
            });
            return Promise.reject(resData);
          }
        case 401:
          // 登录失效 跳转登录页
          return Promise.reject();
        case 404:
          return Promise.reject();
        default:
          if (isErrorHandle) {
            return Promise.reject(resData);
          }
          Toast.show({
            icon: 'fail',
            content: message || '请求失败！',
          });
          return Promise.reject();
      }
    };
  }
  /**
   * 请求失败处理
   * @param extra
   */
  failRequest(extra, url) {
    return error => {
      if (error.response) {
        const {
          response: { status, statusText, data },
        } = error;
        this.release(url);
        const message = (data && (data.message || statusText)) || statusText;
        switch (status) {
          case 401:
            // 登录失效 跳转登录页
            console.log('失败请求处理');
            return Promise.reject();
          default:
            if (extra.isErrorHandle) {
              return Promise.reject({
                success: false,
                message: `${status}: ${message || '请求失败！'}`,
              });
            }
            Toast.show({
              icon: 'fail',
              content: `${status}: ${message || '请求失败！'}`,
            });
            return Promise.reject();
        }
      } else {
        // 取消请求
        this.release(url);
        return Promise.reject();
      }
    };
  }
  /**
   * 释放存储资源
   * @param url
   */
  release(url) {
    delete this.limit[url];
    delete this.queue[url];
  }
}
const httpRequest = new HttpRequest('/apis/');
export default httpRequest;
