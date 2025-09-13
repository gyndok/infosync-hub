import { useEffect, useState } from 'react';
import WidgetContainer from './WidgetContainer';

export const ClockWidget = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <WidgetContainer title="World Clock" className="h-full">
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{time}</div>
          <div className="mt-2 text-sm md:text-base text-muted-foreground">{date}</div>
        </div>
      </div>
    </WidgetContainer>
  );
};
