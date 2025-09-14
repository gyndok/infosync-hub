import React from "react";
import { RefreshCw, MapPin, Clock, AlertTriangle, X, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useHoustonTraffic } from "@/hooks/useHoustonTraffic";

// Safe time formatter
const formatTime = (timeString?: string) => {
  if (!timeString) return "";
  try {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const formatTimeAgo = (timeString: string) => {
  try {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  } catch {
    return "";
  }
};

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const severityConfig = {
    critical: { color: "bg-destructive/10 text-destructive", icon: "🚨" },
    high: {
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      icon: "⚠️",
    },
    medium: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: "⚡",
    },
    low: {
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: "💨",
    },
    info: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: "ℹ️",
    },
    warning: {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: "⚠️",
    },
    severe: { color: "bg-destructive/10 text-destructive", icon: "🚨" },
  };

  const config =
    severityConfig[severity as keyof typeof severityConfig] ||
    severityConfig.info;

  return (
    <Badge className={config.color}>
      <span className="mr-1">{config.icon}</span>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );
};

const TrafficIncidentItem: React.FC<{
  incident: any;
}> = ({ incident }) => (
  <div className="p-3 border-l-4 border-l-orange-500 bg-muted/30 rounded-r-lg mb-3">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{incident.title}</span>
          <SeverityBadge severity={incident.severity} />
        </div>
        {incident.description && (
          <p className="text-xs text-muted-foreground mb-2">
            {incident.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {incident.highway_road && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {incident.highway_road}
            </span>
          )}
          {incident.start_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Started {formatTime(incident.start_time)}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const MetroAlertItem: React.FC<{
  alert: any;
}> = ({ alert }) => (
  <div className="p-3 border-l-4 border-l-blue-500 bg-muted/30 rounded-r-lg mb-3">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{alert.title}</span>
          <SeverityBadge severity={alert.severity} />
        </div>
        {alert.description && (
          <p className="text-xs text-muted-foreground mb-2">
            {alert.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {alert.affected_routes && alert.affected_routes.length > 0 && (
            <span className="flex items-center gap-1">
              <span>Routes: {alert.affected_routes.join(", ")}</span>
            </span>
          )}
          {alert.start_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(alert.start_time)}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start space-x-3">
        <Skeleton className="h-4 w-4 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

interface HoustonTrafficWidgetProps {
  onRemove?: () => void;
}

export const HoustonTrafficWidget: React.FC<HoustonTrafficWidgetProps> = ({
  onRemove,
}) => {
  const {
    trafficIncidents,
    metroAlerts,
    isLoading,
    error,
    lastUpdated,
    refreshData,
  } = useHoustonTraffic();

  const totalAlerts = trafficIncidents.length + metroAlerts.length;

  return (
    <Card className="dashboard-card h-full">
      <CardHeader className="widget-header pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            🚗 Houston Traffic
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            >
              {totalAlerts} Active
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw
                className={cn("w-3 h-3", isLoading && "animate-spin")}
              />
            </Button>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {formatTimeAgo(lastUpdated.toISOString())}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0 h-full flex flex-col">
        {error && (
          <div className="p-4 text-center">
            <div className="text-destructive text-sm mb-2">
              ⚠️ Unable to load traffic data
            </div>
            <Button variant="outline" size="sm" onClick={refreshData}>
              Try Again
            </Button>
          </div>
        )}

        {isLoading && !error ? (
          <LoadingSkeleton />
        ) : totalAlerts === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-2">🚗</div>
            <p className="text-sm text-muted-foreground">
              No active traffic alerts
            </p>
            <p className="text-xs text-muted-foreground">
              Houston traffic is flowing smoothly
            </p>
          </div>
        ) : (
          <div className="px-4 pb-4 overflow-y-auto max-h-96">
            {/* Traffic Incidents */}
            {trafficIncidents.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Traffic Incidents ({trafficIncidents.length})
                </h3>
                {trafficIncidents.slice(0, 5).map((incident) => (
                  <TrafficIncidentItem key={incident.id} incident={incident} />
                ))}
              </div>
            )}

            {/* Metro Alerts */}
            {metroAlerts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Metro Alerts ({metroAlerts.length})
                </h3>
                {metroAlerts.slice(0, 3).map((alert) => (
                  <MetroAlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
