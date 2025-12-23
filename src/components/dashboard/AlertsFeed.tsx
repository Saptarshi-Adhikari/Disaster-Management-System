/**
 * ========================================
 * AlertsFeed.tsx - LIVE ALERTS COMPONENT
 * ========================================
 * 
 * This component shows a scrollable list of live alerts.
 * Each alert has a type (critical, warning, info, resolved),
 * a title, message, time, and location.
 * 
 * HOW IT WORKS:
 * 1. We have a list of sample alerts (in a real app, this would come from a database)
 * 2. Each alert type has different colors and icons
 * 3. We loop through the alerts and display each one
 */

// ---- IMPORTS ----
import { AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * ALERT TYPE DEFINITION
 * 
 * This describes what information each alert contains:
 * - id: Unique identifier for the alert
 * - type: How severe is the alert (critical, warning, info, resolved)
 * - title: Short headline
 * - message: Detailed description
 * - time: When the alert was posted
 * - location: Where the alert applies (optional)
 */
interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "resolved";
  title: string;
  message: string;
  time: string;
  location?: string;
}

/**
 * SAMPLE ALERTS DATA
 * 
 * In a real application, this data would come from a database.
 * For now, we use sample data to show how the component looks.
 */
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

/**
 * ALERT STYLING CONFIGURATION
 * 
 * This object defines how each alert type should look:
 * - icon: Which icon to show
 * - color: Text color
 * - bg: Background color
 * - badge: Badge style variant
 */
const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",      // Red text
    bg: "bg-destructive/10",        // Light red background
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",          // Yellow/orange text
    bg: "bg-warning/10",            // Light yellow background
    badge: "outline" as const,
  },
  info: {
    icon: Info,
    color: "text-info",             // Blue text
    bg: "bg-info/10",               // Light blue background
    badge: "secondary" as const,
  },
  resolved: {
    icon: CheckCircle,
    color: "text-success",          // Green text
    bg: "bg-success/10",            // Light green background
    badge: "outline" as const,
  },
};

/**
 * ALERTS FEED COMPONENT
 * 
 * Displays a card with a list of all alerts.
 */
export function AlertsFeed() {
  return (
    <Card variant="glass" className="slide-up">
      {/* ---- HEADER ---- */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Live Alerts
        </CardTitle>
        {/* "Live" indicator with pulsing dot */}
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          Live
        </Badge>
      </CardHeader>
      
      {/* ---- ALERTS LIST ---- */}
      {/* max-h-[400px] limits height, overflow-y-auto adds scrollbar when needed */}
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        
        {/* Loop through each alert and render it */}
        {alerts.map((alert) => {
          // Get the styling config for this alert type
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          
          return (
            // Individual alert item
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border border-border/50 transition-all hover:border-border",
                config.bg  // Apply background color based on alert type
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and badge row */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm truncate">{alert.title}</h4>
                    <Badge variant={config.badge} className="text-xs capitalize shrink-0">
                      {alert.type}
                    </Badge>
                  </div>
                  
                  {/* Message */}
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  
                  {/* Time and location */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </span>
                    {alert.location && (
                      <span className="truncate">{alert.location}</span>
                    )}
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
