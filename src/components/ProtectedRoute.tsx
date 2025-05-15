
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'admin' 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      console.info(`Protected route accessed: ${location.pathname}`);
    }
  }, [location.pathname, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access if needed
  if (requiredRole && user.role !== requiredRole) {
    // Handle unauthorized access - redirect to proper role-based login
    const redirectPath = user.role === 'student' 
      ? '/user/login' 
      : user.role === 'staff' 
      ? '/staff/login' 
      : '/admin/login';
      
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
