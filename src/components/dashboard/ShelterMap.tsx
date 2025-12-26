import { MapPin, Users, Wifi, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface Shelter {
  id: string;
  name: string;
  distance: string;
  capacity: number;
  current: number;
  amenities: string[];
  status: "open" | "full" | "limited";
}

interface ShelterMapProps {
  shelters: Shelter[];
}

const statusConfig = {
  open: { label: "Open", variant: "default" as const, color: "bg-success" },
  limited: { label: "Limited", variant: "outline" as const, color: "bg-warning" },
  full: { label: "Full", variant: "destructive" as const, color: "bg-destructive" },
};

export function ShelterMap({ shelters }: ShelterMapProps) {
  return (
    <Card variant="glass" className="slide-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Nearby Shelters
        </CardTitle>
        <Button variant="outline" size="sm">View Map</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {shelters.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Searching for nearby shelters...</p>
        ) : (
          shelters.map((shelter) => {
            const config = statusConfig[shelter.status];
            const occupancy = Math.round((shelter.current / shelter.capacity) * 100);
            
            return (
              <div
                key={shelter.id}
                className="p-4 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{shelter.name}</h4>
                    <p className="text-xs text-muted-foreground">{shelter.distance} away</p>
                  </div>
                  <Badge variant={config.variant} className="text-[10px] h-5">{config.label}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Capacity
                    </span>
                    <span>{shelter.current}/{shelter.capacity}</span>
                  </div>
                  <Progress value={occupancy} className="h-1.5" />
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  {shelter.amenities.includes("wifi") && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-2 gap-1 font-normal">
                      <Wifi className="h-2.5 w-2.5" /> WiFi
                    </Badge>
                  )}
                  {shelter.amenities.includes("power") && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-2 gap-1 font-normal">
                      <Zap className="h-2.5 w-2.5" /> Power
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}