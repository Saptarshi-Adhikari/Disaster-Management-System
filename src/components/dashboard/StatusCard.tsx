/**
 * ========================================
 * StatusCard.tsx - STATISTICS CARD
 * ========================================
 * 
 * This is a reusable card component that displays
 * a single statistic with an icon, title, value, and optional trend.
 * 
 * PROPS (inputs the component accepts):
 * - icon: The icon to show (from Lucide icons)
 * - title: The label text (e.g., "Active Alerts")
 * - value: The main number or text to display
 * - subtitle: Additional info below the value (optional)
 * - variant: Color scheme (default, emergency, safe, warning, info)
 * - trend: Shows if the value is going up, down, or stable (optional)
 */

// ---- IMPORTS ----
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * PROPS INTERFACE
 * 
 * This defines what inputs the component accepts.
 * Think of it like a contract - if you use this component,
 * you must provide these values.
 */
interface StatusCardProps {
  icon: LucideIcon;                    // Required: the icon component
  title: string;                       // Required: the label text
  value: string | number;              // Required: the main value
  subtitle?: string;                   // Optional: extra info
  variant?: "default" | "emergency" | "safe" | "warning" | "info";  // Optional: color
  trend?: "up" | "down" | "stable";    // Optional: trend indicator
}

/**
 * STATUS CARD COMPONENT
 * 
 * We use "destructuring" to extract the props.
 * The { icon: Icon, ... } renames 'icon' to 'Icon' so we can use it as a component.
 */
export function StatusCard({ 
  icon: Icon,           // Rename to Icon (capital I) so we can use it as <Icon />
  title, 
  value, 
  subtitle, 
  variant = "default",  // Default to "default" if not specified
  trend 
}: StatusCardProps) {
  
  /**
   * ICON STYLE VARIANTS
   * 
   * Different colors for the icon based on the card variant.
   */
  const iconVariants = {
    default: "bg-primary/10 text-primary",           // Blue
    emergency: "bg-destructive/10 text-destructive", // Red
    safe: "bg-success/10 text-success",              // Green
    warning: "bg-warning/10 text-warning",           // Yellow/Orange
    info: "bg-info/10 text-info",                    // Light Blue
  };

  return (
    <Card variant={variant === "default" ? "glass" : variant} className="slide-up">
      <CardContent className="p-6">
        
        {/* ---- TOP ROW: Icon and Trend ---- */}
        <div className="flex items-start justify-between">
          {/* Icon with colored background */}
          <div className={cn("p-3 rounded-xl", iconVariants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
          
          {/* Trend indicator (if provided) */}
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend === "up" && "bg-destructive/10 text-destructive",     // Up = red (more problems)
              trend === "down" && "bg-success/10 text-success",           // Down = green (improving)
              trend === "stable" && "bg-muted text-muted-foreground"      // Stable = gray (no change)
            )}>
              {/* Show arrow based on trend direction */}
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
            </span>
          )}
        </div>
        
        {/* ---- BOTTOM: Title, Value, Subtitle ---- */}
        <div className="mt-4">
          {/* Title (small, muted text) */}
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          
          {/* Main value (large, bold) */}
          <p className="text-3xl font-bold mt-1">{value}</p>
          
          {/* Subtitle (if provided) */}
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
