/**
 * Dashboard.tsx - PROXIMITY FILTERING, LIVE DATA, CACHED AQI, PM2.5, TEMP & TOOLTIPS
 */
import { useState, useEffect } from "react";
import { 
  AlertTriangle, Users, Home, Heart, TrendingUp, 
  Activity, RefreshCw, MapPin, NavigationOff, Wind, 
  Thermometer, HelpCircle // Added Thermometer icon
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { AlertsFeed, Alert } from "@/components/dashboard/AlertsFeed";
import { ShelterMap, Shelter } from "@/components/dashboard/ShelterMap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [temp, setTemp] = useState<number | null>(null); // Added temperature state
  const [isLoading, setIsLoading] = useState(true);

  // Location & Radius State
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [radius, setRadius] = useState<number>(50); 
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied">("loading");

  // Helper: Haversine Formula for Distance Calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  // --- SMART WEATHER DATA FETCH WITH 5-MINUTE CACHING ---
  const fetchAqiData = async (lat: number, lng: number) => {
    const CACHE_KEY = "weather_data_v5"; 
    const CACHE_TIME_KEY = "weather_timestamp_v5";
    const FIVE_MINUTES = 5 * 60 * 1000;

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (cachedData && cachedTime && (now - parseInt(cachedTime)) < FIVE_MINUTES) {
      const parsed = JSON.parse(cachedData);
      setAqi(parsed.aqi);
      setPm25(parsed.pm25);
      setTemp(parsed.temp);
      return;
    }

    try {
      const TOKEN = "16cb2690d129561db238c7bf06a5719124f575a3"; 
      const response = await fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${TOKEN}`);
      const result = await response.json();
      
      if (result.status === "ok") {
        const aqiVal = result.data.aqi;
        const pm25Val = result.data.iaqi?.pm25?.v;
        const tempVal = result.data.iaqi?.t?.v; // Temperature from API

        // AQI Logic
        let label = "Good";
        let color = "bg-green-500";
        if (aqiVal > 300) { label = "Hazardous"; color = "bg-purple-900"; }
        else if (aqiVal > 200) { label = "Very Unhealthy"; color = "bg-purple-500"; }
        else if (aqiVal > 150) { label = "Unhealthy"; color = "bg-red-500"; }
        else if (aqiVal > 100) { label = "Unhealthy for Sensitive"; color = "bg-orange-500"; }
        else if (aqiVal > 50) { label = "Moderate"; color = "bg-yellow-500"; }

        // PM2.5 Color Logic
        let pmColor = "text-green-500";
        if (pm25Val > 55.4) pmColor = "text-red-500";
        else if (pm25Val > 35.4) pmColor = "text-orange-500";
        else if (pm25Val > 12.0) pmColor = "text-yellow-500";

        const aqiObject = { value: aqiVal, label, color };
        const pm25Object = pm25Val ? { value: pm25Val, color: pmColor } : null;

        localStorage.setItem(CACHE_KEY, JSON.stringify({ aqi: aqiObject, pm25: pm25Object, temp: tempVal }));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());
        
        setAqi(aqiObject);
        setPm25(pm25Object);
        setTemp(tempVal);
      }
    } catch (error) {
      console.error("Weather Fetch Error:", error);
    }
  };

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const liveData = await fetchWestBengalNews(""); 
      const mappedAlerts: Alert[] = liveData.slice(0, 5).map(a => ({
        id: a.id,
        type: a.type as any,
        title: a.title,
        message: a.message,
        time: a.time,
        location: a.location
      }));
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error("Alert fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationStatus("granted");
          fetchAqiData(lat, lng); 
        },
        () => setLocationStatus("denied")
      );
    } else {
      setLocationStatus("denied");
    }

    const qShelters = query(collection(db, "shelters"), where("status_approval", "==", "approved"));
    const unsubShelters = onSnapshot(qShelters, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          amenities: Array.isArray(d.amenities) ? d.amenities : [],
          distance: d.distance || "N/A",
        };
      }) as any[];
      setShelters(data);
    });

    const qResources = collection(db, "resources");
    const unsubResources = onSnapshot(qResources, (snapshot) => {
      setResourceCount(snapshot.size);
    });

    loadAlerts(); 
    const interval = setInterval(loadAlerts, 300000); 
    return () => {
      unsubShelters();
      unsubResources();
      clearInterval(interval);
    };
  }, []);

  const nearbyShelters = shelters.map(s => {
    if (userCoords && s.coords) {
      const dist = getDistance(userCoords.lat, userCoords.lng, s.coords.lat, s.coords.lng);
      return { ...s, distance: `${dist.toFixed(1)} km`, rawDist: dist };
    }
    return { ...s, rawDist: 0 }; 
  }).filter(s => locationStatus !== "granted" || s.rawDist <= radius);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Emergency Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time disaster monitoring and response coordination</p>
        </div>

        {/* WEATHER DATA DISPLAY (AQI, PM2.5, TEMP) */}
        <TooltipProvider>
          {aqi && (
            <div className="flex items-center gap-3 bg-secondary/30 p-2 px-4 rounded-full border border-border/50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-4 text-xs">
                
                {/* AQI Tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-help">
                      <Wind className="h-3 w-3 text-primary mr-2" />
                      <span className="text-muted-foreground mr-1">AQI: </span>
                      <span className="font-bold">{aqi.value}</span>
                      <Badge className={`ml-2 text-[10px] ${aqi.color}`}>{aqi.label}</Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-semibold">Air Quality Index</p>
                    <p className="text-[10px] text-muted-foreground max-w-[200px]">General score of air health. Higher is more dangerous.</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* PM2.5 Tooltip */}
                {pm25 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center border-l border-border/50 pl-4 cursor-help">
                        <span className="text-muted-foreground mr-1">PM2.5: </span>
                        <span className={`font-bold ${pm25.color}`}>
                          {pm25.value} <span className="text-[10px] font-normal opacity-70">µg/m³</span>
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-semibold">Fine Particles (PM2.5)</p>
                      <p className="text-[10px] text-muted-foreground max-w-[200px]">Microscopic dust/smoke that can enter the lungs and bloodstream.</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Temperature Tooltip */}
                {temp !== null && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center border-l border-border/50 pl-4 cursor-help">
                        <Thermometer className="h-3 w-3 text-orange-400 mr-2" />
                        <span className="text-muted-foreground mr-1">Temp: </span>
                        <span className="font-bold">{temp}°C</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-semibold">Local Temperature</p>
                      <p className="text-[10px] text-muted-foreground">Ambient temperature in your immediate area.</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </TooltipProvider>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadAlerts} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* RADIUS CONTROLLER */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className={`p-2 rounded-lg ${locationStatus === 'denied' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
            <MapPin className={`h-5 w-5 ${locationStatus === 'denied' ? 'text-red-500' : 'text-primary'}`} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Search Radius</p>
            <p className="text-sm font-black text-white">{locationStatus === 'granted' ? `${radius} Kilometers` : 'Location Disabled'}</p>
          </div>
        </div>
        <div className="flex-1 px-2">
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

      {/* STATUS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard icon={AlertTriangle} title="Active Alerts" value={isLoading ? "..." : alerts.length} subtitle={`${alerts.filter(a => a.type === 'critical').length} critical`} variant="warning" />
        <StatusCard icon={Users} title="People Affected" value="15,234" subtitle="+2,341 today" variant="emergency" />
        <StatusCard icon={Home} title="Shelters Near You" value={nearbyShelters.length} subtitle={`${radius}km radius`} variant="info" />
        <StatusCard icon={Heart} title="Resources Matched" value={resourceCount} subtitle="Total matched" variant="safe" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlertsFeed alerts={alerts} />
        </div>
        <QuickActions />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {locationStatus === "denied" ? (
          <div className="h-[450px] flex flex-col items-center justify-center border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 p-12 text-center">
            <div className="bg-red-500/10 p-6 rounded-full mb-6">
              <NavigationOff className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Location Access Denied</h3>
            <p className="text-slate-400 max-w-xs mt-2 text-sm">
              We cannot calculate nearby shelters, AQI, or Weather without GPS.
            </p>
            <Button variant="outline" className="mt-6 border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        ) : (
          <ShelterMap shelters={nearbyShelters} />
        )}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard icon={Activity} title="Active Rescues" value={47} variant="info" />
            <StatusCard icon={TrendingUp} title="Response Time" value="8 min" variant="safe" />
          </div>
        </div>
      </div>
    </div>
  );
}