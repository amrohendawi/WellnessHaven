import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin: _requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page with the return URL
      navigate('/admin/login', {
        state: { from: location },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-pink-500 animate-spin" />
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by the useEffect
  }

  // TODO: Add admin role check if needed
  // if (requireAdmin && !user.isAdmin) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
}
