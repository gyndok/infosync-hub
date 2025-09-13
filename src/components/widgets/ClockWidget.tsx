import { useEffect, useState } from 'react';
import { Settings, Plus, X } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomCities } from '@/hooks/useCustomCities';
import { useAuth } from '@/hooks/useAuth';
import { useClockConfig } from '@/hooks/useClockConfig';

interface TimeZoneConfig {
  id: string;
  city: string;
  timezone: string;
}

interface AnalogClockProps {
  timezone: string;
  city: string;
  time: Date;
}

const AnalogClock = ({ timezone, city, time }: AnalogClockProps) => {
  const localTime = new Date(time.toLocaleString('en-US', { timeZone: timezone }));
  const hours = localTime.getHours() % 12;
  const minutes = localTime.getMinutes();
  const seconds = localTime.getSeconds();

  const hourAngle = (hours * 30) + (minutes * 0.5);
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;

  const formatTime = () => {
    return localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mb-2">
        {/* Clock face */}
        <div className="absolute inset-0 border-2 border-muted-foreground rounded-full bg-card">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-3 bg-muted-foreground"
              style={{
                top: '4px',
                left: '50%',
                transformOrigin: '0 44px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
              }}
            />
          ))}
          
          {/* Hour hand */}
          <div
            className="absolute w-1 bg-destructive rounded-full origin-bottom"
            style={{
              height: '28px',
              left: '50%',
              bottom: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${hourAngle}deg)`,
            }}
          />
          
          {/* Minute hand */}
          <div
            className="absolute w-0.5 bg-foreground rounded-full origin-bottom"
            style={{
              height: '36px',
              left: '50%',
              bottom: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
            }}
          />
          
          {/* Second hand */}
          <div
            className="absolute w-px bg-destructive rounded-full origin-bottom"
            style={{
              height: '38px',
              left: '50%',
              bottom: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${secondAngle}deg)`,
            }}
          />
          
          {/* Center dot */}
          <div className="absolute w-2 h-2 bg-foreground rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm font-medium text-foreground">{city}</div>
        <div className="text-xs text-muted-foreground">{formatTime()}</div>
      </div>
    </div>
  );
};

