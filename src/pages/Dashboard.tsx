import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { GridLayout } from '@/components/dashboard/GridLayout';
import { LayoutSettings } from '@/components/dashboard/LayoutSettings';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { 
  TrendingUp, 
  Activity,
  Users,
  Calendar,
  Bell,
  Newspaper,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { isLoading } = useLayoutConfig();

  if (isLoading) {
    return (
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
    );
  }

  return (
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

      {/* Quick Actions & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Reminders Card */}
        <Card className="dashboard-card">
          <CardHeader className="widget-header">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              📅 Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Market Analysis Review</h4>
                <p className="text-xs text-muted-foreground mt-1">Time: 2:00 PM - 4:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
              <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Weather Alert Setup</h4>
                <p className="text-xs text-muted-foreground mt-1">Configure storm warnings</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-foreground">Social Feed Update</h4>
                <p className="text-xs text-muted-foreground mt-1">Check trending topics</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full mt-4">
              <Bell className="w-4 h-4 mr-2" />
              Start Meeting
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card">
          <CardHeader className="widget-header">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              ⚡ Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Newspaper className="w-4 h-4 mr-2" />
              Add News Source
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Cloud className="w-4 h-4 mr-2" />
              Weather Settings
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Portfolio Tracker
            </Button>
            
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Team Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;