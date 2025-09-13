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

export const ClockWidget = () => {
  const { user } = useAuth();
  const { customCities, addCustomCity, removeCustomCity } = useCustomCities();
  const [now, setNow] = useState(new Date());
  const [selectedTimezones, setSelectedTimezones] = useState<TimeZoneConfig[]>([
    AVAILABLE_TIMEZONES[0], // Local time
    AVAILABLE_TIMEZONES[1], // New York
    AVAILABLE_TIMEZONES[2], // London
    AVAILABLE_TIMEZONES[3], // Tokyo
    AVAILABLE_TIMEZONES[4], // Sydney
  ]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newCityInput, setNewCityInput] = useState('');
  const [newTimezoneInput, setNewTimezoneInput] = useState('');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  const addTimezone = (timezoneId: string) => {
    const timezone = allAvailableTimezones.find(tz => tz.id === timezoneId);
    if (timezone && !selectedTimezones.find(tz => tz.id === timezoneId)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
  };

  const removeTimezone = async (timezoneId: string) => {
    if (selectedTimezones.length > 1) {
      // Remove from selected timezones
      setSelectedTimezones(selectedTimezones.filter(tz => tz.id !== timezoneId));
      
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
    }
  };

  return (
    <WidgetContainer 
      title="WORLD CLOCKS" 
      className="h-full"
      onSettings={() => setIsSettingsOpen(true)}
    >
      <div className="h-full flex flex-col p-6 bg-card">
        {/* Main clock display */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex gap-8 flex-wrap justify-center">
            {selectedTimezones.map((tz) => (
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