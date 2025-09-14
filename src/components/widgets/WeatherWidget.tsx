import { useState, useEffect, useCallback } from "react";
import { useApiProxy } from "@/hooks/useApiProxy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Zap,
  CloudDrizzle,
  Search,
  RefreshCw,
  AlertTriangle,
  Navigation,
  X,
} from "lucide-react";

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
    severity: "minor" | "moderate" | "severe" | "extreme";
  }>;
}

const getWeatherIcon = (iconCode: string, main: string) => {
  const iconMap: { [key: string]: any } = {
    "01d": Sun,
    "01n": Sun,
    "02d": Cloud,
    "02n": Cloud,
    "03d": Cloud,
    "03n": Cloud,
    "04d": Cloud,
    "04n": Cloud,
    "09d": CloudDrizzle,
    "09n": CloudDrizzle,
    "10d": CloudRain,
    "10n": CloudRain,
    "11d": Zap,
    "11n": Zap,
    "13d": CloudSnow,
    "13n": CloudSnow,
    "50d": Cloud,
    "50n": Cloud,
  };

  return iconMap[iconCode] || Cloud;
};

const getAlertSeverityColor = (severity: string) => {
  switch (severity) {
    case "extreme":
      return "destructive";
    case "severe":
      return "destructive";
    case "moderate":
      return "warning";
    case "minor":
      return "secondary";
    default:
      return "secondary";
  }
};

// Normalize user-entered city searches to OpenWeather format
// Examples:
//  - "Sacramento, ca" -> "Sacramento,CA,US"
//  - "Toronto, ca" -> "Toronto,CA"
//  - "Paris" -> "Paris" (unchanged)
const US_STATE_CODES = new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "PR",
  "VI",
  "GU",
  "AS",
  "MP",
]);

const normalizeLocationQuery = (input: string) => {
  const raw = (input || "").trim();
  if (!raw) return raw;
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 2) {
    const [city, region] = parts;
    const regionUpper = region.toUpperCase();
    if (US_STATE_CODES.has(regionUpper)) {
      // Assume US when a valid state code is provided
      return `${city},${regionUpper},US`;
    }
    // If it's likely a country code
    if (region.length === 2) {
      return `${city},${regionUpper}`;
    }
    return `${city},${region}`;
  }

  if (parts.length === 3) {
    const [city, region, country] = parts;
    return `${city},${region.toUpperCase()},${country.toUpperCase()}`;
  }

  return raw;
};

