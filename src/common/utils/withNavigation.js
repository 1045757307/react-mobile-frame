import { useNavigate } from 'react-router-dom';

export const withNavigation = Component => {
  return props => <Component {...props} navigate={useNavigate()} />;
};
