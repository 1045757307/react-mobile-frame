import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd-mobile';
import { login, getUserInfoByToken } from '@api/user';
import { setCookie, withAdvanced, Loading } from '@common';
import './index.scss';

const Login = props => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 验证token是否失效
    getUserInfoByToken().then(res => {
      setLoading(false);
      if (res.code === '200') {
        setCookie('userInfo', JSON.stringify(res.data));
        props.navigate('/home');
      }
    });
  }, [props]);

  // 点击登录
  const handleLogin = () => {
    const [searchParams] = props.useSearchParams;
    console.log(searchParams.get('redirect'));
    login({ a: '1' }).then(res => {
      console.log(res);
    });
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="login-page">
          <Input />
          <Button block color="primary" onClick={handleLogin}>
            登录
          </Button>
        </div>
      )}
    </>
  );
};
export default withAdvanced(Login);
