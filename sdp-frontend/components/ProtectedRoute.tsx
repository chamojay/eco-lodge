import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!allowedRoles.includes(user?.role)) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;