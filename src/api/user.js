import axios from '@common';

// 验证token
export const getUserInfoByToken = token =>
  axios.request({
    url: `ElsAuthService/webValidToken/${token}`,
    method: 'get',
    headers: {
      'Content-type': 'application/text',
    },
    extra: {
      isReturnFull: true,
    },
  });

// srm登录
export const srmLogin = data =>
  axios.request({
    url: `SingleSignOnService/srmLogin`,
    data,
  });
