import { AutoCenter, SpinLoading } from 'antd-mobile';

const Loading = props => {
  const { class_name = 'marginTop75' } = props;

  return (
    <AutoCenter className={class_name}>
      <SpinLoading color="primary" />
      <p>加载中...</p>
    </AutoCenter>
  );
};
export default Loading;
