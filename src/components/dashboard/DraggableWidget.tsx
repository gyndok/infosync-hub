import React from 'react';
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
        "h-full transition-all duration-200",
        isDragging && "opacity-80 shadow-lg scale-105",
        className
      )}
    >
      {children}
    </div>
  );
};