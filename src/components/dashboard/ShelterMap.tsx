import { MapPin, Users, Wifi, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Shelter {
  id: string;
  name: string;
  distance: string;
  capacity: number;
  current: number;
  amenities: string[];
  status: "open" | "full" | "limited";
}

const shelters: Shelter[] = [
  {
    id: "1",
    name: "Central Community Center",
    distance: "0.5 mi",
    capacity: 500,
    current: 234,
    amenities: ["wifi", "power", "medical"],
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

const statusConfig = {
  open: { label: "Open", variant: "default" as const, color: "bg-success" },
  limited: { label: "Limited", variant: "outline" as const, color: "bg-warning" },
  full: { label: "Full", variant: "destructive" as const, color: "bg-destructive" },
};

export function ShelterMap() {
  return (
    <Card variant="glass" className="slide-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Nearby Shelters
        </CardTitle>
        <Button variant="outline" size="sm">View Map</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {shelters.map((shelter) => {
          const config = statusConfig[shelter.status];
          const occupancy = Math.round((shelter.current / shelter.capacity) * 100);
          
          return (
            <div
              key={shelter.id}
              className="p-4 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{shelter.name}</h4>
                  <p className="text-sm text-muted-foreground">{shelter.distance} away</p>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity
                  </span>
                  <span>{shelter.current}/{shelter.capacity}</span>
                </div>
                <Progress value={occupancy} className="h-2" />
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                {shelter.amenities.includes("wifi") && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Wifi className="h-3 w-3" /> WiFi
                  </Badge>
                )}
                {shelter.amenities.includes("power") && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Zap className="h-3 w-3" /> Power
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
