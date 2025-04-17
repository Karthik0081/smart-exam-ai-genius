
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'student')[];
};

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'student'] 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      navigate('/login');
    }
  }, [user, isLoading, navigate, allowedRoles]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-smartex-blue mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  
  return <>{children}</>;
}
