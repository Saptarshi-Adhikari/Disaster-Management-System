import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "resolved";
  title: string;
  message: string;
  time: string;
  location?: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Flash Flood Warning",
    message: "Immediate evacuation required for Zone A residents",
    time: "2 min ago",
    location: "Downtown District"
  },
  {
    id: "2",
    type: "warning",
    title: "Power Outage",
    message: "Grid failure affecting 5,000+ homes in the northern sector",
    time: "15 min ago",
    location: "North Sector"
  },
  {
    id: "3",
    type: "info",
    title: "Shelter Opening",
    message: "Central Community Center now accepting evacuees",
    time: "32 min ago",
    location: "Central Area"
  },
  {
    id: "4",
    type: "resolved",
    title: "Road Cleared",
    message: "Highway 101 debris removed, traffic flowing normally",
    time: "1 hour ago",
    location: "Highway 101"
  },
];

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    badge: "outline" as const,
  },
  info: {
    icon: Info,
    color: "text-info",
    bg: "bg-info/10",
    badge: "secondary" as const,
  },
  resolved: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    badge: "outline" as const,
  },
};

export function AlertsFeed() {
  return (
    <Card variant="glass" className="slide-up">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Live Alerts
        </CardTitle>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          Live
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border border-border/50 transition-all hover:border-border",
                config.bg
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm truncate">{alert.title}</h4>
                    <Badge variant={config.badge} className="text-xs capitalize shrink-0">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </span>
                    {alert.location && <span className="truncate">{alert.location}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
