import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, X, Maximize2, Minimize2 } from 'lucide-react';

interface WidgetContainerProps {
  children: ReactNode;
  title: string;
  onSettings?: () => void;
  onRemove?: () => void;
  onResize?: () => void;
  isMaximized?: boolean;
  className?: string;
}

const WidgetContainer = ({
  children,
  title,
  onSettings,
  onRemove,
  onResize,
  isMaximized = false,
  className = '',
}: WidgetContainerProps) => {
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-sm">{title}</h3>
        <div className="flex items-center gap-1">
          {onSettings && (
            <Button variant="ghost" size="sm" onClick={onSettings}>
              <Settings className="h-3 w-3" />
            </Button>
          )}
          {onResize && (
            <Button variant="ghost" size="sm" onClick={onResize}>
              {isMaximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </Card>
  );
};

export default WidgetContainer;