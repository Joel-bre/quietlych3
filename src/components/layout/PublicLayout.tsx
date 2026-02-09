import { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return null;
  }

  return <>{children}</>;
}
