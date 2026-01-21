import { useState, useEffect, useRef } from "react";
import { db } from "@/firebase/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { LiveMap } from "@/components/live-map";
import {
  MapPin,
  Search,
  Plus,
  Loader2,
  Navigation,
  Phone,
  Camera,
  CheckCircle,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// NEW: Metadata Parser Import
import exifr from 'exifr';

/* ---------- TYPES ---------- */
interface Shelter {
  id: string;
  name?: string;
  address?: string;
  coords?: { lat: number; lng: number };
  capacity?: number;
  current?: number;
  status?: 'open' | 'limited' | 'full';
  phone?: string;
  image?: string;
  status_approval?: string;
  [key: string]: unknown;
}

/* ---------- CONFIG ---------- */

const statusConfig = {
  open: {
    label: "Open",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  limited: {
    label: "Limited",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  full: {
    label: "Full",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
};

export default function Shelters() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // States for Address/Photo Validation
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [addressValue, setAddressValue] = useState("");
  
  // NEW: Photo Metadata States
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "shelters"),
      where("status_approval", "==", "approved")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Shelter));
        setShelters(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // NEW: Handle Geotagging from Photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const gpsData = await exifr.gps(file);
      if (gpsData && gpsData.latitude && gpsData.longitude) {
        setTempCoords({
          lat: gpsData.latitude,
          lng: gpsData.longitude
        });
        toast({ 
          title: "Photo Geotag Found", 
          description: `Coordinates extracted: ${gpsData.latitude.toFixed(4)}, ${gpsData.longitude.toFixed(4)}` 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "No GPS Data", 
          description: "This photo doesn't contain location metadata. Please enter address manually." 
        });
      }
    } catch (error) {
      console.error("EXIF Error:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  // Address Validation Logic (Preserved)
  const handleAddressBlur = async () => {
    if (addressValue.length < 5 || tempCoords) return;

    setIsValidating(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressValue + ", West Bengal")}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setTempCoords({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
        toast({ title: "Address Verified", description: "GPS coordinates captured." });
      } else {
        setTempCoords(null);
        toast({ variant: "destructive", title: "Invalid Location", description: "Could not find this address on the map." });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const filteredShelters = shelters.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddShelter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tempCoords) {
      toast({ variant: "destructive", title: "Wait", description: "Please provide a location via photo or address." });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone")?.toString();

    if (!phone || phone.trim().length < 10) {
      toast({ title: "Valid Phone Required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "shelters"), {
        name: formData.get("name"),
        address: addressValue || "Location provided via photo",
        phone: phone,
        capacity: Number(formData.get("capacity")),
        current: 0,
        status: "open",
        amenities: ["food", "power"],
        coords: tempCoords,
        status_approval: "pending",
        geotagged: !!photoInputRef.current?.files?.length 
      });
      toast({ title: "Submitted", description: "Pending admin approval." });
      setTempCoords(null);
      setAddressValue("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDirections = (lat: number, lng: number) =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-white">
          <MapPin className="h-8 w-8 text-primary" /> WB Relief Finder
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Register Shelter
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 text-white border-slate-800 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register Emergency Shelter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddShelter} className="space-y-4 pt-4">
              
              {/* NEW: Photo Upload for Geotagging */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-400">Step 1: Auto-locate with Photo (Optional)</Label>
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                    tempCoords ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
                  )}
                >
                  {isExtracting ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : tempCoords ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <Camera className="h-6 w-6 text-slate-400 group-hover:text-slate-300" />
                  )}
                  <span className="text-[10px] mt-2 text-slate-400">
                    {tempCoords ? "Location Verified from Image" : "Upload photo to auto-detect GPS"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={photoInputRef} 
                    onChange={handlePhotoUpload} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Step 2: Shelter Details *</Label>
                <Input
                  name="name"
                  placeholder="e.g. Community Hall"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Full Address (if not using photo) *</Label>
                <div className="relative">
                  <Input
                    name="address"
                    placeholder="Street, District"
                    required={!tempCoords}
                    value={addressValue}
                    onChange={(e) => {
                      setAddressValue(e.target.value);
                      if (tempCoords) setTempCoords(null);
                    }}
                    onBlur={handleAddressBlur}
                    className="bg-slate-800 border-slate-700 text-white pr-10"
                  />
                  {isValidating && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-slate-400" />}
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "w-full gap-2 border-dashed transition-all",
                  tempCoords
                    ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/5"
                    : "text-slate-400"
                )}
                disabled={isValidating || isExtracting}
              >
                <Navigation className="h-4 w-4" />
                {tempCoords ? "Location Ready ✓" : "Enter address or upload photo"}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Max Capacity *</Label>
                  <Input
                    name="capacity"
                    type="number"
                    placeholder="500"
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400">Phone *</Label>
                  <Input
                    name="phone"
                    placeholder="Contact Number"
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isSubmitting || isValidating || isExtracting || !tempCoords}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH CARD */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              placeholder="Search by name or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* MAP SECTION */}
      <div className="h-[400px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-slate-900">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <LiveMap shelters={filteredShelters} />
        )}
      </div>

      {/* SHELTER CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredShelters.map((shelter) => {
          const status =
            statusConfig[shelter.status as keyof typeof statusConfig] ||
            statusConfig.open;
          const occupancy = Math.round((shelter.current / shelter.capacity) * 100);

          return (
            <Card
              key={shelter.id}
              onClick={() => setSelectedShelter(shelter.id)}
              className={cn(
                "bg-slate-900/40 border-slate-800 transition-all cursor-pointer hover:bg-slate-900/60",
                selectedShelter === shelter.id && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                <div>
                  <CardTitle className="text-white text-lg">{shelter.name}</CardTitle>
                  <p className="text-sm text-slate-400">{shelter.address}</p>
                </div>
                <Badge variant="outline" className={cn(status.color, "font-bold")}>
                  {status.label}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      Occupancy ({shelter.current}/{shelter.capacity})
                    </span>
                    <span className="font-medium">{occupancy}%</span>
                  </div>
                  
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        occupancy > 90 ? "bg-rose-500" : 
                        occupancy > 70 ? "bg-amber-500" : 
                        "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(occupancy, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(shelter.coords.lat, shelter.coords.lng);
                    }}
                  >
                    <Navigation className="mr-2 h-4 w-4" /> Directions
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${shelter.phone}`;
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" /> Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}