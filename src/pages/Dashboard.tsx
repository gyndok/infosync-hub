import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { GridLayout } from '@/components/dashboard/GridLayout';
import { LayoutSettings } from '@/components/dashboard/LayoutSettings';
import { BreakingNewsBanner } from '@/components/widgets/BreakingNewsBanner';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { isLoading } = useLayoutConfig();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg">
        <BreakingNewsBanner />
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[400px] rounded-lg" />
              ))}
            </div>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <BreakingNewsBanner />
      <DashboardLayout>
        {/* Layout Controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Drag widgets to customize your layout</p>
          </div>
          <LayoutSettings />
        </div>

        {/* Draggable Grid Layout */}
        <GridLayout />
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;