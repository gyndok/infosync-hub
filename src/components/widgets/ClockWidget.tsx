import { useEffect, useState } from 'react';
import { Settings, Plus, X } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface TimeZoneConfig {
  id: string;
  city: string;
  timezone: string;
}

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

export const ClockWidget = () => {
  const [now, setNow] = useState(new Date());
  const [selectedTimezones, setSelectedTimezones] = useState<TimeZoneConfig[]>([
    AVAILABLE_TIMEZONES[0], // Local time
    AVAILABLE_TIMEZONES[1], // New York
    AVAILABLE_TIMEZONES[2], // London
  ]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const addTimezone = (timezoneId: string) => {
    const timezone = AVAILABLE_TIMEZONES.find(tz => tz.id === timezoneId);
    if (timezone && !selectedTimezones.find(tz => tz.id === timezoneId)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
  };

  const removeTimezone = (timezoneId: string) => {
    if (selectedTimezones.length > 1) {
      setSelectedTimezones(selectedTimezones.filter(tz => tz.id !== timezoneId));
    }
  };

  const formatTime = (timezone: string) => {
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (timezone: string) => {
    return now.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeDifference = (timezone: string) => {
    const localOffset = now.getTimezoneOffset();
    const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const localDate = new Date(now.toLocaleString('en-US'));
    const diffHours = Math.round((targetDate.getTime() - localDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours === 0) return '';
    const sign = diffHours > 0 ? '+' : '';
    return `(${sign}${diffHours}h)`;
  };

  return (
    <WidgetContainer 
      title="World Clock" 
      className="h-full"
      onSettings={() => setIsSettingsOpen(true)}
    >
      <div className="h-full flex flex-col p-4 overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {selectedTimezones.map((tz) => (
            <div key={tz.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm text-foreground">{tz.city}</h3>
                  <span className="text-xs text-muted-foreground">
                    {getTimeDifference(tz.timezone)}
                  </span>
                </div>
                {selectedTimezones.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTimezone(tz.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {formatTime(tz.timezone)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(tz.timezone)}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>World Clock Settings</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Add Time Zone</label>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Current Time Zones</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTimezones.map(tz => (
                    <Badge key={tz.id} variant="secondary" className="flex items-center gap-1">
                      {tz.city}
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </WidgetContainer>
  );
};