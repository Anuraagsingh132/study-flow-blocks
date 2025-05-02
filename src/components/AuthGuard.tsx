
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  requireAuth: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ requireAuth }) => {
  const { user, loading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If user is authenticated but tries to access auth page
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }
  
  // Continue rendering protected routes
  return <Outlet />;
};

export default AuthGuard;
