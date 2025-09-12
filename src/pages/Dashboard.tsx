import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { MajorIndicesWidget } from '@/components/widgets/MajorIndicesWidget';
import { StockWatchlistWidget } from '@/components/widgets/StockWatchlistWidget';
import { CryptocurrencyWidget } from '@/components/widgets/CryptocurrencyWidget';
import { AnalyticsWidget } from '@/components/widgets/AnalyticsWidget';
import { 
  Newspaper, 
  Cloud, 
  TrendingUp, 
  Activity,
  Users,
  Calendar,
  Bell,
  Zap 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Row - News and Weather */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[500px]">
              <NewsWidget />
            </div>
            <div className="h-[500px]">
              <WeatherWidget />
            </div>
          </div>

          {/* Analytics Widget */}
          <div className="h-[350px]">
            <AnalyticsWidget />
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Finance Widgets */}
          <div className="h-[400px] overflow-hidden">
            <MajorIndicesWidget />
          </div>
          
          <div className="h-[450px] overflow-hidden">
            <StockWatchlistWidget />
          </div>
          
          <div className="h-[450px] overflow-hidden">
            <CryptocurrencyWidget />
          </div>

          {/* Reminders Card - moved below finance widgets */}
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
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracker */}
        <Card className="dashboard-card bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Time Tracker</h3>
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-2">01:24:08</div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">
                Pause
              </Button>
              <Button size="sm" variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">
                Stop
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dashboard-card lg:col-span-2">
          <CardHeader className="widget-header">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              🎯 Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Stock watchlist updated</p>
                  <p className="text-xs text-muted-foreground">AAPL and GOOGL added to tracking</p>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>
              
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Newspaper className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">News feed refreshed</p>
                  <p className="text-xs text-muted-foreground">3 new articles from TechNews</p>
                </div>
                <span className="text-xs text-muted-foreground">5 min ago</span>
              </div>
              
              <div className="flex items-center gap-3 p-2">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-success-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Crypto prices updated</p>
                  <p className="text-xs text-muted-foreground">Bitcoin and Ethereum synced</p>
                </div>
                <span className="text-xs text-muted-foreground">10 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;