const AVAILABLE_TIMEZONES: TimeZoneConfig[] = [
  { id: 'local', city: 'Local Time', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'ny', city: 'New York', timezone: 'America/New_York' },
  { id: 'london', city: 'London', timezone: 'Europe/London' },
  { id: 'tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 'sydney', city: 'Sydney', timezone: 'Australia/Sydney' },
  { id: 'dubai', city: 'Dubai', timezone: 'Asia/Dubai' },
  { id: 'singapore', city: 'Singapore', timezone: 'Asia/Singapore' },
  { id: 'paris', city: 'Paris', timezone: 'Europe/Paris' },
  { id: 'berlin', city: 'Berlin', timezone: 'Europe/Berlin' },
  { id: 'moscow', city: 'Moscow', timezone: 'Europe/Moscow' },
  { id: 'mumbai', city: 'Mumbai', timezone: 'Asia/Kolkata' },
  { id: 'shanghai', city: 'Shanghai', timezone: 'Asia/Shanghai' },
  { id: 'la', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
  { id: 'chicago', city: 'Chicago', timezone: 'America/Chicago' },
  { id: 'toronto', city: 'Toronto', timezone: 'America/Toronto' },
  { id: 'sao_paulo', city: 'São Paulo', timezone: 'America/Sao_Paulo' },
];

// Approximate longitude mapping for geographic ordering
const TIMEZONE_LONGITUDES: Record<string, number> = {
  // Americas (West)
  'America/Los_Angeles': -118,
  'America/Denver': -105,
  'America/Phoenix': -112,
  'America/Chicago': -87,
  'America/New_York': -74,
  'America/Toronto': -79,
  'America/Mexico_City': -99,
  'America/Bogota': -74,
  'America/Caracas': -67,
  'America/Sao_Paulo': -47,
  'America/Argentina/Buenos_Aires': -58,
  
  // Europe/Africa
  'Europe/London': 0,
  'Europe/Paris': 2,
  'Europe/Berlin': 13,
  'Europe/Rome': 12,
  'Europe/Madrid': -4,
  'Europe/Amsterdam': 5,
  'Europe/Brussels': 4,
  'Europe/Vienna': 16,
  'Europe/Prague': 14,
  'Europe/Warsaw': 21,
  'Europe/Budapest': 19,
  'Europe/Athens': 24,
  'Europe/Stockholm': 18,
  'Europe/Helsinki': 25,
  'Europe/Oslo': 11,
  'Europe/Copenhagen': 12,
  'Europe/Dublin': -6,
  'Europe/Kiev': 30,
  'Europe/Moscow': 38,
  'Europe/Istanbul': 29,
  'Africa/Cairo': 31,
  'Africa/Johannesburg': 28,
  'Africa/Lagos': 3,
  
  // Asia
  'Asia/Dubai': 55,
  'Asia/Tehran': 51,
  'Asia/Baghdad': 44,
  'Asia/Riyadh': 47,
  'Asia/Karachi': 67,
  'Asia/Kolkata': 77,
  'Asia/Dhaka': 90,
  'Asia/Bangkok': 100,
  'Asia/Jakarta': 107,
  'Asia/Singapore': 104,
  'Asia/Manila': 121,
  'Asia/Hong_Kong': 114,
  'Asia/Shanghai': 121,
  'Asia/Seoul': 127,
  'Asia/Tokyo': 140,
  
  // Australia/Pacific
  'Australia/Perth': 116,
  'Australia/Adelaide': 139,
  'Australia/Melbourne': 145,
  'Australia/Sydney': 151,
  'Australia/Brisbane': 153,
  'Pacific/Auckland': 175,
  'Pacific/Fiji': 178,
  'Pacific/Honolulu': -158,
};

// Get approximate longitude for a timezone
const getTimezoneLongitude = (timezone: string): number => {
  // Check direct mapping first
  if (TIMEZONE_LONGITUDES[timezone]) {
    return TIMEZONE_LONGITUDES[timezone];
  }
  
  // Fallback: estimate based on timezone offset
  try {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (0)); // UTC time
    const localTime = new Date(targetTime.toLocaleString('en-US', { timeZone: timezone }));
    const offsetHours = (localTime.getTime() - targetTime.getTime()) / (1000 * 60 * 60);
    
    // Rough approximation: 15 degrees longitude per hour
    return offsetHours * 15;
  } catch {
    return 0; // Default to Greenwich
  }
};

// Common timezones for custom city selection
const COMMON_TIMEZONES = [
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
  'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Caracas',
  'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Mexico_City',
  'America/New_York', 'America/Phoenix', 'America/Sao_Paulo', 'America/Toronto',
  'Asia/Baghdad', 'Asia/Bangkok', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Hong_Kong',
  'Asia/Jakarta', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Manila', 'Asia/Riyadh',
  'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tehran', 'Asia/Tokyo',
  'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney',
  'Europe/Amsterdam', 'Europe/Athens', 'Europe/Berlin', 'Europe/Brussels', 'Europe/Budapest',
  'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Helsinki', 'Europe/Istanbul', 'Europe/Kiev',
  'Europe/London', 'Europe/Madrid', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris',
  'Europe/Prague', 'Europe/Rome', 'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw',
  'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Honolulu',
];

interface ClockWidgetProps {
  onRemove?: () => void;
}

export const ClockWidget = ({ onRemove }: ClockWidgetProps = {}) => {
  const { user } = useAuth();
  const { customCities, addCustomCity, removeCustomCity } = useCustomCities();
  const { clockSettings, saveClockConfig, isLoading: isClockLoading } = useClockConfig();
  const [now, setNow] = useState(new Date());
  const [selectedTimezones, setSelectedTimezones] = useState<TimeZoneConfig[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newCityInput, setNewCityInput] = useState('');
  const [newTimezoneInput, setNewTimezoneInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Load saved clock settings
  useEffect(() => {
    if (!isClockLoading && clockSettings) {
      const loadedTimezones = clockSettings.selectedTimezones.map(saved => ({
        id: saved.id,
        city: saved.city,
        timezone: saved.timezone,
        ...(saved.isCustom && { isCustom: saved.isCustom, customId: saved.customId })
      }));
      setSelectedTimezones(loadedTimezones);
    }
  }, [clockSettings, isClockLoading]);

  // Combine predefined timezones with custom cities
  const allAvailableTimezones = [
    ...AVAILABLE_TIMEZONES,
    ...customCities.map(city => ({
      id: `custom-${city.id}`,
      city: city.city_name,
      timezone: city.timezone,
      isCustom: true,
      customId: city.id,
    }))
  ];

  // Save selected timezones to user preferences
  const saveSelectedTimezones = async (timezones: TimeZoneConfig[]) => {
    if (!user) return;
    
    const savedTimezones = timezones.map(tz => ({
      id: tz.id,
      city: tz.city,
      timezone: tz.timezone,
      ...(((tz as any).isCustom) && { 
        isCustom: (tz as any).isCustom, 
        customId: (tz as any).customId 
      })
    }));

    await saveClockConfig({
      selectedTimezones: savedTimezones
    });
  };
  // Sort timezones geographically with local time in the center
  const sortTimezonesGeographically = (timezones: TimeZoneConfig[]) => {
    const localTz = timezones.find(tz => tz.id === 'local');
    const otherTimezones = timezones.filter(tz => tz.id !== 'local');
    
    if (!localTz) {
      // No local timezone, just sort by longitude
      return otherTimezones.sort((a, b) => 
        getTimezoneLongitude(a.timezone) - getTimezoneLongitude(b.timezone)
      );
    }
    
    const localLongitude = getTimezoneLongitude(localTz.timezone);
    
    // Separate timezones into west and east of local
    const westTimezones = otherTimezones
      .filter(tz => getTimezoneLongitude(tz.timezone) < localLongitude)
      .sort((a, b) => getTimezoneLongitude(b.timezone) - getTimezoneLongitude(a.timezone)); // Descending for west
    
    const eastTimezones = otherTimezones
      .filter(tz => getTimezoneLongitude(tz.timezone) >= localLongitude)
      .sort((a, b) => getTimezoneLongitude(a.timezone) - getTimezoneLongitude(b.timezone)); // Ascending for east
    
    // Arrange with local in the middle
    const totalLength = timezones.length;
    const localIndex = Math.floor(totalLength / 2);
    
    const result: TimeZoneConfig[] = new Array(totalLength);
    result[localIndex] = localTz;
    
    // Fill west side (left of local)
    let westIndex = localIndex - 1;
    for (const tz of westTimezones) {
      if (westIndex >= 0) {
        result[westIndex] = tz;
        westIndex--;
      }
    }
    
    // Fill east side (right of local)  
    let eastIndex = localIndex + 1;
    for (const tz of eastTimezones) {
      if (eastIndex < totalLength) {
        result[eastIndex] = tz;
        eastIndex++;
      }
    }
    
    // Fill any remaining slots
    const remaining = [...westTimezones, ...eastTimezones].filter(tz => !result.includes(tz));
    for (let i = 0; i < result.length; i++) {
      if (!result[i] && remaining.length > 0) {
        result[i] = remaining.shift()!;
      }
    }
    
    return result.filter(Boolean); // Remove any undefined slots
  };

  const addTimezone = async (timezoneId: string) => {
    const timezone = allAvailableTimezones.find(tz => tz.id === timezoneId);
    if (timezone && !selectedTimezones.find(tz => tz.id === timezoneId)) {
      const newTimezones = [...selectedTimezones, timezone];
      const sortedTimezones = sortTimezonesGeographically(newTimezones);
      setSelectedTimezones(sortedTimezones);
      await saveSelectedTimezones(sortedTimezones);
    }
  };

  const removeTimezone = async (timezoneId: string) => {
    if (selectedTimezones.length > 1) {
      // Remove from selected timezones
      const newTimezones = selectedTimezones.filter(tz => tz.id !== timezoneId);
      const sortedTimezones = sortTimezonesGeographically(newTimezones);
      setSelectedTimezones(sortedTimezones);
      await saveSelectedTimezones(sortedTimezones);
      
      // If it's a custom city, also delete from database
      const timezone = allAvailableTimezones.find(tz => tz.id === timezoneId);
      if (timezone && (timezone as any).isCustom && (timezone as any).customId) {
        await removeCustomCity((timezone as any).customId);
      }
    }
  };

  const handleAddCustomCity = async () => {
    if (!newCityInput.trim() || !newTimezoneInput.trim()) return;
    
    const success = await addCustomCity(newCityInput.trim(), newTimezoneInput);
    if (success) {
      setNewCityInput('');
      setNewTimezoneInput('');
      
      // Re-sort timezones after adding custom city and save
      setTimeout(async () => {
        const sortedTimezones = sortTimezonesGeographically(selectedTimezones);
        setSelectedTimezones(sortedTimezones);
        await saveSelectedTimezones(sortedTimezones);
      }, 100);
    }
  };

  // Re-sort and save when custom cities are loaded
  useEffect(() => {
    if (customCities.length > 0 && selectedTimezones.length > 0) {
      const sortedTimezones = sortTimezonesGeographically(selectedTimezones);
      setSelectedTimezones(sortedTimezones);
      // Don't auto-save here to avoid infinite loops during loading
    }
  }, [customCities]);

  return (
    <WidgetContainer 
      title="WORLD CLOCKS" 
      className="h-full"
      onSettings={() => setIsSettingsOpen(true)}
      onRemove={onRemove}
    >
      <div className="h-full flex flex-col p-6 bg-card">
        {/* Main clock display */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex gap-8 flex-wrap justify-center">
            {sortTimezonesGeographically(selectedTimezones).map((tz) => (
              <div key={tz.id} className="group relative">
                <AnalogClock 
                  timezone={tz.timezone}
                  city={tz.city}
                  time={now}
                />
                {selectedTimezones.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    onClick={() => removeTimezone(tz.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick add from predefined cities */}
        <div className="flex justify-center mt-4">
          <div className="flex gap-2 items-center">
            <Select onValueChange={addTimezone}>
              <SelectTrigger className="w-48 h-8 text-sm">
                <SelectValue placeholder="Add a city" />
              </SelectTrigger>
              <SelectContent>
                {allAvailableTimezones
                  .filter(tz => !selectedTimezones.find(selected => selected.id === tz.id))
                  .map(tz => (
                    <SelectItem key={tz.id} value={tz.id}>
                      {tz.city}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>World Clock Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Add Predefined City</label>
                <Select onValueChange={addTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_TIMEZONES
                      .filter(tz => !selectedTimezones.find(selected => selected.id === tz.id))
                      .map(tz => (
                        <SelectItem key={tz.id} value={tz.id}>
                          {tz.city}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {user && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-3 block">Add Custom City</label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="city-name" className="text-xs text-muted-foreground">
                        City Name
                      </Label>
                      <Input
                        id="city-name"
                        placeholder="e.g., Madrid, Bangkok, Istanbul"
                        value={newCityInput}
                        onChange={(e) => setNewCityInput(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone" className="text-xs text-muted-foreground">
                        Time Zone
                      </Label>
                      <Select value={newTimezoneInput} onValueChange={setNewTimezoneInput}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {COMMON_TIMEZONES.map(tz => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddCustomCity} 
                      className="w-full"
                      disabled={!newCityInput.trim() || !newTimezoneInput.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom City
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Current Time Zones</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTimezones.map(tz => (
                    <Badge 
                      key={tz.id} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                    >
                      {tz.city}
                      {(tz as any).isCustom && (
                        <span className="text-xs opacity-60">(custom)</span>
                      )}
                      {selectedTimezones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTimezone(tz.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Sign in to add and save custom cities to your world clock.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </WidgetContainer>
  );
};