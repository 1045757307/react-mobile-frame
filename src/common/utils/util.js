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
