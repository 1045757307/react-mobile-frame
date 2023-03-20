import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd-mobile';
import { srmLogin, getUserInfoByToken } from '@api/user';
import { getCookie, setCookie, withAdvanced, Loading } from '@common';
import './index.scss';

const Login = props => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInfoByToken(getCookie('token')).then(res => {
      setLoading(false);
      if (res.code === '200') {
        setCookie('userInfo', JSON.stringify(res.data));
        props.navigate('/home');
      }
    });
  }, []);

  // 点击登录
  const handleLogin = () => {
    const [searchParams] = props.useSearchParams;
    console.log(searchParams.get('redirect'));
    srmLogin({ a: '1' }).then(res => {
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
