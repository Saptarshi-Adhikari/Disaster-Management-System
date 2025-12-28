import { useState, useEffect } from "react";
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
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // States for Address Validation
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [addressValue, setAddressValue] = useState("");

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
        }));
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

  // NEW: Geocoding Logic triggered on Address Blur
  const handleAddressBlur = async () => {
    if (addressValue.length < 5) return;

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
      toast({ variant: "destructive", title: "Wait", description: "Please enter a valid address first." });
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
        address: addressValue,
        phone: phone,
        capacity: Number(formData.get("capacity")),
        current: 0,
        status: "open",
        amenities: ["food", "power"],
        coords: tempCoords,
        status_approval: "pending",
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
          <DialogContent className="bg-slate-900 text-white border-slate-800">
            <DialogHeader>
              <DialogTitle>Register Emergency Shelter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddShelter} className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Shelter Name *</Label>
                <Input
                  name="name"
                  placeholder="e.g. Community Hall"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Full Address *</Label>
                <Input
                  name="address"
                  placeholder="Street, District"
                  required
                  value={addressValue}
                  onChange={(e) => {
                    setAddressValue(e.target.value);
                    if (tempCoords) setTempCoords(null);
                  }}
                  onBlur={handleAddressBlur}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              
              {/* STATUS INDICATOR - UI preserved exactly as your screenshot */}
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
                disabled={isValidating}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {isValidating ? "Verifying..." : tempCoords ? "Location Captured ✓" : "Enter address to pin location"}
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
                className="w-full" 
                disabled={isSubmitting || isValidating || !tempCoords}
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