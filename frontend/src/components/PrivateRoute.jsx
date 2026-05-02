import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isGuest = localStorage.getItem('isGuest') === 'true';
  
  if (!token && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default PrivateRoute;
