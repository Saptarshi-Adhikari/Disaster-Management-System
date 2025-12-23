import { useState } from "react";
import { 
  Radio, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  MapPin,
  Filter,
  Bell,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "resolved";
  title: string;
  message: string;
  fullDetails: string;
  time: string;
  location: string;
  source: string;
  affectedArea: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Flash Flood Warning",
    message: "Immediate evacuation required for Zone A residents",
    fullDetails: "Heavy rainfall has caused rapid water level rise in the downtown area. All residents in Zone A (Downtown, Riverside, and Marina districts) must evacuate immediately to higher ground. Emergency shelters are open at Central Community Center and Lincoln High School.",
    time: "2 min ago",
    location: "Downtown District",
    source: "National Weather Service",
    affectedArea: "Zone A - Downtown, Riverside, Marina"
  },
  {
    id: "2",
    type: "warning",
    title: "Power Outage Alert",
    message: "Major grid failure affecting northern sector",
    fullDetails: "A transformer explosion has caused widespread power outages affecting approximately 15,000 homes in the northern sector. Utility crews are on site and estimate power restoration within 4-6 hours. Residents are advised to unplug sensitive electronics.",
    time: "15 min ago",
    location: "North Sector",
    source: "City Power Authority",
    affectedArea: "North Sector - 15,000+ homes"
  },
  {
    id: "3",
    type: "info",
    title: "New Shelter Opening",
    message: "Central Community Center now accepting evacuees",
    fullDetails: "The Central Community Center emergency shelter is now fully operational with capacity for 500 people. Available services include: hot meals, medical triage, charging stations, and pet-friendly area. Bring identification if possible.",
    time: "32 min ago",
    location: "Central Area",
    source: "Emergency Management",
    affectedArea: "City-wide availability"
  },
  {
    id: "4",
    type: "warning",
    title: "Road Closure",
    message: "Highway 101 blocked due to debris",
    fullDetails: "Highway 101 between Exit 23 and Exit 28 is closed in both directions due to fallen trees and debris. Alternate routes via Highway 280 or local streets are recommended. Estimated clearing time: 3-4 hours.",
    time: "45 min ago",
    location: "Highway 101",
    source: "Department of Transportation",
    affectedArea: "Highway 101, Exits 23-28"
  },
  {
    id: "5",
    type: "resolved",
    title: "Gas Leak Contained",
    message: "Industrial district gas leak has been sealed",
    fullDetails: "The gas leak reported at the industrial district has been successfully contained by emergency crews. Air quality tests show safe levels. Residents can return to the evacuated buildings. Thank you for your cooperation.",
    time: "1 hour ago",
    location: "Industrial District",
    source: "Fire Department",
    affectedArea: "Industrial District - Block 4-7"
  },
  {
    id: "6",
    type: "critical",
    title: "Dam Overflow Warning",
    message: "Reservoir approaching critical levels",
    fullDetails: "Due to continued heavy rainfall, the Riverside Reservoir is approaching overflow capacity. Controlled water release will begin in 2 hours. Residents in low-lying areas along the river should prepare for potential flooding and consider preemptive evacuation.",
    time: "5 min ago",
    location: "Riverside Area",
    source: "Water Management Authority",
    affectedArea: "All river-adjacent communities"
  },
];

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    badge: "outline" as const,
  },
  info: {
    icon: Info,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    badge: "secondary" as const,
  },
  resolved: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    badge: "outline" as const,
  },
};

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return alert.type === "critical" || alert.type === "warning";
    return alert.type === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Radio className="h-8 w-8 text-primary" />
            Alerts & News
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time emergency alerts and official updates
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="notifications" 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label htmlFor="notifications" className="flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4" />
              Push Alerts
            </Label>
          </div>
        </div>
      </div>

      {/* Live Badge */}
      <Card variant="emergency" className="border-destructive/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            <div>
              <p className="font-semibold">Active Emergency</p>
              <p className="text-sm text-muted-foreground">Flash Flood Warning in effect</p>
            </div>
          </div>
          <Button variant="emergency" size="sm">
            <Volume2 className="h-4 w-4" />
            Listen
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="info">Updates</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          <AlertList alerts={filteredAlerts} onSelect={setSelectedAlert} selectedId={selectedAlert?.id} />
        </TabsContent>
        <TabsContent value="active" className="mt-6 space-y-4">
          <AlertList alerts={filteredAlerts} onSelect={setSelectedAlert} selectedId={selectedAlert?.id} />
        </TabsContent>
        <TabsContent value="info" className="mt-6 space-y-4">
          <AlertList alerts={filteredAlerts} onSelect={setSelectedAlert} selectedId={selectedAlert?.id} />
        </TabsContent>
        <TabsContent value="resolved" className="mt-6 space-y-4">
          <AlertList alerts={filteredAlerts} onSelect={setSelectedAlert} selectedId={selectedAlert?.id} />
        </TabsContent>
      </Tabs>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Card variant="glass" className="mt-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {(() => {
                  const config = alertConfig[selectedAlert.type];
                  const Icon = config.icon;
                  return (
                    <div className={cn("p-3 rounded-xl", config.bg)}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>
                  );
                })()}
                <div>
                  <Badge variant={alertConfig[selectedAlert.type].badge} className="mb-2">
                    {selectedAlert.type.charAt(0).toUpperCase() + selectedAlert.type.slice(1)}
                  </Badge>
                  <CardTitle className="text-xl">{selectedAlert.title}</CardTitle>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{selectedAlert.fullDetails}</p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span><strong>Location:</strong> {selectedAlert.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span><strong>Issued:</strong> {selectedAlert.time}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-sm"><strong>Source:</strong> {selectedAlert.source}</p>
              <p className="text-sm mt-1"><strong>Affected Area:</strong> {selectedAlert.affectedArea}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AlertList({ 
  alerts, 
  onSelect, 
  selectedId 
}: { 
  alerts: Alert[]; 
  onSelect: (alert: Alert) => void;
  selectedId?: string;
}) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;
        
        return (
          <Card
            key={alert.id}
            variant="interactive"
            className={cn(
              config.border,
              selectedId === alert.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelect(alert)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold truncate">{alert.title}</h4>
                    <Badge variant={config.badge} className="shrink-0 capitalize">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
