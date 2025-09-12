import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const weeklyData = [
  { day: 'Mon', value: 85 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 92 },
  { day: 'Thu', value: 88 },
  { day: 'Fri', value: 95 },
  { day: 'Sat', value: 72 },
  { day: 'Sun', value: 68 },
];

const categoryData = [
  { name: 'News', value: 35, color: '#0F766E' },
  { name: 'Weather', value: 20, color: '#14B8A6' },
  { name: 'Finance', value: 25, color: '#2DD4BF' },
  { name: 'Sports', value: 20, color: '#5EEAD4' },
];

export const AnalyticsWidget: React.FC = () => {
  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          📈 Feed Analytics
          <span className="ml-auto text-xs text-muted-foreground">Last 7 days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {/* Weekly Activity Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Weekly Activity</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <YAxis hide />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Widget Usage</h4>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};