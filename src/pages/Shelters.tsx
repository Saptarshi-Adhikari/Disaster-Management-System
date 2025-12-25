import { useState } from "react";
import { LiveMap } from "@/components/live-map";
import {
  MapPin, Users, Wifi, Zap, Utensils, Heart,
  Navigation, Filter, Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { shelters, type Shelter } from "./shelter-data";

/* ---------- CONFIG ---------- */

const statusConfig = {
  open:    { label: "Open",    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  limited: { label: "Limited", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  full:    { label: "Full",    color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi:    { icon: Wifi, label: "WiFi" },
  power:   { icon: Zap, label: "Power" },
  food:    { icon: Utensils, label: "Food" },
  medical: { icon: Heart, label: "Medical" },
};

/* ---------- COMPONENT ---------- */

export default function Shelters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);

  const filteredShelters = shelters.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCount = shelters.filter(s => s.status === "open").length;

  const openDirections = (lat: number, lng: number) =>
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");

  const callShelter = (phone: string) =>
    (window.location.href = `tel:${phone}`);

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            WB Relief Finder
          </h1>
          <p className="text-muted-foreground mt-1">
            Emergency shelters active across West Bengal Districts
          </p>
        </div>

        <Badge variant="outline" className="gap-2 bg-primary/5 border-primary/20">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {openCount} Live Locations
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by District or Center name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden border-primary/20 shadow-xl">
        <div className="h-[450px]">
          <LiveMap shelters={filteredShelters} />
        </div>
      </Card>

      {/* Shelter Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredShelters.map((shelter) => {
          const status = statusConfig[shelter.status];
          const occupancy = Math.round((shelter.current / shelter.capacity) * 100);
          const active = selectedShelter === shelter.id;

          return (
            <Card
              key={shelter.id}
              onClick={() => setSelectedShelter(shelter.id)}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                active && "ring-2 ring-primary border-transparent shadow-lg"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-lg">{shelter.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{shelter.address}</p>
                  </div>
                  <Badge variant="outline" className={cn(status.color, "font-bold")}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Navigation className="h-4 w-4 text-primary" />
                  {shelter.distance} distance
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" /> Occupancy
                    </span>
                    <span className="font-bold">
                      {shelter.current} / {shelter.capacity}
                    </span>
                  </div>
                  <Progress value={occupancy} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {shelter.amenities.map(a => {
                    const Icon = amenityIcons[a].icon;
                    return (
                      <Badge key={a} variant="secondary" className="bg-secondary/50">
                        <Icon className="h-3 w-3 mr-1" />
                        {amenityIcons[a].label}
                      </Badge>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(shelter.coords.lat, shelter.coords.lng);
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      callShelter(shelter.phone);
                    }}
                  >
                    Call
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
