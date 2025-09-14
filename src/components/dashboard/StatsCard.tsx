import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: LucideIcon;
  variant?: "default" | "primary";
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
  className,
}) => {
  return (
    <div
      className={cn(
        "stat-card",
        variant === "primary" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            "text-sm font-medium",
            variant === "primary"
              ? "text-primary-foreground/80"
              : "text-muted-foreground",
          )}
        >
          {title}
        </h3>
        {Icon && (
          <div
            className={cn(
              "p-2 rounded-lg",
              variant === "primary" ? "bg-primary-foreground/20" : "bg-accent",
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                variant === "primary"
                  ? "text-primary-foreground"
                  : "text-accent-foreground",
              )}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div
          className={cn(
            "text-3xl font-bold",
            variant === "primary"
              ? "text-primary-foreground"
              : "text-foreground",
          )}
        >
          {value}
        </div>

        {change && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                variant === "primary"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-success/10 text-success",
                changeType === "decrease" &&
                  "bg-destructive/10 text-destructive",
              )}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
