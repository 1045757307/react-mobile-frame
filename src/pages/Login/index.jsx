import { Input, Button } from 'antd-mobile';
import { srmLogin } from '@api/user';

const Login = () => {
  // 点击登录
  const handleLogin = () => {
    srmLogin({ a: '1' }).then(res => {
      console.log(res);
    });
  };

  return (
    <div>
      <Input />
      <Button block color="primary" onClick={handleLogin}>
        登录
      </Button>
    </div>
  );
};
export default Login;
