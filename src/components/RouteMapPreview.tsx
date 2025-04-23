"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";

// Fix default icon issue (same as in AdminMap)
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface RouteMapPreviewProps {
  polylinePath: LatLngExpression[];
}

// Helper component to fit map bounds to the polyline
function FitBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] }); // Add padding
    }
  }, [bounds, map]);
  return null;
}

const RouteMapPreview: React.FC<RouteMapPreviewProps> = ({ polylinePath }) => {
  if (!polylinePath || polylinePath.length === 0) {
    return (
      <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
        No route path available.
      </div>
    );
  }

  // Calculate bounds for the polyline
  const bounds = L.latLngBounds(polylinePath);

  return (
    <MapContainer
      bounds={bounds} // Set initial bounds
      scrollWheelZoom={false} // Disable scroll wheel zoom for preview
      style={{ height: "200px", width: "100%", borderRadius: "8px" }} // Fixed height, rounded corners
      zoomSnap={0.1} // Allow finer zoom levels if needed
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        pathOptions={{ color: "blue", weight: 4 }}
        positions={polylinePath}
      />
      {/* Optional: Add markers for start and end points */}
      {polylinePath.length > 0 && (
        <Marker position={polylinePath[0]} title="Start Point" />
      )}
      {polylinePath.length > 1 && (
        <Marker
          position={polylinePath[polylinePath.length - 1]}
          title="End Point"
        />
      )}
      {/* Fit bounds after initial render */}
      <FitBounds bounds={bounds} />
    </MapContainer>
  );
};

export default RouteMapPreview;
