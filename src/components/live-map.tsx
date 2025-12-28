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
  const westBengalCenter: [number, number] = [22.9868, 87.8550];

  return (
    <div style={{ height: '100%', width: '100%', background: '#f8fafc' }}>
      <MapContainer 
        center={westBengalCenter} 
        zoom={7} 
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {shelters?.map((shelter) => {
          // DEFENSIVE CHECK: Support both 'coords' and 'coordinates' naming
          const location = shelter.coords || shelter.coordinates;

          // If location data is missing, skip this marker instead of crashing
          if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            console.warn(`Skipping shelter ${shelter.id || 'unknown'} due to missing lat/lng:`, location);
            return null;
          }

          return (
            <Marker 
              key={shelter.id} 
              position={[location.lat, location.lng]}
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
                       {(shelter.status || 'closed').toUpperCase()}
                     </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}