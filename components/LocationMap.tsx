'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapEvents({ onMoveEnd }: { onMoveEnd: (center: L.LatLng) => void }) {
  useMapEvents({
    moveend: (e) => {
      onMoveEnd(e.target.getCenter());
    },
  });
  return null;
}

export default function LocationMap({ 
  onLocationChange, 
  initialPos 
}: { 
  onLocationChange: (lat: number, lng: number) => void, 
  initialPos?: [number, number] 
}) {
  useEffect(() => {
    // Fix typical Leaflet icon issue on client side
    if (L.Icon.Default.prototype) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }
  }, []);

  const defaultPos: [number, number] = initialPos || [47.9184, 106.9177]; // Ulaanbaatar center
  
  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      {/* We use key to force re-render when initialPos is found via geolocation later */}
      <MapContainer 
        key={initialPos ? `${initialPos[0]}` : 'default'}
        center={defaultPos} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapEvents onMoveEnd={(center) => onLocationChange(center.lat, center.lng)} />
      </MapContainer>
    </div>
  );
}
