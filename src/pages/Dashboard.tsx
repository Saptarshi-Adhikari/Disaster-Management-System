/**
 * Dashboard.tsx - DYNAMIC INTEGRATION
 */
import { AlertTriangle, Users, Home, Heart, TrendingUp, Activity } from "lucide-react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { AlertsFeed, Alert } from "@/components/dashboard/AlertsFeed";
import { ShelterMap, Shelter } from "@/components/dashboard/ShelterMap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Badge } from "@/components/ui/badge";

// ---- DATA SOURCE ----
// These match the 'Alert' and 'Shelter' interfaces we added to the components
const MOCK_ALERTS: Alert[] = [
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
];

const MOCK_SHELTERS: Shelter[] = [
  {
    id: "1",
    name: "Central Community Center",
    distance: "0.5 mi",
    capacity: 500,
    current: 234,
    amenities: ["wifi", "power"],
    status: "open"
  },
  {
    id: "2",
    name: "Lincoln High School Gym",
    distance: "1.2 mi",
    capacity: 300,
    current: 289,
    amenities: ["power", "food"],
    status: "limited"
  },
  {
    id: "3",
    name: "Riverside Church Hall",
    distance: "2.1 mi",
    capacity: 150,
    current: 150,
    amenities: ["wifi", "food"],
    status: "full"
  },
];

export default function Dashboard() {
  // --- INTEGRATION LOGIC ---
  const activeAlertsCount = MOCK_ALERTS.length;
  const criticalAlertsCount = MOCK_ALERTS.filter(a => a.type === 'critical').length;
  
  const totalShelters = MOCK_SHELTERS.length;
  const openShelters = MOCK_SHELTERS.filter(s => s.status === 'open').length;
  const fullShelters = MOCK_SHELTERS.filter(s => s.status === 'full').length;

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Emergency Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time disaster monitoring and response coordination
          </p>
        </div>
        <Badge variant="outline" className="gap-2 w-fit">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Active Event: Flash Flood
        </Badge>
      </div>

      {/* SECTION 2: STATUS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          icon={AlertTriangle}
          title="Active Alerts"
          value={activeAlertsCount}
          subtitle={`${criticalAlertsCount} critical`}
          variant="warning"
          trend="up"
        />
        
        <StatusCard
          icon={Users}
          title="People Affected"
          value="15,234"
          subtitle="+2,341 today"
          variant="emergency"
          trend="up"
        />
        
        <StatusCard
          icon={Home}
          title="Shelters Available"
          value={totalShelters}
          subtitle={`${openShelters} open, ${fullShelters} full`}
          variant="info"
          trend="stable"
        />
        
        <StatusCard
          icon={Heart}
          title="Resources Matched"
          value={892}
          subtitle="Today's donations"
          variant="safe"
          trend="up"
        />
      </div>

      {/* SECTION 3: ALERTS FEED & ACTIONS */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Note: Prop name is 'alerts' to match your updated AlertsFeed.tsx */}
          <AlertsFeed alerts={MOCK_ALERTS} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* SECTION 4: SHELTER MAP & STATS */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Note: Prop name is 'shelters' to match your updated ShelterMap.tsx */}
        <ShelterMap shelters={MOCK_SHELTERS} />
        
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard
              icon={Activity}
              title="Active Rescues"
              value={47}
              subtitle="12 completed today"
              variant="info"
            />
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