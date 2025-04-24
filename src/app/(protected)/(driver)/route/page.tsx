"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  orderBy,
  Timestamp,
  GeoPoint,
} from "firebase/firestore";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";

// Interface for route data relevant to the driver
interface DriverRouteData {
  id: string;
  name: string;
  imageIds: string[];
  createdAt: Timestamp;
  coordinates: GeoPoint[];
  polylinePath: LatLngExpression[];
}

const RouteMapPreviewWithNoSSR = dynamic(
  () => import("@/components/RouteMapPreview"),
  {
    loading: () => (
      <div className="h-[200px] w-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
        Loading map...
      </div>
    ),
    ssr: false,
  }
);

export default function DriverPage() {
  const [routes, setRoutes] = useState<DriverRouteData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      try {
        const routesCollection = collection(db, "routes");
        const q = query(routesCollection, orderBy("createdAt", "desc"));

        const querySnapshot = await getDocs(q);
        const fetchedRoutes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const polylinePath = ((data.coordinates as GeoPoint[]) || []).map(
            (gp) => [gp.latitude, gp.longitude] as LatLngExpression
          );
          return {
            id: doc.id,
            name: data.name || "Unnamed Route",
            imageIds: data.imageIds || [],
            createdAt: data.createdAt || Timestamp.now(),
            coordinates: data.coordinates || [],
            polylinePath: polylinePath,
          } as DriverRouteData;
        });
        setRoutes(fetchedRoutes);
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Failed to load available routes.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const selectedRouteDetails = useMemo(() => {
    return routes.find((route) => route.id === selectedRouteId);
  }, [routes, selectedRouteId]);

  const handleSelectRoute = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRouteId(event.target.value);
  };

  const handleStartRoute = () => {
    if (!selectedRouteDetails) {
      alert("Please select a route first.");
      return;
    }

    const { coordinates, name } = selectedRouteDetails;

    if (!coordinates || coordinates.length < 2) {
      alert("Route does not have enough points to generate directions.");
      return;
    }

    // Base URL for Google Maps Directions
    const baseUrl = "https://www.google.com/maps/dir/";

    // Format coordinates as "latitude,longitude" strings
    const formattedCoords = coordinates.map(
      (gp: GeoPoint) => `${gp.latitude},${gp.longitude}`
    );

    // Origin is the first point
    const origin = formattedCoords[0];
    // Destination is the last point
    const destination = formattedCoords[formattedCoords.length - 1];

    // Waypoints are points between origin and destination
    const waypoints = formattedCoords.slice(1, -1).join("|");

    // Construct the final URL
    let googleMapsUrl = `${baseUrl}${origin}/`;
    if (waypoints) {
      googleMapsUrl += `${waypoints}/`;
    }
    googleMapsUrl += destination;

    console.log("Starting route:", name, selectedRouteDetails.id);
    console.log("Redirecting to Google Maps:", googleMapsUrl);

    // Redirect the user to Google Maps in a new tab (optional) or same tab
    // window.open(googleMapsUrl, '_blank'); // Opens in new tab
    window.location.href = googleMapsUrl; // Opens in the same tab
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50 mt-16">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
        Select Your Route
      </h1>

      {loading && <p className="text-gray-600">Loading available routes...</p>}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded">Error: {error}</p>
      )}

      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label
              htmlFor="route-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Available Routes:
            </label>
            <select
              id="route-select"
              value={selectedRouteId}
              onChange={handleSelectRoute}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                -- Select a Route --
              </option>
              {routes.length === 0 && <option disabled>No routes found</option>}
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} (Created:{" "}
                  {route.createdAt.toDate().toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedRouteDetails && (
            <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Selected Route Details:
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2 space-y-1">
                  <p>
                    <strong>Name:</strong> {selectedRouteDetails.name}
                  </p>
                  <p>
                    <strong>Number of Stops:</strong>{" "}
                    {selectedRouteDetails.imageIds.length}
                  </p>
                  <p>
                    <strong>Created On:</strong>{" "}
                    {selectedRouteDetails.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
                <div className="md:w-1/2">
                  <RouteMapPreviewWithNoSSR
                    polylinePath={selectedRouteDetails.polylinePath}
                  />
                </div>
              </div>
              <button
                onClick={handleStartRoute}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Start Selected Route
              </button>
            </div>
          )}

          {!selectedRouteDetails && selectedRouteId && (
            <p className="text-sm text-yellow-600 mt-4">
              Loading route details or route not found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
