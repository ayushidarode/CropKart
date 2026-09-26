import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Truck, UserCheck, ShieldCheck, Clock, Gauge, ArrowRight } from 'lucide-react';
import Button from './Button';
import Squiggle from './Squiggle';

// Default Maharashtra / Gujarat Agri Corridor Coordinates for demo
const DEFAULT_LOCATIONS = {
  farmer: { lat: 19.9975, lng: 73.7898, name: "Nashik Farm Cluster", role: "Farmer Source" },
  transporter: { lat: 19.4500, lng: 73.2000, name: "Kisan Logistics Truck #MH-15-4089", role: "Transporter Active" },
  buyer: { lat: 19.0760, lng: 72.8777, name: "Vashi APMC Wholesale Market", role: "Buyer Hub" },
};

export default function MapView({
  farmerLoc = DEFAULT_LOCATIONS.farmer,
  transporterLoc = DEFAULT_LOCATIONS.transporter,
  buyerLoc = DEFAULT_LOCATIONS.buyer,
  cropName = "Sharbati Wheat Grade A",
  orderId = "CK-ORD-9021",
  distanceKm = 168,
  etaHours = "3h 40m",
  className = "",
  showControls = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapError, setMapError] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [truckPos, setTruckPos] = useState(transporterLoc);

  // Fallback interactive vector canvas if Leaflet CDN tile fails
  useEffect(() => {
    let map = null;
    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import('leaflet')).default;

        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Custom DivIcon pins
        const createPin = (colorBg, textColor, iconEmoji, title) => {
          return L.divIcon({
            className: 'custom-map-pin',
            html: `
              <div style="background-color: ${colorBg}; color: ${textColor}; padding: 6px 10px; border-radius: 999px; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 11px; border: 2px solid #ffffff; white-space: nowrap;">
                <span>${iconEmoji}</span>
                <span>${title}</span>
              </div>
            `,
            iconSize: [120, 32],
            iconAnchor: [60, 16],
          });
        };

        const farmerPin = createPin('#285C38', '#ffffff', '🌾', 'Farmer Source');
        const buyerPin = createPin('#3E7CA8', '#ffffff', '🏢', 'Buyer Hub');
        const truckPin = createPin('#D4E85A', '#16311F', '🚛', 'Live Vehicle');

        // Create Leaflet Map centered between Nashik & Mumbai
        map = L.map(mapContainerRef.current, {
          center: [19.5, 73.3],
          zoom: 8,
          zoomControl: false,
        });

        // Clean muted CartoDB Positron / OSM style tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add Markers
        L.marker([farmerLoc.lat, farmerLoc.lng], { icon: farmerPin })
          .addTo(map)
          .bindPopup(`<b>${farmerLoc.name}</b><br/>Source for ${cropName}`);

        L.marker([buyerLoc.lat, buyerLoc.lng], { icon: buyerPin })
          .addTo(map)
          .bindPopup(`<b>${buyerLoc.name}</b><br/>Delivery Destination`);

        const truckMarker = L.marker([truckPos.lat, truckPos.lng], { icon: truckPin })
          .addTo(map)
          .bindPopup(`<b>Live Transporter</b><br/>Speed: 52 km/h • Temp: 18°C`);

        // Route Polyline with brand lime & forest styling
        const routePoints = [
          [farmerLoc.lat, farmerLoc.lng],
          [19.75, 73.55],
          [19.58, 73.35],
          [truckPos.lat, truckPos.lng],
          [19.25, 73.05],
          [19.15, 72.98],
          [buyerLoc.lat, buyerLoc.lng],
        ];

        // Background polyline glow
        L.polyline(routePoints, {
          color: '#285C38',
          weight: 6,
          opacity: 0.85,
        }).addTo(map);

        // Foreground lime route pulse
        L.polyline(routePoints, {
          color: '#D4E85A',
          weight: 3,
          dashArray: '8, 8',
          opacity: 0.95,
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("Leaflet tile render fallback:", err);
        setMapError(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative bg-surface-0 border border-line-200 rounded-card overflow-hidden shadow-ambient ${className}`}>
      {/* Map Header Floating Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-surface-0/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-line-200 shadow-ambient flex items-center gap-3 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-forest-500 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">
              AI Route Optimizer • Order {orderId}
            </span>
            <span className="text-xs font-bold text-forest-900">
              {farmerLoc.name.split(',')[0]} → {buyerLoc.name.split(',')[0]}
            </span>
          </div>
        </div>

        {/* Telemetry pill */}
        <div className="bg-forest-900/90 text-white backdrop-blur-md px-4 py-2 rounded-xl shadow-ambient flex items-center gap-4 text-xs tabular-nums pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-lime-400" />
            <span><strong>{distanceKm}</strong> km total</span>
          </div>
          <div className="h-3 w-px bg-forest-700" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-lime-400" />
            <span>ETA: <strong>{etaHours}</strong></span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[320px] sm:h-[420px] bg-sage-50 z-0"
      />

      {/* Route Bottom telemetry panel */}
      {showControls && (
        <div className="p-4 bg-surface-0 border-t border-line-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-forest-700 border-2 border-white shadow-sm" />
              <span className="text-ink-600 font-medium">Farmer (Pickup)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-lime-400 border-2 border-forest-900 shadow-sm" />
              <span className="text-ink-600 font-medium">Transporter (Live en route)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-steel-500 border-2 border-white shadow-sm" />
              <span className="text-ink-600 font-medium">Buyer (APMC Terminal)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-pill bg-lime-100 text-forest-800 font-semibold text-[11px]">
              AI Route: -28 km / 14% Fuel Saved
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
