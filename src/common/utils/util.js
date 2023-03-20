import Cookies from 'js-cookie';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export const getCookie = Cookies.get;
export const setCookie = Cookies.set;

/**
 * 高阶组件 传递react-router-dom方法
 * 传递navigate
 * 传递location
 * 传递searchParams
 */
export const withAdvanced = Component => {
  return props => (
    <Component
      {...props}
      navigate={useNavigate()}
      location={useLocation()}
      useSearchParams={useSearchParams()}
    />
  );
};

/**
 * 获取当前选中的语言
 */
export function getLanguage() {
  const localSearch = baseUrlToJson(window.location.search.split('?')[1]).local;
  const langCookie = getCookie('lang');
  const language = localSearch ? localSearch : langCookie ? langCookie : 'cn';
  return language;
}

/**
 * url转json对象
 * @param {*} url url的search或hash，不包含#、?
 */
export function baseUrlToJson(url) {
  var newObj = new Object();
  var strs = url.split('&');
  for (var i = 0; i < strs.length; i++) {
    const arr = strs[i].split('=');
    newObj[arr[0]] = arr[1] === 'undefined' ? undefined : arr[1];
  }
  return newObj;
}

// 取消正在进行的axio请求，用于退出当前页面、关闭当前弹窗或其他需要临时取消请求的特殊情况
export function cancelAxios() {
  const cancelTokenList = window.cancelTokenList || [];
  cancelTokenList.forEach(cancel => {
    cancel && cancel('取消请求');
  });
  window.cancelTokenList = [];
}
