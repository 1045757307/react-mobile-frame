import { ErrorBlock } from 'antd-mobile';

const NoFound = props => {
  const { class_name = 'marginTop150' } = props;

  return (
    <div className={class_name}>
      <ErrorBlock status="default" />
    </div>
  );
};
export default NoFound;
