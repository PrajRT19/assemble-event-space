
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  // Add logging to debug auth state
  useEffect(() => {
    console.log("ProtectedRoute auth state:", { isAuthenticated, isAdmin, loading });
  }, [isAuthenticated, isAdmin, loading]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
    console.log("User not admin, redirecting to home");
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}
