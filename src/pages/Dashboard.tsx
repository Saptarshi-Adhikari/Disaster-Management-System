/**
 * Dashboard.tsx - RESTORED CARD DETAILS (Critical Count, Dynamic Radius, Total Matched)
 */
import { useState, useEffect, useCallback } from "react";
import { 
  AlertTriangle, Users, Home, Heart, TrendingUp, 
  Activity, RefreshCw, MapPin, NavigationOff, Wind, 
  Thermometer, Settings2, Phone 
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { AlertsFeed, Alert } from "@/components/dashboard/AlertsFeed";
import { ShelterMap, Shelter } from "@/components/dashboard/ShelterMap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

// LIVE INTEGRATIONS
import { db } from "@/firebase/firebase"; 
import { collection, query, where, onSnapshot } from "firebase/firestore"; 
import { fetchWestBengalNews } from "@/lib/newsService"; 

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]); 
  const [resourceCount, setResourceCount] = useState<number>(0);
  const [aqi, setAqi] = useState<{ value: number; label: string; color: string } | null>(null);
  const [pm25, setPm25] = useState<{ value: number; color: string } | null>(null);
  const [temp, setTemp] = useState<number | null>(null); 
  const [isLoading, setIsLoading] = useState(true);

  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [radius, setRadius] = useState<number>(50); 
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied">("loading");

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  const fetchAqiData = async (lat: number, lng: number) => {
    const TOKEN = "16cb2690d129561db238c7bf06a5719124f575a3"; 
    try {
      const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${TOKEN}`);
      const result = await response.json();
      if (result.status === "ok") {
        const aqiVal = result.data.aqi;
        let label = "Good"; let color = "bg-green-500";
        if (aqiVal > 150) { label = "Unhealthy"; color = "bg-red-500"; }
        else if (aqiVal > 50) { label = "Moderate"; color = "bg-yellow-500"; }
        setAqi({ value: aqiVal, label, color });
        setPm25({ value: result.data.iaqi?.pm25?.v, color: "text-primary" });
        setTemp(result.data.iaqi?.t?.v);
      }
    } catch (e) { console.error(e); }
  };

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on this device.");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success! Update your app state with coordinates
        console.log(position.coords.latitude, position.coords.longitude);
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("granted");
        fetchAqiData(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        // If this alerts "User denied Geolocation", 
        // check your phone's App Settings.
        setLocationStatus("denied");
        alert("Location Error: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const requestLocation = useCallback(() => {
    handleEnableLocation();
  }, []);

  useEffect(() => {
    requestLocation();
    const unsubShelters = onSnapshot(query(collection(db, "shelters"), where("status_approval", "==", "approved")), (snap) => {
      setShelters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any);
    });
    const unsubResources = onSnapshot(collection(db, "resources"), (snap) => setResourceCount(snap.size));
    const loadAlerts = async () => {
      const liveData = await fetchWestBengalNews("");
      setAlerts(liveData.slice(0, 5) as any);
      setIsLoading(false);
    };
    loadAlerts();
    return () => { unsubShelters(); unsubResources(); };
  }, [requestLocation]);

  const nearbyShelters = shelters.map(s => {
    if (userCoords && s.coords) {
      const dist = getDistance(userCoords.lat, userCoords.lng, s.coords.lat, s.coords.lng);
      return { ...s, distance: `${dist.toFixed(1)} km`, rawDist: dist };
    }
    return { ...s, rawDist: 0 }; 
  }).filter(s => locationStatus !== "granted" || s.rawDist <= radius);

  return (
    <div className="space-y-6 pb-28 md:pb-6 px-3 md:px-0">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  <div> 
    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none">
      Emergency Dashboard
    </h1>
    <p className="text-slate-400 mt-1.5 text-xs md:text-sm">
      Real-time disaster monitoring
    </p>
  </div>

        {/* Weather Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <TooltipProvider>
            {aqi && (
              <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 px-3 rounded-full border border-slate-700 shrink-0">
                <Wind className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-bold text-white">{aqi.value} AQI</span>
                <Badge className={`text-[9px] h-4 px-1 ${aqi.color}`}>{aqi.label}</Badge>
              </div>
            )}
            {pm25 && (
              <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 px-3 rounded-full border border-slate-700 shrink-0">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[11px] font-medium text-slate-400">PM2.5: <span className="text-white font-bold">{pm25.value}</span></span>
              </div>
            )}
            {temp !== null && (
              <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 px-3 rounded-full border border-slate-700 shrink-0">
                <Thermometer className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-[11px] font-bold text-white">{temp}°C</span>
              </div>
            )}
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-full shrink-0 h-8 w-8 p-0 border-slate-700">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. RADIUS CONTROLLER */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className={`p-2.5 rounded-lg ${locationStatus === 'denied' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
            <MapPin className={`h-5 w-5 ${locationStatus === 'denied' ? 'text-red-500' : 'text-primary'}`} />
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">Search Radius</p>
            <p className="text-sm font-black text-white leading-none">
              {locationStatus === 'granted' ? `${radius} Kilometers` : 'Location Disabled'}
            </p>
            {locationStatus === 'denied' && (
              <button 
                onClick={handleEnableLocation}
                className="text-[10px] text-blue-400 font-bold hover:underline flex items-center gap-1 text-left mt-1"
              >
                <Settings2 className="h-2.5 w-2.5" /> Enable in App
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 px-1">
          <Slider 
            disabled={locationStatus !== "granted"}
            value={[radius]} 
            max={500} 
            step={5} 
            onValueChange={(val) => setRadius(val[0])} 
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* 3. STATUS CARDS - RESTORED SUBTITLES */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          icon={AlertTriangle} 
          title="Active Alerts" 
          value={alerts.length} 
          subtitle={`${alerts.filter(a => a.type === 'critical').length} critical`}
          variant="warning" 
        />
        <StatusCard 
          icon={Users} 
          title="People Affected" 
          value="15.2k" 
          subtitle="+2,341 today"
          variant="emergency" 
        />
        <StatusCard 
          icon={Home} 
          title="Shelters Near You" 
          value={nearbyShelters.length} 
          subtitle={`${radius}km radius`}
          variant="info" 
        />
        <StatusCard 
          icon={Heart} 
          title="Resources Matched" 
          value={resourceCount} 
          subtitle="Total matched"
          variant="safe" 
        />
      </div>

      {/* 4. MAIN FEED */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-slate-900/20 rounded-2xl border border-slate-800/50 overflow-hidden">
            <AlertsFeed alerts={alerts} />
          </div>
        </div>
        <div className="space-y-6 order-1 lg:order-2">
          <QuickActions />
          <div className="hidden lg:block space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <StatusCard icon={Activity} title="Rescues" value={47} variant="info" />
                 <StatusCard icon={TrendingUp} title="Response" value="8m" variant="safe" />
              </div>
          </div>
        </div>
      </div>

      {/* 5. MAP & EXTRA MOBILE STATS */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="h-[380px] md:h-auto min-h-[450px] rounded-2xl overflow-hidden border border-slate-800/50">
          {locationStatus === "denied" ? (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900/40 p-8 text-center">
              <NavigationOff className="h-12 w-12 text-slate-700 mb-4" />
              <p className="text-slate-400 text-sm mb-4">Enable GPS to see nearby shelters</p>
              <Button onClick={handleEnableLocation} size="sm">Enable Map</Button>
            </div>
          ) : (
            <ShelterMap shelters={nearbyShelters} />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 lg:hidden">
            <StatusCard icon={Activity} title="Rescues" value={47} variant="info" />
            <StatusCard icon={TrendingUp} title="Response" value="8m" variant="safe" />
        </div>
      </div>

      {/* 6. EMERGENCY BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent md:hidden z-50">
        <Button className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 shadow-2xl text-lg font-bold gap-3 border-t border-white/10 active:scale-95 transition-transform">
          <Phone className="h-6 w-6 fill-current" />
          EMERGENCY 100
        </Button>
      </div>
    </div>
  );
}