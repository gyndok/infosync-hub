import React from 'react';
import { Cloud, Sun, Droplets, Wind, Eye, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const forecast = [
  { day: 'Today', high: 22, low: 15, condition: 'Sunny', icon: Sun },
  { day: 'Tomorrow', high: 19, low: 12, condition: 'Cloudy', icon: Cloud },
  { day: 'Friday', high: 25, low: 18, condition: 'Partly Cloudy', icon: Cloud },
  { day: 'Saturday', high: 20, low: 14, condition: 'Rainy', icon: Droplets },
];

export const WeatherWidget: React.FC = () => {
  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          🌤️ Weather
          <span className="ml-auto text-xs text-muted-foreground">San Francisco</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Current Weather */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-foreground">22°C</div>
              <div className="text-sm text-muted-foreground">Partly Cloudy</div>
            </div>
            <Sun className="w-12 h-12 text-yellow-500" />
          </div>
          
          {/* Weather Details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto" />
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-sm font-medium">65%</div>
            </div>
            <div className="space-y-1">
              <Wind className="w-4 h-4 text-gray-500 mx-auto" />
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="text-sm font-medium">12 km/h</div>
            </div>
            <div className="space-y-1">
              <Eye className="w-4 h-4 text-purple-500 mx-auto" />
              <div className="text-xs text-muted-foreground">Visibility</div>
              <div className="text-sm font-medium">10 km</div>
            </div>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">4-Day Forecast</h4>
          {forecast.map((day) => (
            <div key={day.day} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <day.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium min-w-[60px]">{day.day}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{day.high}°</span>
                <span className="text-sm text-muted-foreground">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};