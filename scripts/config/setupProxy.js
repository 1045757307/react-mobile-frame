const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyService = `${process.env.REACT_APP_PROXY_SERVICE}`; // 代理服务
const isRewriteUrl = process.env.REACT_APP_PROXY_URL_REWRITE; // 是否需要重写url

module.exports = function (app) {
  const proxyConfig = {
    target: proxyService, // 代理服务器地址
    changeOrigin: true, // 改变host
  };

  // 是否需要重写接口的某一部分
  if (isRewriteUrl == 'true') {
    proxyConfig.pathRewrite = {
      '^/apis': '',
    };
  }

  app.use(
    /**
     * createProxyMiddleware的第一个参数可以是字符串也可以是数组
     * 如需要设置代理的接口为'/api/user/current-user'，那这里写入'/api'即可
     * 此配置可以为多个
     **/
    createProxyMiddleware('/apis/', proxyConfig),
  );
};
