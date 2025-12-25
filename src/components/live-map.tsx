import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from "@/lib/utils"; 

// Fix for default icons in Vite/React environment
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function LiveMap({ shelters }: { shelters: any[] }) {
  const westBengalCenter: [number, number] = [23.9868, 87.8550];

  return (
    <div style={{ height: '100%', width: '100%', background: '#f8fafc' }}>
      <MapContainer 
        center={westBengalCenter} 
        zoom={7} 
        zoomControl={false}      // Keeps the UI clean (removes buttons)
        scrollWheelZoom={true}   // Allows trackpad/mouse wheel zooming
        touchZoom={true}         // Ensures two-finger pinch works on mobile/tablets
        dragging={true}          // Allows users to move the map
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {shelters.map((shelter) => (
          <Marker 
            key={shelter.id} 
            position={[shelter.coords.lat, shelter.coords.lng]}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-primary">{shelter.name}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight my-1">
                  {shelter.address}
                </p>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-[10px] font-bold">Capacity: {shelter.capacity}</span>
                   <span className={cn(
                     "text-[10px] px-1 rounded border",
                     shelter.status === 'open' ? "text-emerald-600 border-emerald-200" : "text-rose-600 border-rose-200"
                   )}>
                     {shelter.status.toUpperCase()}
                   </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}



