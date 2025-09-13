import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableWidgetProps {
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ 
  children, 
  className,
  isDragging = false
}) => {
  return (
    <div 
      className={cn(
        "h-full transition-all duration-200 relative",
        isDragging && "opacity-80 shadow-lg scale-105",
        className
      )}
    >
      <div className="drag-handle absolute top-2 left-2 z-10 cursor-move p-1 hover:bg-muted/50 rounded opacity-0 hover:opacity-100 transition-opacity">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
};