/**
 * Dashboard.tsx - DYNAMIC INTEGRATION WITH LIVE FEEDS
 */
import { useState, useEffect } from "react";
import { AlertTriangle, Users, Home, Heart, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { AlertsFeed, Alert } from "@/components/dashboard/AlertsFeed";
import { ShelterMap, Shelter } from "@/components/dashboard/ShelterMap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- LIVE DATA FETCHING LOGIC ---
const fetchLiveAlerts = async (): Promise<Alert[]> => {
  try {
    const RSS_URL = `https://news.google.com/rss/search?q=West+Bengal+emergency+alerts+breaking+news&hl=en-IN&gl=IN&ceid=IN:en`;
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`);
    const data = await response.json();

    const cleanHTML = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body.textContent || "";
      return text.replace(/<[^>]*>?/gm, '').trim(); 
    };

    return (data.items || []).slice(0, 5).map((item: any) => {
      const title = item.title.split(" - ")[0];
      const description = cleanHTML(item.description);
      
      let type: "critical" | "warning" | "info" = "info";
      const criticalKeywords = ["accident", "death", "fire", "killed", "blast", "emergency", "flood"];
      const warningKeywords = ["alert", "warning", "delay", "traffic", "weather", "rain"];
      
      if (criticalKeywords.some(k => title.toLowerCase().includes(k))) type = "critical";
      else if (warningKeywords.some(k => title.toLowerCase().includes(k))) type = "warning";

      return {
        id: item.link,
        type: type,
        title: title,
        message: description.slice(0, 100) + "...",
        time: new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: "West Bengal",
      };
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

// --- STATIC DATA ---
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
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- INTEGRATION LOGIC ---
  const loadData = async () => {
    setIsLoading(true);
    const liveData = await fetchLiveAlerts();
    setAlerts(liveData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const activeAlertsCount = alerts.length;
  const criticalAlertsCount = alerts.filter(a => a.type === 'critical').length;
  
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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="outline" className="gap-2 w-fit">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Active Event: Live Feed
          </Badge>
        </div>
      </div>

      {/* SECTION 2: STATUS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          icon={AlertTriangle}
          title="Active Alerts"
          value={isLoading ? "..." : activeAlertsCount}
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
          <AlertsFeed alerts={alerts} />
          {isLoading && <p className="text-xs text-center mt-2 text-muted-foreground animate-pulse">Updating live regional data...</p>}
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* SECTION 4: SHELTER MAP & STATS */}
      <div className="grid gap-6 lg:grid-cols-2">
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