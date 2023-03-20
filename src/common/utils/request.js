import axios from 'axios';
import { Toast, Dialog } from 'antd-mobile';
import { getLanguage, getCookie } from '@common';

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
      // 默认
      // headers: {
      //   'Content-Type': 'application/json;charset=UTF-8',
      // },
      timeout: 20000,
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
    const { extra, url } = newOptions;
    const instance = axios.create();
    instance.interceptors.request.use(this.beforeRequest(url), error => {
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
  beforeRequest(url) {
    return config => {
      if (Object.keys(this.queue).length > 0) {
        console.log('存在未完成的请求', Object.keys(this.queue).length);
      }
      // 加入请求队列
      this.queue[url] = true;

      // 设置token和account
      const token = getCookie('token');
      if (token) config.headers.token = token;
      let userInfo = getCookie('userInfo');
      userInfo = userInfo ? JSON.parse(userInfo) : userInfo;
      if (userInfo && userInfo.elsAccount && userInfo.elsSubAccount) {
        config.headers.account = `${userInfo.elsAccount}_${userInfo.elsSubAccount}`;
      }

      // 处理国际化
      const lang = getLanguage();
      if (config.method === 'get') {
        config.params = Object.assign(Object.assign({}, config.data), {
          local: lang,
        });
      } else {
        config.data = Object.assign(Object.assign({}, config.data), {
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
      console.log('request success');
      const { isReturnFull, isErrorHandle } = extra;
      this.release(url);
      const { message, data, code } = res.data;
      if (res.status === 200) {
        if (isReturnFull) return res.data;
        if (isErrorHandle) return Promise.reject(res.data); // 错误自行处理
        switch (code) {
          case '200':
            return data;
          case '401':
            Dialog.confirm({
              content: message,
              onConfirm: () => {
                if (!window.location.pathname.startsWith('/login')) {
                  window.location.href = `/login?redirect=${window.location.href}`;
                }
              },
            });
            return Promise.reject();
          case '-101':
            Dialog.confirm({
              content: `${message}立即登录？`,
              onConfirm: () => {
                if (!window.location.pathname.startsWith('/login')) {
                  window.location.href = `/login?redirect=${window.location.href}`;
                }
              },
            });
            return Promise.reject();
          default:
            // 错误程序自动处理
            Toast.show({
              icon: 'fail',
              content: message,
            });
            return Promise.reject(res.data);
        }
      } else {
        if (isErrorHandle) {
          return Promise.reject(res.data);
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
    console.log('request fail');
    return error => {
      if (error.response) {
        const {
          response: { status, statusText, data },
        } = error;
        const message = (data && (data.message || statusText)) || statusText;
        this.release(url);
        if (status === 404) {
          return Promise.reject();
        }
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
