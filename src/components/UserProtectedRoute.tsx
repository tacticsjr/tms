
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const currentUser = localStorage.getItem("currentUser");

  useEffect(() => {
    // This effect can be used to track navigation for analytics
    if (currentUser) {
      console.log(`User protected route accessed: ${location.pathname}`);
    }
  }, [location.pathname, currentUser]);

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;
