import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AlertType = "critical" | "warning" | "info" | "resolved";

interface Alert {
  id: string;
  type: AlertType;
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
    location: "Downtown District",
  },
  {
    id: "2",
    type: "warning",
    title: "Power Outage",
    message: "Grid failure affecting 5,000+ homes in the northern sector",
    time: "15 min ago",
    location: "North Sector",
  },
  {
    id: "3",
    type: "info",
    title: "Shelter Opening",
    message: "Central Community Center now accepting evacuees",
    time: "32 min ago",
    location: "Central Area",
  },
  {
    id: "4",
    type: "resolved",
    title: "Road Cleared",
    message: "Highway 101 debris removed, traffic flowing normally",
    time: "1 hour ago",
    location: "Highway 101",
  },
];

const alertConfig: Record<
  AlertType,
  {
    icon: typeof AlertTriangle;
    color: string;
    bg: string;
    badge: "destructive" | "outline" | "secondary";
  }
> = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badge: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    badge: "outline",
  },
  info: {
    icon: Info,
    color: "text-info",
    bg: "bg-info/10",
    badge: "secondary",
  },
  resolved: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    badge: "outline",
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
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          Live
        </Badge>
      </CardHeader>

      <CardContent className="max-h-[400px] space-y-4 overflow-y-auto">
        {alerts.map(({ id, type, title, message, time, location }) => {
          const { icon: Icon, color, bg, badge } = alertConfig[type];

          return (
            <div
              key={id}
              className={cn(
                "rounded-lg border border-border/50 p-4 transition-all hover:border-border",
                bg
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("rounded-lg p-2", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold">{title}</h4>
                    <Badge variant={badge} className="shrink-0 text-xs capitalize">
                      {type}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {time}
                    </span>
                    {location && <span className="truncate">{location}</span>}
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
