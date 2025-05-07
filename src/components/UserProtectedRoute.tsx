
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (user) {
      console.log(`User protected route accessed: ${location.pathname}`);
    }
  }, [location.pathname, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;
