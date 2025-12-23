/**
 * ========================================
 * QuickActions.tsx - QUICK ACTION BUTTONS
 * ========================================
 * 
 * This component shows a grid of quick action buttons.
 * Each button links to a different page in the app.
 * 
 * This is useful for users who want to quickly access
 * common features without using the sidebar.
 */

// ---- IMPORTS ----
import { Link } from "react-router-dom";
import { 
  AlertTriangle,  // ⚠️ SOS
  MapPin,         // 📍 Shelter
  Users,          // 👥 Missing persons
  Heart,          // ❤️ Resources
  FileText,       // 📄 First aid
  Shield          // 🛡️ Safety
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * QUICK ACTION BUTTONS DATA
 * 
 * Each action has:
 * - icon: The icon to display
 * - label: The text on the button
 * - path: Where to go when clicked
 * - variant: The button style (color)
 */
const quickActions = [
  { 
    icon: AlertTriangle, 
    label: "Send SOS", 
    path: "/sos", 
    variant: "emergency" as const  // Red - most urgent
  },
  { 
    icon: MapPin, 
    label: "Find Shelter", 
    path: "/shelters", 
    variant: "default" as const    // Default style
  },
  { 
    icon: Users, 
    label: "Report Missing", 
    path: "/missing", 
    variant: "default" as const
  },
  { 
    icon: Heart, 
    label: "Donate/Request", 
    path: "/resources", 
    variant: "safe" as const       // Green - positive action
  },
  { 
    icon: FileText, 
    label: "First Aid", 
    path: "/first-aid", 
    variant: "warning" as const    // Yellow - caution/important
  },
  { 
    icon: Shield, 
    label: "Safety Check", 
    path: "/safety", 
    variant: "default" as const
  },
];

/**
 * QUICK ACTIONS COMPONENT
 * 
 * Displays a card with a grid of action buttons.
 */
export function QuickActions() {
  return (
    <Card variant="glass" className="slide-up">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Grid layout: 2 columns on mobile, 3 on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Loop through each action and create a button */}
          {quickActions.map((action) => (
            // Link wraps the button to make it navigate when clicked
            <Link key={action.path} to={action.path}>
              <Button 
                variant={action.variant}
                className="w-full h-auto flex-col gap-2 py-4"
              >
                {/* Icon */}
                <action.icon className="h-6 w-6" />
                {/* Label */}
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