interface WeatherWidgetProps {
  onRemove?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onRemove }) => {
  const { makeRequest, loading } = useApiProxy();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedForecast, setExpandedForecast] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [useFahrenheit, setUseFahrenheit] = useState(true);

  // Convert temperature between Celsius and Fahrenheit
  const convertTemp = (temp: number, toFahrenheit: boolean) => {
    return toFahrenheit
      ? Math.round((temp * 9) / 5 + 32)
      : Math.round(((temp - 32) * 5) / 9);
  };

  // Get displayed temperature (convert if needed)
  const getDisplayTemp = (temp: number) => {
    // The API returns data in the units we requested, so no conversion needed
    return Math.round(temp);
  };

  // Handle unit toggle with immediate re-fetch
  const handleUnitToggle = async () => {
    const newUseFahrenheit = !useFahrenheit;
    setUseFahrenheit(newUseFahrenheit);

    // Immediately re-fetch data with new units
    if (currentLocation) {
      await fetchWeatherData(currentLocation.lat, currentLocation.lon);
    } else if (location) {
      await fetchWeatherData();
    }
  };

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Unable to access your location. Please search for a city.");
          // Default to London as fallback
          fetchWeatherData(51.5074, -0.1278, "London, UK");
        },
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      // Default to London as fallback
      fetchWeatherData(51.5074, -0.1278, "London, UK");
    }
  }, []);

  // Fetch weather data
  const fetchWeatherData = async (
    lat?: number,
    lon?: number,
    locationName?: string,
  ) => {
    try {
      setError(null);

      let params: any = {
        units: useFahrenheit ? "imperial" : "metric",
      };

      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
      } else if (location) {
        const normalized = normalizeLocationQuery(location);
        params.q = normalized;
      } else {
        return;
      }

      // Get current weather
      const currentResponse = await makeRequest({
        service: "weather",
        endpoint: "/weather",
        params,
      });

      if (!currentResponse.success) {
        throw new Error(
          currentResponse.error || "Failed to fetch current weather",
        );
      }

      const currentWeather = currentResponse.data;

      // Get 5-day forecast
      const forecastResponse = await makeRequest({
        service: "weather",
        endpoint: "/forecast",
        params,
      });

      if (!forecastResponse.success) {
        throw new Error(
          forecastResponse.error || "Failed to fetch weather forecast",
        );
      }

      const forecastData = forecastResponse.data;

      // Process forecast data (group by day and get daily min/max)
      const dailyForecast: { [key: string]: any } = {};

      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split("T")[0];

        if (!dailyForecast[date]) {
          dailyForecast[date] = {
            temps: [item.main.temp],
            weather: item.weather[0],
            humidity: item.main.humidity,
            wind_speed: item.wind.speed,
            pop: item.pop || 0,
          };
        } else {
          dailyForecast[date].temps.push(item.main.temp);
          dailyForecast[date].pop = Math.max(
            dailyForecast[date].pop,
            item.pop || 0,
          );
        }
      });

      const forecast = Object.entries(dailyForecast)
        .slice(0, 7)
        .map(([date, data]: [string, any]) => ({
          date,
          temp: {
            min: Math.round(Math.min(...data.temps)),
            max: Math.round(Math.max(...data.temps)),
          },
          weather: data.weather,
          humidity: data.humidity,
          wind_speed: data.wind_speed,
          pop: Math.round(data.pop * 100),
        }));

      // Try to get weather alerts (some locations may not have this)
      let alerts = [];
      try {
        const alertsResponse = await makeRequest({
          service: "weather",
          endpoint: "/onecall",
          params: {
            lat: currentWeather.coord.lat,
            lon: currentWeather.coord.lon,
            exclude: "minutely,hourly,daily",
            units: useFahrenheit ? "imperial" : "metric",
          },
        });

        if (alertsResponse.success && alertsResponse.data.alerts) {
          alerts = alertsResponse.data.alerts;
        }
      } catch (alertError) {
        // Alerts API might not be available for all locations
        console.log("Weather alerts not available for this location");
      }

      const processedData: WeatherData = {
        location: {
          name: locationName || currentWeather.name,
          country: currentWeather.sys.country,
          lat: currentWeather.coord.lat,
          lon: currentWeather.coord.lon,
        },
        current: {
          temp: Math.round(currentWeather.main.temp),
          feels_like: Math.round(currentWeather.main.feels_like),
          humidity: currentWeather.main.humidity,
          pressure: currentWeather.main.pressure,
          visibility: Math.round((currentWeather.visibility || 10000) / 1000),
          wind_speed: Math.round(
            currentWeather.wind.speed * (useFahrenheit ? 2.237 : 3.6),
          ), // Convert m/s to mph or km/h
          wind_deg: currentWeather.wind.deg,
          weather: {
            main: currentWeather.weather[0].main,
            description: currentWeather.weather[0].description,
            icon: currentWeather.weather[0].icon,
          },
          sunrise: currentWeather.sys.sunrise,
          sunset: currentWeather.sys.sunset,
        },
        forecast,
        alerts,
      };

      setWeatherData(processedData);
      setLastUpdated(new Date());
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : "Failed to fetch weather data";
      const friendlyMessage =
        /404/.test(rawMessage) || /city not found/i.test(rawMessage)
          ? 'City not found. Try "City, State, Country" (e.g., "Sacramento, CA, US").'
          : rawMessage;
      setError(friendlyMessage);
      console.error("Weather fetch error:", err);
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
  }, [getCurrentLocation]);

  // Re-fetch when units change
  useEffect(() => {
    if (weatherData) {
      if (currentLocation) {
        fetchWeatherData(currentLocation.lat, currentLocation.lon);
      } else if (location) {
        fetchWeatherData();
      }
    }
  }, [useFahrenheit]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (currentLocation) {
          fetchWeatherData(currentLocation.lat, currentLocation.lon);
        } else if (location) {
          fetchWeatherData();
        }
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [currentLocation, location]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString([], { weekday: "short" });
  };

  if (!weatherData && !error && loading) {
    return (
      <div className="h-full bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="flex items-center gap-2 text-white">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Getting your location...</span>
        </div>
      </div>
    );
  }

  const WeatherIcon = weatherData
    ? getWeatherIcon(
        weatherData.current.weather.icon,
        weatherData.current.weather.main,
      )
    : Cloud;

  return (
    <div className="h-full bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 rounded-xl overflow-hidden relative">
      {/* Header Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUnitToggle}
          className="h-7 px-2 text-xs text-white/80 hover:text-white hover:bg-white/10"
          title={`Switch to ${useFahrenheit ? "Celsius" : "Fahrenheit"}`}
          disabled={loading}
        >
          {useFahrenheit ? "°F" : "°C"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            currentLocation
              ? fetchWeatherData(currentLocation.lat, currentLocation.lon)
              : fetchWeatherData()
          }
          disabled={loading}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Bar - Hidden by default, can be toggled */}
      <div className="absolute top-3 left-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setActiveTab(activeTab === "search" ? "current" : "search")
          }
          className="text-white/80 hover:text-white hover:bg-white/10"
          title="Search location"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {activeTab === "search" && (
        <div className="absolute top-14 left-3 right-3 z-10 flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search city..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>
          <Button
            onClick={handleLocationSearch}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            variant="outline"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={loading}
            title="Use current location"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-16 left-3 right-3 z-10">
          <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Weather Content */}
      {weatherData ? (
        <div className="h-full flex flex-col text-white">
          {/* Top Section - Location and Date */}
          <div className="p-6 pb-0">
            <h2 className="text-xl font-medium mb-1">
              {weatherData.location.name}
            </h2>
            <p className="text-white/70 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>

          {/* Main Weather Display */}
          <div className="flex-1 flex items-center justify-between p-6">
            {/* Left Side - Temperature and Description */}
            <div className="flex flex-col">
              <div className="text-5xl md:text-6xl font-light mb-2">
                +{getDisplayTemp(weatherData.current.temp)}°
              </div>
              <div className="space-y-1">
                <div className="text-lg font-medium capitalize">
                  {weatherData.current.weather.description}
                </div>
                <div className="text-white/70 text-sm">
                  Feels like +{getDisplayTemp(weatherData.current.feels_like)}°
                </div>
              </div>
            </div>

            {/* Right Side - Weather Icon */}
            <div className="flex-shrink-0">
              <WeatherIcon className="h-20 w-20 md:h-24 md:w-24 text-yellow-300" />
            </div>
          </div>

          {/* Bottom Section - Forecast */}
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center gap-4 overflow-x-auto">
              {weatherData.forecast.slice(0, 6).map((day, index) => {
                const ForecastIcon = getWeatherIcon(
                  day.weather.icon,
                  day.weather.main,
                );

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center min-w-[60px] text-center"
                  >
                    <div className="text-white/80 text-xs mb-2">
                      {index === 0 ? "Today" : formatDay(day.date)}
                    </div>
                    <ForecastIcon className="h-8 w-8 text-yellow-200 mb-2" />
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        +{getDisplayTemp(day.temp.max)}°
                      </div>
                      <div className="text-xs text-white/60">
                        +{getDisplayTemp(day.temp.min)}°
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weather Alerts */}
          {weatherData.alerts && weatherData.alerts.length > 0 && (
            <div className="px-6 pb-4">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Weather Alert</span>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  {weatherData.alerts[0].event}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-white">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading weather...</span>
          </div>
        </div>
      )}
    </div>
  );
};
