import axios from '@common';

// 验证token
export const getUserInfoByToken = () =>
  axios.request({
    url: ``,
    method: 'get',
    headers: {
      'Content-type': 'application/text',
    },
    extra: {
      isReturnFull: true,
    },
  });

// 用户名密码登录
export const login = data =>
  axios.request({
    url: ``,
    data,
  });
