import { useState } from "react";
import { 
  MapPin, 
  Users, 
  Wifi, 
  Zap, 
  Utensils,
  Heart,
  Navigation,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Shelter {
  id: string;
  name: string;
  address: string;
  distance: string;
  capacity: number;
  current: number;
  amenities: string[];
  status: "open" | "full" | "limited";
  phone: string;
  coords: { lat: number; lng: number };
}

const shelters: Shelter[] = [
  {
    id: "1",
    name: "Central Community Center",
    address: "123 Main Street, Downtown",
    distance: "0.5 mi",
    capacity: 500,
    current: 234,
    amenities: ["wifi", "power", "medical", "food"],
    status: "open",
    phone: "(555) 123-4567",
    coords: { lat: 40.7128, lng: -74.006 }
  },
  {
    id: "2",
    name: "Lincoln High School Gym",
    address: "456 Education Ave, North District",
    distance: "1.2 mi",
    capacity: 300,
    current: 289,
    amenities: ["power", "food"],
    status: "limited",
    phone: "(555) 234-5678",
    coords: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: "3",
    name: "Riverside Church Hall",
    address: "789 River Road, Riverside",
    distance: "2.1 mi",
    capacity: 150,
    current: 150,
    amenities: ["wifi", "food"],
    status: "full",
    phone: "(555) 345-6789",
    coords: { lat: 40.7282, lng: -73.7949 }
  },
  {
    id: "4",
    name: "City Sports Complex",
    address: "321 Athletic Way, East Side",
    distance: "2.8 mi",
    capacity: 800,
    current: 412,
    amenities: ["wifi", "power", "food", "medical"],
    status: "open",
    phone: "(555) 456-7890",
    coords: { lat: 40.6892, lng: -74.0445 }
  },
  {
    id: "5",
    name: "St. Mary's Parish Center",
    address: "567 Faith Street, West End",
    distance: "3.5 mi",
    capacity: 200,
    current: 178,
    amenities: ["food", "medical"],
    status: "limited",
    phone: "(555) 567-8901",
    coords: { lat: 40.7484, lng: -73.9857 }
  },
];

const statusConfig = {
  open: { label: "Open", color: "bg-success text-success-foreground" },
  limited: { label: "Limited Space", color: "bg-warning text-warning-foreground" },
  full: { label: "Full", color: "bg-destructive text-destructive-foreground" },
};

const amenityIcons: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "WiFi" },
  power: { icon: Zap, label: "Power" },
  food: { icon: Utensils, label: "Food" },
  medical: { icon: Heart, label: "Medical" },
};

export default function Shelters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);

  const filteredShelters = shelters.filter(shelter =>
    shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shelter.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Shelter Finder
          </h1>
          <p className="text-muted-foreground mt-1">
            Find nearby emergency shelters and safe locations
          </p>
        </div>
        <Badge variant="outline" className="gap-2 w-fit">
          {shelters.filter(s => s.status === "open").length} shelters available
        </Badge>
      </div>

      {/* Search & Filter */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search shelters by name or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="default" className="gap-2">
              <Navigation className="h-4 w-4" />
              Near Me
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card variant="glass" className="overflow-hidden">
        <div className="h-64 bg-secondary/50 flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-2 animate-float" />
            <p className="text-muted-foreground">Interactive Map</p>
            <p className="text-sm text-muted-foreground">Showing {filteredShelters.length} shelters</p>
          </div>
          {/* Map markers would go here */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_hsl(var(--background))_100%)]" />
        </div>
      </Card>

      {/* Shelter List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredShelters.map((shelter) => {
          const config = statusConfig[shelter.status];
          const occupancy = Math.round((shelter.current / shelter.capacity) * 100);
          const isSelected = selectedShelter === shelter.id;
          
          return (
            <Card 
              key={shelter.id}
              variant="interactive"
              className={cn(
                "transition-all",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedShelter(shelter.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{shelter.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{shelter.address}</p>
                  </div>
                  <Badge className={config.color}>{config.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Distance */}
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span>{shelter.distance} away</span>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Occupancy
                    </span>
                    <span className="font-medium">{shelter.current}/{shelter.capacity}</span>
                  </div>
                  <Progress 
                    value={occupancy} 
                    className={cn(
                      "h-2",
                      occupancy > 90 && "[&>div]:bg-destructive",
                      occupancy > 70 && occupancy <= 90 && "[&>div]:bg-warning"
                    )}
                  />
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2">
                  {shelter.amenities.map((amenity) => {
                    const amenityInfo = amenityIcons[amenity];
                    if (!amenityInfo) return null;
                    const Icon = amenityInfo.icon;
                    return (
                      <Badge key={amenity} variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {amenityInfo.label}
                      </Badge>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="default" className="flex-1" size="sm">
                    <Navigation className="h-4 w-4" />
                    Directions
                  </Button>
                  <Button variant="outline" size="sm">
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
