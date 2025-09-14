import React from "react";
import {
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const TopBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await signOut();
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleApiHealthClick = () => {
    navigate("/admin/api-health");
  };

  return (
    <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Left Section - Title and Search */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your information feeds with ease.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search feeds, widgets, or data..."
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Right Section - Actions and Profile */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Widget
        </Button>

        <Button variant="default" size="sm">
          Import Data
        </Button>

        {/* Notification Bell */}
        <Button variant="ghost" size="sm">
          <Bell className="w-4 h-4" />
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 ml-2 p-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {userInitials}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">
                  {user?.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  Dashboard User
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleProfileClick}>
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleApiHealthClick}>
              <Shield className="w-4 h-4 mr-2" />
              API Health Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
