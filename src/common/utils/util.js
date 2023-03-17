import Cookies from 'js-cookie';

export const getCookie = Cookies.get;
export const setCookie = Cookies.set;
/**
 * 获取当前选中的语言
 */
export function getLanguage() {
  const langCookie = getCookie('lang');
  const language = langCookie ? langCookie : 'cn';
  return language;
}

// 取消正在进行的axio请求，用于退出当前页面、关闭当前弹窗或其他需要临时取消请求的特殊情况
export function cancelAxios() {
  const cancelTokenList = window.cancelTokenList || [];
  cancelTokenList.forEach(cancel => {
    cancel && cancel('取消请求');
  });
  window.cancelTokenList = [];
}
