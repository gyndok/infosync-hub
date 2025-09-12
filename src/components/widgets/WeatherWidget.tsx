import { useState, useEffect, useCallback } from 'react';
import { useApiProxy } from '@/hooks/useApiProxy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  CloudDrizzle,
  Eye, 
  Droplets, 
  Wind, 
  Thermometer, 
  MapPin, 
  Search, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Navigation,
  Sunrise,
  Sunset,
  Gauge,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uv_index?: number;
    wind_speed: number;
    wind_deg: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    sunrise: number;
    sunset: number;
  };
  forecast: Array<{
    date: string;
    temp: { min: number; max: number };
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    humidity: number;
    wind_speed: number;
    pop: number; // Probability of precipitation
  }>;
  alerts?: Array<{
    sender_name: string;
    event: string;
    description: string;
    start: number;
    end: number;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  }>;
}

const getWeatherIcon = (iconCode: string, main: string) => {
  const iconMap: { [key: string]: any } = {
    '01d': Sun, '01n': Sun,
    '02d': Cloud, '02n': Cloud,
    '03d': Cloud, '03n': Cloud, 
    '04d': Cloud, '04n': Cloud,
    '09d': CloudDrizzle, '09n': CloudDrizzle,
    '10d': CloudRain, '10n': CloudRain,
    '11d': Zap, '11n': Zap,
    '13d': CloudSnow, '13n': CloudSnow,
    '50d': Cloud, '50n': Cloud,
  };

  return iconMap[iconCode] || Cloud;
};

const getAlertSeverityColor = (severity: string) => {
  switch (severity) {
    case 'extreme': return 'destructive';
    case 'severe': return 'destructive';
    case 'moderate': return 'warning';
    case 'minor': return 'secondary';
    default: return 'secondary';
  }
};

