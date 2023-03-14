const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyService = 'http://localhost:3000'; // 代理服务

module.exports = function (app) {
  app.use(
    /**
     * createProxyMiddleware的第一个参数可以是字符串也可以是数组
     * 如需要设置代理的接口为'/api/user/current-user'，那这里写入'/api'即可
     * 此配置可以为多个
     **/
    createProxyMiddleware('/api', {
      target: proxyService, // 代理服务器地址
      changeOrigin: true, // 改变host
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};
