/**
 * ========================================
 * Dashboard.tsx - MAIN HOME PAGE
 * ========================================
 * 
 * This is the first page users see when they open the app.
 * It shows an overview of the current emergency situation.
 * 
 * WHAT THIS PAGE SHOWS:
 * 1. Header with current emergency status
 * 2. Status cards with key numbers (alerts, affected people, shelters)
 * 3. Live alerts feed
 * 4. Quick action buttons
 * 5. Shelter map
 */

// ---- IMPORTS ----

// Icons from Lucide React - these are the little pictures/symbols
import { 
  AlertTriangle,  // ⚠️ Warning triangle icon
  Users,          // 👥 People icon
  Home,           // 🏠 House icon
  Heart,          // ❤️ Heart icon
  TrendingUp,     // 📈 Trending up icon
  Activity        // 📊 Activity/pulse icon
} from "lucide-react";

// Our custom components (reusable building blocks)
import { StatusCard } from "@/components/dashboard/StatusCard";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ShelterMap } from "@/components/dashboard/ShelterMap";
import { Badge } from "@/components/ui/badge";

/**
 * DASHBOARD COMPONENT
 * 
 * This function creates and returns the dashboard page.
 * In React, we build pages using "components" which are like LEGO blocks.
 */
export default function Dashboard() {
  return (
    // Main container - "space-y-6" adds vertical spacing between sections
    <div className="space-y-6">
      
      {/* ============================================
          SECTION 1: HEADER
          Shows the page title and current emergency status
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side - Title and description */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Emergency Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time disaster monitoring and response coordination
          </p>
        </div>
        
        {/* Right side - Current emergency badge */}
        <Badge variant="outline" className="gap-2 w-fit">
          {/* Pulsing dot to show it's live */}
          <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
          Active Event: Flash Flood
        </Badge>
      </div>

      {/* ============================================
          SECTION 2: STATUS CARDS
          Shows 4 key statistics about the emergency
          Grid layout: 1 column on mobile, 2 on tablet, 4 on desktop
          ============================================ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Active Alerts */}
        <StatusCard
          icon={AlertTriangle}     // The warning icon
          title="Active Alerts"    // Card title
          value={12}               // Main number to display
          subtitle="3 critical"    // Additional info
          variant="warning"        // Yellow/warning color
          trend="up"               // Shows upward arrow (increasing)
        />
        
        {/* Card 2: People Affected */}
        <StatusCard
          icon={Users}
          title="People Affected"
          value="15,234"
          subtitle="+2,341 today"
          variant="emergency"      // Red/emergency color
          trend="up"
        />
        
        {/* Card 3: Shelters Available */}
        <StatusCard
          icon={Home}
          title="Shelters Available"
          value={24}
          subtitle="18 open, 6 full"
          variant="info"           // Blue/info color
          trend="stable"           // Shows stable indicator
        />
        
        {/* Card 4: Resources Matched */}
        <StatusCard
          icon={Heart}
          title="Resources Matched"
          value={892}
          subtitle="Today's donations"
          variant="safe"           // Green/safe color
          trend="up"
        />
      </div>

      {/* ============================================
          SECTION 3: ALERTS AND QUICK ACTIONS
          Two-column layout on large screens
          ============================================ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left side - Takes 2 columns, shows live alerts */}
        <div className="lg:col-span-2">
          <AlertsFeed />
        </div>
        
        {/* Right side - Takes 1 column, shows quick action buttons */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* ============================================
          SECTION 4: SHELTER MAP AND ACTIVITY
          Shows shelter locations and response statistics
          ============================================ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left side - Shelter map */}
        <ShelterMap />
        
        {/* Right side - Activity statistics */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Active Rescues card */}
            <StatusCard
              icon={Activity}
              title="Active Rescues"
              value={47}
              subtitle="12 completed today"
              variant="info"
            />
            
            {/* Response Time card */}
            <StatusCard
              icon={TrendingUp}
              title="Response Time"
              value="8 min"
              subtitle="Average today"
              variant="safe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
