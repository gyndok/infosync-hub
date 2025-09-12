import React from 'react';
import { 
  BarChart3, 
  Calendar, 
  Home, 
  Settings, 
  Users, 
  Puzzle,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Puzzle, label: 'Widgets Library' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Calendar, label: 'Calendar' },
  { icon: Users, label: 'Team' },
];

const generalItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
  { icon: LogOut, label: 'Logout' },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="h-full bg-sidebar-bg border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">InfoWall</span>
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Menu
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={cn(
                  "sidebar-item",
                  item.active && "active"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* General Section */}
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
            General
          </div>
          <nav className="space-y-1">
            {generalItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className="sidebar-item"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};