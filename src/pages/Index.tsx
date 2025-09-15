import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">InfoWall</h1>
          <p className="text-lg text-muted-foreground mb-8">Your personal information dashboard</p>
          <Button onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
};

export default Index;