export const WeatherWidget: React.FC = () => {
  const { makeRequest, loading } = useApiProxy();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedForecast, setExpandedForecast] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to access your location. Please search for a city.');
          // Default to London as fallback
          fetchWeatherData(51.5074, -0.1278, 'London, UK');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      // Default to London as fallback
      fetchWeatherData(51.5074, -0.1278, 'London, UK');
    }
  }, []);

  // Fetch weather data
  const fetchWeatherData = async (lat?: number, lon?: number, locationName?: string) => {
    try {
      setError(null);
      
      let params: any = {
        units: useFahrenheit ? 'imperial' : 'metric'
      };

      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
      } else if (location) {
        params.q = location;
      } else {
        return;
      }

      // Get current weather
      const currentResponse = await makeRequest({
        service: 'weather',
        endpoint: '/weather',
        params
      });

      if (!currentResponse.success) {
        throw new Error(currentResponse.error || 'Failed to fetch current weather');
      }

      const currentWeather = currentResponse.data;

      // Get 5-day forecast
      const forecastResponse = await makeRequest({
        service: 'weather', 
        endpoint: '/forecast',
        params
      });

      if (!forecastResponse.success) {
        throw new Error(forecastResponse.error || 'Failed to fetch weather forecast');
      }

      const forecastData = forecastResponse.data;

      // Process forecast data (group by day and get daily min/max)
      const dailyForecast: { [key: string]: any } = {};
      
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        
        if (!dailyForecast[date]) {
          dailyForecast[date] = {
            temps: [item.main.temp],
            weather: item.weather[0],
            humidity: item.main.humidity,
            wind_speed: item.wind.speed,
            pop: item.pop || 0
          };
        } else {
          dailyForecast[date].temps.push(item.main.temp);
          dailyForecast[date].pop = Math.max(dailyForecast[date].pop, item.pop || 0);
        }
      });

      const forecast = Object.entries(dailyForecast).slice(0, 7).map(([date, data]: [string, any]) => ({
        date,
        temp: {
          min: Math.round(Math.min(...data.temps)),
          max: Math.round(Math.max(...data.temps))
        },
        weather: data.weather,
        humidity: data.humidity,
        wind_speed: data.wind_speed,
        pop: Math.round(data.pop * 100)
      }));

      // Try to get weather alerts (some locations may not have this)
      let alerts = [];
      try {
        const alertsResponse = await makeRequest({
          service: 'weather',
          endpoint: '/onecall',
          params: {
            lat: currentWeather.coord.lat,
            lon: currentWeather.coord.lon,
            exclude: 'minutely,hourly,daily',
            units: useFahrenheit ? 'imperial' : 'metric'
          }
        });
        
        if (alertsResponse.success && alertsResponse.data.alerts) {
          alerts = alertsResponse.data.alerts;
        }
      } catch (alertError) {
        // Alerts API might not be available for all locations
        console.log('Weather alerts not available for this location');
      }

      const processedData: WeatherData = {
        location: {
          name: locationName || currentWeather.name,
          country: currentWeather.sys.country,
          lat: currentWeather.coord.lat,
          lon: currentWeather.coord.lon
        },
        current: {
          temp: Math.round(currentWeather.main.temp),
          feels_like: Math.round(currentWeather.main.feels_like),
          humidity: currentWeather.main.humidity,
          pressure: currentWeather.main.pressure,
          visibility: Math.round((currentWeather.visibility || 10000) / 1000),
          wind_speed: Math.round(currentWeather.wind.speed * (useFahrenheit ? 2.237 : 3.6)), // Convert m/s to mph or km/h
          wind_deg: currentWeather.wind.deg,
          weather: {
            main: currentWeather.weather[0].main,
            description: currentWeather.weather[0].description,
            icon: currentWeather.weather[0].icon
          },
          sunrise: currentWeather.sys.sunrise,
          sunset: currentWeather.sys.sunset
        },
        forecast,
        alerts
      };

      setWeatherData(processedData);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    }
  };

  // Search for location
  const handleLocationSearch = async () => {
    if (!location.trim()) return;
    await fetchWeatherData();
  };

  // Initial load and refresh when unit changes
  useEffect(() => {
    getCurrentLocation();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(() => {
      if (currentLocation) {
        fetchWeatherData(currentLocation.lat, currentLocation.lon);
      } else if (location) {
        fetchWeatherData();
      }
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [getCurrentLocation, useFahrenheit]); // Re-fetch when unit changes

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString([], { weekday: 'short' });
  };

  if (!weatherData && !error && loading) {
    return (
      <Card className="dashboard-card h-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Getting your location...</span>
        </div>
      </Card>
    );
  }

  const WeatherIcon = weatherData ? getWeatherIcon(
    weatherData.current.weather.icon, 
    weatherData.current.weather.main
  ) : Cloud;

  return (
    <Card className="dashboard-card h-full flex flex-col">
      <CardHeader className="widget-header pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            🌤️ Weather
            {weatherData && (
              <span className="text-xs font-normal text-muted-foreground">
                {weatherData.location.name}, {weatherData.location.country}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseFahrenheit(!useFahrenheit)}
              className="h-7 px-2 text-xs"
              title={`Switch to ${useFahrenheit ? 'Celsius' : 'Fahrenheit'}`}
            >
              <Thermometer className="h-3 w-3 mr-1" />
              {useFahrenheit ? '°F' : '°C'}
              {useFahrenheit ? (
                <ToggleRight className="h-3 w-3 ml-1" />
              ) : (
                <ToggleLeft className="h-3 w-3 ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentLocation ? 
                fetchWeatherData(currentLocation.lat, currentLocation.lon) : 
                fetchWeatherData()
              }
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Location Search */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search city..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              className="pl-8"
            />
          </div>
          <Button onClick={handleLocationSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={getCurrentLocation} 
            disabled={loading}
            title="Use current location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Weather Alerts */}
        {weatherData?.alerts && weatherData.alerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {weatherData.alerts.map((alert, index) => (
              <Alert key={index} variant={getAlertSeverityColor(alert.severity) as any}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <div className="font-medium">{alert.event}</div>
                  <div>{alert.description.substring(0, 100)}...</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Weather Content */}
        {weatherData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="forecast">
                {expandedForecast ? '7-Day' : 'Forecast'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="flex-1 overflow-y-auto">
              {/* Current Weather */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {weatherData.current.temp}°{useFahrenheit ? 'F' : 'C'}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {weatherData.current.weather.description}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Feels like {weatherData.current.feels_like}°{useFahrenheit ? 'F' : 'C'}
                    </div>
                  </div>
                  <WeatherIcon className="h-12 w-12 text-primary" />
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="space-y-1">
                    <Droplets className="h-4 w-4 text-blue-500 mx-auto" />
                    <div className="text-xs text-muted-foreground">Humidity</div>
                    <div className="text-sm font-medium">{weatherData.current.humidity}%</div>
                  </div>
                  <div className="space-y-1">
                    <Wind className="h-4 w-4 text-gray-500 mx-auto" />
                    <div className="text-xs text-muted-foreground">Wind</div>
                    <div className="text-sm font-medium">
                      {weatherData.current.wind_speed} {useFahrenheit ? 'mph' : 'km/h'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Eye className="h-4 w-4 text-purple-500 mx-auto" />
                    <div className="text-xs text-muted-foreground">Visibility</div>
                    <div className="text-sm font-medium">{weatherData.current.visibility} km</div>
                  </div>
                  <div className="space-y-1">
                    <Gauge className="h-4 w-4 text-orange-500 mx-auto" />
                    <div className="text-xs text-muted-foreground">Pressure</div>
                    <div className="text-sm font-medium">{weatherData.current.pressure} mb</div>
                  </div>
                </div>

                {/* Sun Times */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Sunrise</div>
                      <div className="text-sm font-medium">
                        {formatTime(weatherData.current.sunrise)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-xs text-muted-foreground">Sunset</div>
                      <div className="text-sm font-medium">
                        {formatTime(weatherData.current.sunset)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">
                    {expandedForecast ? '7-Day Forecast' : '3-Day Forecast'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedForecast(!expandedForecast)}
                    className="h-6 text-xs"
                  >
                    {expandedForecast ? (
                      <>Less <ChevronUp className="h-3 w-3 ml-1" /></>
                    ) : (
                      <>More <ChevronDown className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                </div>

                {weatherData.forecast
                  .slice(0, expandedForecast ? 7 : 3)
                  .map((day, index) => {
                    const ForecastIcon = getWeatherIcon(day.weather.icon, day.weather.main);
                    
                    return (
                      <div 
                        key={day.date} 
                        className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <ForecastIcon className="h-5 w-5 text-muted-foreground" />
                          <div className="min-w-[60px]">
                            <div className="text-sm font-medium">
                              {formatDay(day.date)}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {day.weather.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {day.pop > 0 && (
                            <div className="flex items-center gap-1">
                              <Droplets className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-muted-foreground">
                                {day.pop}%
                              </span>
                            </div>
                          )}
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {day.temp.max}°{useFahrenheit ? 'F' : 'C'} <span className="text-muted-foreground">{day.temp.min}°{useFahrenheit ? 'F' : 'C'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};