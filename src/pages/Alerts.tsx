import { useState, useEffect } from "react";
import { 
  Radio, AlertTriangle, Info, CheckCircle, Clock, MapPin, 
  Bell, Loader2, RefreshCw, Share2, Search, X 
} from "lucide-react";
import { fetchWestBengalNews } from "@/lib/newsService"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";

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

const alertConfig = {
  critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", badge: "destructive" as const },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", badge: "outline" as const },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30", badge: "secondary" as const },
  resolved: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "outline" as const },
};

export default function Alerts() {
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All West Bengal");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async (city: string) => {
    setLoading(true);
    const data = await fetchWestBengalNews(city === "All West Bengal" ? "" : city);
    setLiveAlerts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData(selectedCity);
    const interval = setInterval(() => loadData(selectedCity), 300000); 
    return () => clearInterval(interval);
  }, [selectedCity]);

  const filteredAlerts = liveAlerts.filter(alert => {
    const matchesTab = activeTab === "all" ? true : (activeTab === "active" ? (alert.type === "critical" || alert.type === "warning") : alert.type === activeTab);
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Radio className="h-9 w-9 text-red-500 animate-pulse" />
            Live WB Alerts
          </h1>
          <p className="text-slate-400 font-medium mt-1">Real-time Emergency & News Monitor</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[220px] bg-slate-900 border-slate-700 text-white h-11 focus:ring-red-500/20">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value="All West Bengal" className="focus:bg-slate-800 focus:text-white cursor-pointer">Statewide (All WB)</SelectItem>
                <SelectGroup>
                    <SelectLabel className="text-red-400 text-[10px] uppercase font-bold px-2 py-1">South Bengal</SelectLabel>
                    {["Kolkata", "Howrah", "Durgapur", "Asansol", "Haldia", "Nadia", "Hooghly"].map(city => (
                      <SelectItem key={city} value={city} className="focus:bg-slate-800 focus:text-white cursor-pointer">{city}</SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel className="text-red-400 text-[10px] uppercase font-bold px-2 py-1">North Bengal</SelectLabel>
                    {["Siliguri", "Darjeeling", "Kalimpong", "Jalpaiguri", "Malda", "Alipurduar"].map(city => (
                      <SelectItem key={city} value={city} className="focus:bg-slate-800 focus:text-white cursor-pointer">{city}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-11 w-11 border-slate-700 bg-slate-900 text-white hover:bg-slate-800" onClick={() => loadData(selectedCity)} disabled={loading}>
            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
          </Button>
          
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 h-11">
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            <Bell className={cn("h-4 w-4", notificationsEnabled ? "text-red-500" : "text-slate-500")} />
          </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
        <Input 
          placeholder="Filter by keyword (e.g. fire, rain, traffic)..." 
          className="pl-12 pr-12 h-14 bg-slate-900/50 border-slate-700 focus:border-red-500/50 focus:ring-red-500/10 rounded-xl text-lg transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse"></div>
            <Loader2 className="h-14 w-14 animate-spin text-red-500 relative z-10" />
          </div>
          <p className="text-slate-400 font-medium text-lg">Scanning regional feeds for {selectedCity}...</p>
        </div>
      ) : (
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/80 border border-slate-800 p-1 mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">All Feed</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Active Hazards</TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">General</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between opacity-60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Monitoring Hub • {filteredAlerts.length} Active</span>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <AlertList alerts={filteredAlerts} onSelect={setSelectedAlert} selectedId={selectedAlert?.id} />
              </div>
            </div>

            <div className="lg:col-span-7 hidden lg:block">
              {selectedAlert ? (
                <DetailCard alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center bg-slate-900/20">
                  <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                    <Info className="h-12 w-12 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300">No Alert Selected</h3>
                  <p className="text-slate-500 max-w-xs mt-2">Click on an alert card from the left to view sanitized details and verification sources.</p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      )}

      {/* UPDATED MOBILE OVERLAY */}
      {selectedAlert && (
        <div className="lg:hidden fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* This div uses fixed inset-0 to cover the whole screen. 
            bg-slate-950/80 provides the dark tint.
            backdrop-blur-xl provides the heavy blur effect.
          */}
          <div 
            className="fixed inset-0 bg-slate-150/80 backdrop-blur-xl transition-opacity duration-300" 
            onClick={() => setSelectedAlert(null)}
          />
          
          <div className="relative w-full max-w-xl animate-in fade-in zoom-in duration-200 shadow-2xl z-[100000]">
            <DetailCard alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const config = alertConfig[alert.type];

  return (
    <Card className="border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden rounded-3xl border-t-red-500/40 border-t-2">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <Badge variant={config.badge} className="px-4 py-1 text-[10px] uppercase font-black rounded-full">{alert.type}</Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-red-500/10 hover:text-red-500">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CardTitle className="text-2xl font-black leading-tight mt-4 text-white tracking-tight">{alert.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
            <p className="text-slate-300 text-base leading-relaxed font-medium italic">
              "{alert.fullDetails}"
            </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 text-slate-400 font-bold bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <MapPin className="h-5 w-5 text-red-500" /> {alert.location}
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-bold bg-slate-800/50 p-3 rounded-xl border border-white/5">
            <Clock className="h-5 w-5 text-red-500" /> {alert.time}
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase">
            <span>Verified Source: {alert.source}</span>
            <a href={alert.id} target="_blank" className="text-red-400 hover:text-red-300 underline underline-offset-4">External Source</a>
          </div>
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-red-900/20 gap-3 text-lg transition-transform active:scale-95"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🚨 *WB ALERT: ${alert.title}*\n\n${alert.message}\n\n📍 ${alert.location}\n🕒 ${alert.time}`)}`, '_blank')}
          >
            <Share2 className="h-5 w-5" />
            BROADCAST TO WHATSAPP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertList({ alerts, onSelect, selectedId }: { alerts: Alert[]; onSelect: (alert: Alert) => void; selectedId?: string }) {
  if (alerts.length === 0) return (
    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
        <Search className="h-12 w-12 mx-auto text-slate-700 mb-4" />
        <p className="text-slate-500 font-bold">No data matches your search.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;
        return (
          <div 
            key={alert.id} 
            className={cn(
              "group relative cursor-pointer transition-all duration-300 rounded-2xl border-l-[6px] p-5 shadow-lg", 
              config.border, 
              selectedId === alert.id ? "bg-red-500/10 border-red-500 ring-2 ring-red-500/20 translate-x-2" : "bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:translate-x-1"
            )}
            onClick={() => onSelect(alert)}
          >
            <div className="flex gap-4">
              <div className={cn("p-2 rounded-xl shrink-0 h-fit shadow-lg", config.bg)}>
                <Icon className={cn("h-6 w-6", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-slate-100 truncate group-hover:text-red-400 transition-colors uppercase tracking-tight">{alert.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-2 font-medium">{alert.message}</p>
                <div className="flex items-center justify-between mt-4">
                   <div className="flex gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {alert.time}</span>
                      <span className="text-red-500/60 font-black">{alert.source}</span>
                   </div>
                   <Badge variant="outline" className="text-[8px] bg-black/30 border-slate-700 text-slate-300 font-bold">{alert.location}</Badge>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}