"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  GeoPoint,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";

// Define an interface for the Icon Default prototype that includes _getIconUrl
interface ExtendedIconDefaultPrototype extends L.Icon.Default {
  _getIconUrl?: string;
}

// Fix default icon issue with React-Leaflet and Webpack
delete (L.Icon.Default.prototype as ExtendedIconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Interfaces ---
interface ImageData {
  id: string;
  imageUrl: string;
  coordinates: GeoPoint;
  timestamp: Timestamp;
  // Add other relevant fields if needed, e.g., name, description
}

interface RouteData {
  id: string;
  name: string;
  imageIds: string[];
  coordinates: GeoPoint[]; // Store original GeoPoints from images
  timestamps: Timestamp[];
  polylinePath: LatLngExpression[]; // Store calculated path for direct use
  createdAt: Timestamp;
}

// --- Helper Component to Adjust Map View ---
interface ChangeViewProps {
  center: LatLngExpression;
  zoom: number;
}
function ChangeView({ center, zoom }: ChangeViewProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// --- Main Map Component ---
export default function AdminMap() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [routeName, setRouteName] = useState("");
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapCenter = useMemo<LatLngExpression>(
    () => [20.5937, 78.9629], // Default center (India)
    []
  );
  const mapZoom = 5;

  // --- Data Fetching ---
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoadingImages(true);
      setError(null);
      try {
        const imagesCollection = collection(db, "images");
        const q = query(imagesCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        console.log(
          `Fetched ${querySnapshot.docs.length} image documents from Firestore.`
        ); // Log initial count

        const fetchedImages = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const id = doc.id;

            // Validate required fields
            if (!data.coordinates || !(data.coordinates instanceof GeoPoint)) {
              console.warn(
                `Image ${id} missing or invalid 'coordinates' (GeoPoint). Skipping.`
              );
              return null;
            }
            if (
              !data.imageUrl ||
              typeof data.imageUrl !== "string" ||
              data.imageUrl.trim() === ""
            ) {
              console.warn(
                `Image ${id} missing or invalid 'imageUrl' (string). Skipping.`
              );
              return null;
            }
            if (!data.timestamp || !(data.timestamp instanceof Timestamp)) {
              console.warn(
                `Image ${id} missing or invalid 'timestamp' (Timestamp). Skipping.`
              );
              return null;
            }

            console.log(
              `Image ${id} fetched with coordinates: ${data.coordinates.latitude}, ${data.coordinates.longitude}`
            ); // Log each image's coordinates
            // Construct the ImageData object
            return {
              id: id,
              imageUrl: data.imageUrl,
              coordinates: data.coordinates,
              timestamp: data.timestamp,
            } as ImageData;
          })
          .filter((img): img is ImageData => img !== null); // Filter out the nulls where validation failed

        console.log(
          `Processed ${fetchedImages.length} valid images after filtering.`
        ); // Log final count
        setImages(fetchedImages);
      } catch (err) {
        console.error("Error fetching images:", err);
        setError("Failed to load images. Check console for details.");
        if (err instanceof Error && err.message.includes("requires an index")) {
          setError(
            "Database index missing for image query. Check Firestore console."
          );
        } else if (err instanceof Error && err.message.includes("timestamp")) {
          setError(
            "Error querying images by timestamp. Ensure all images have a valid timestamp field."
          );
        }
      } finally {
        setIsLoadingImages(false);
      }
    };

    const fetchRoutes = async () => {
      setIsLoadingRoutes(true);
      setError(null);
      try {
        const routesCollection = collection(db, "routes");
        const q = query(routesCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedRoutes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const polylinePath = (data.coordinates as GeoPoint[]).map(
            (gp) => [gp.latitude, gp.longitude] as LatLngExpression
          );
          return {
            id: doc.id,
            ...data,
            polylinePath: polylinePath,
          } as RouteData;
        });
        setSavedRoutes(fetchedRoutes);
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Failed to load saved routes.");
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchImages();
    fetchRoutes();
  }, []);

  // --- Event Handlers ---
  const handleImageSelect = (image: ImageData) => {
    if (selectedRoute) setSelectedRoute(null);
    setSelectedImages((prev) => {
      if (prev.find((img) => img.id === image.id)) {
        return prev.filter((img) => img.id !== image.id);
      }
      return [...prev, image];
    });
  };

  const handleClearSelection = () => {
    setSelectedImages([]);
    setSelectedRoute(null);
    setRouteName("");
  };

  const handleSaveRoute = async () => {
    if (selectedImages.length < 2 || !routeName.trim()) {
      alert("Please select at least two images and provide a route name.");
      return;
    }
    setError(null);
    try {
      const routeDataToSave = {
        name: routeName.trim(),
        imageIds: selectedImages.map((img) => img.id),
        coordinates: selectedImages.map((img) => img.coordinates),
        timestamps: selectedImages.map((img) => img.timestamp),
        createdAt: Timestamp.now(),
      };
      const routesCollection = collection(db, "routes");
      const docRef = await addDoc(routesCollection, routeDataToSave);
      console.log("Route saved with ID: ", docRef.id);

      const newRoute: RouteData = {
        ...routeDataToSave,
        id: docRef.id,
        polylinePath: routeDataToSave.coordinates.map(
          (gp) => [gp.latitude, gp.longitude] as LatLngExpression
        ),
      };
      setSavedRoutes((prev) => [newRoute, ...prev]);
      handleClearSelection();
      alert("Route saved successfully!");
    } catch (err) {
      console.error("Error saving route:", err);
      setError("Failed to save route.");
      alert("Error saving route. Check console for details.");
    }
  };

  const handleLoadRoute = (routeId: string) => {
    const routeToLoad = savedRoutes.find((r) => r.id === routeId);
    if (routeToLoad) {
      setSelectedImages([]);
      setSelectedRoute(routeToLoad);
      setRouteName(routeToLoad.name);
    }
  };

  const currentPolyline = useMemo(() => {
    if (selectedRoute) {
      return selectedRoute.polylinePath;
    }
    if (selectedImages.length >= 2) {
      return selectedImages.map(
        (img) =>
          [
            img.coordinates.latitude,
            img.coordinates.longitude,
          ] as LatLngExpression
      );
    }
    return [];
  }, [selectedImages, selectedRoute]);

  const markersToDisplay = useMemo(() => {
    if (selectedRoute) {
      return selectedRoute.imageIds
        .map((id) => images.find((img) => img.id === id))
        .filter((img): img is ImageData => !!img);
    }
    return images;
  }, [selectedRoute, images]);

  const currentMapCenter = useMemo(() => {
    if (selectedRoute && selectedRoute.polylinePath.length > 0) {
      return selectedRoute.polylinePath[0];
    }
    if (selectedImages.length > 0) {
      return [
        selectedImages[0].coordinates.latitude,
        selectedImages[0].coordinates.longitude,
      ] as LatLngExpression;
    }
    return mapCenter;
  }, [selectedRoute, selectedImages, mapCenter]);

  const currentMapZoom = useMemo(() => {
    if (selectedRoute || selectedImages.length > 0) {
      return 13;
    }
    return mapZoom;
  }, [selectedRoute, selectedImages, mapZoom]);

  /* const createThumbnailIcon = (imageUrl: string) => {
    return new L.Icon({
      iconUrl: imageUrl,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }; */

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <div className="w-1/3 lg:w-1/4 p-4 overflow-y-auto bg-gray-100 border-r border-gray-300 flex flex-col space-y-4">
        <h2 className="text-xl font-semibold mb-2 text-center">
          Route Planner
        </h2>

        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded text-sm">
            Error: {error}
          </p>
        )}

        <div className="p-3 border rounded bg-white shadow-sm">
          <h3 className="font-semibold mb-2 border-b pb-1">Create New Route</h3>
          <input
            type="text"
            placeholder="Enter Route Name"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
            disabled={!!selectedRoute}
          />
          <div className="mb-2">
            <h4 className="font-medium text-sm mb-1">
              Selected Images ({selectedImages.length}):
            </h4>
            <ul className="text-xs list-decimal list-inside max-h-24 overflow-y-auto bg-gray-50 p-1 rounded border">
              {selectedImages.length === 0 && (
                <li className="text-gray-500 italic">None selected</li>
              )}
              {selectedImages.map((img, index) => (
                <li key={img.id}>
                  {index + 1}. ID: ...{img.id.slice(-6)}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleSaveRoute}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              selectedImages.length < 2 || !routeName.trim() || !!selectedRoute
            }
          >
            Save Current Route
          </button>
          <button
            onClick={handleClearSelection}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedImages.length === 0 && !selectedRoute}
          >
            Clear Selection / Route
          </button>
        </div>

        <div className="p-3 border rounded bg-white shadow-sm">
          <h3 className="font-semibold mb-2 border-b pb-1">Load Saved Route</h3>
          {isLoadingRoutes ? (
            <p className="text-sm text-gray-500">Loading routes...</p>
          ) : savedRoutes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No saved routes found.
            </p>
          ) : (
            <select
              onChange={(e) => handleLoadRoute(e.target.value)}
              value={selectedRoute?.id || ""}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="" disabled>
                -- Select a route --
              </option>
              {savedRoutes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} ({route.imageIds.length} stops)
                </option>
              ))}
            </select>
          )}
          {selectedRoute && (
            <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-200">
              <p>
                Displaying route: <strong>{selectedRoute.name}</strong>
              </p>
              <p>Stops: {selectedRoute.imageIds.length}</p>
              <p>
                Created: {selectedRoute.createdAt.toDate().toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="p-3 border rounded bg-white shadow-sm flex-grow overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-2 border-b pb-1">Available Images</h3>
          {isLoadingImages ? (
            <p className="text-sm text-gray-500">Loading images...</p>
          ) : images.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No images found.</p>
          ) : (
            <ul className="space-y-1 overflow-y-auto flex-grow">
              {images.map((image) => (
                <li
                  key={image.id}
                  className={`p-1.5 border rounded cursor-pointer hover:bg-gray-200 flex items-center ${
                    selectedImages.find((si) => si.id === image.id)
                      ? "bg-blue-100 border-blue-300"
                      : "bg-white"
                  }`}
                  onClick={() => handleImageSelect(image)}
                  title={`Lat: ${image.coordinates.latitude.toFixed(
                    4
                  )}, Lng: ${image.coordinates.longitude.toFixed(
                    4
                  )}\nTimestamp: ${image.timestamp.toDate().toLocaleString()}`}
                >
                  <img
                    src={image.imageUrl}
                    alt={`Thumb ${image.id}`}
                    className="w-10 h-10 object-cover rounded-sm inline-block mr-2 border"
                  />
                  <span className="text-xs">ID: ...{image.id.slice(-6)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="w-2/3 lg:w-3/4 h-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <ChangeView center={currentMapCenter} zoom={currentMapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markersToDisplay.map((image) => (
            <Marker
              key={image.id}
              position={[
                image.coordinates.latitude,
                image.coordinates.longitude,
              ]}
              eventHandlers={{
                click: () => handleImageSelect(image),
              }}
            >
              <Popup minWidth={120}>
                <div className="text-center">
                  <img
                    src={image.imageUrl}
                    alt={`Image ${image.id}`}
                    className="w-24 h-24 object-cover mx-auto mb-1 rounded"
                  />
                  <br />
                  <span className="font-semibold text-xs">
                    ID: ...{image.id.slice(-6)}
                  </span>{" "}
                  <br />
                  <span className="text-xs">
                    Time: {image.timestamp.toDate().toLocaleTimeString()}
                  </span>{" "}
                  <br />
                  {selectedImages.findIndex((si) => si.id === image.id) !==
                    -1 && (
                    <>
                      <span className="text-xs font-bold text-blue-600">
                        Selected: #
                        {selectedImages.findIndex((si) => si.id === image.id) +
                          1}
                      </span>
                      <br />
                    </>
                  )}
                  <button
                    onClick={() => handleImageSelect(image)}
                    className="text-blue-600 hover:underline text-xs mt-1 px-2 py-0.5 rounded border border-blue-300 hover:bg-blue-50"
                  >
                    {selectedImages.find((si) => si.id === image.id)
                      ? "Remove from Route"
                      : "Add to Route"}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {currentPolyline.length > 0 && (
            <Polyline
              pathOptions={{ color: "red", weight: 3 }}
              positions={currentPolyline}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
