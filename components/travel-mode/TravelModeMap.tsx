"use client";

import { useEffect, useRef, useCallback } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { MAP_STYLES } from "@/lib/maptiler";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Activity {
  id: string;
  name: string;
  location?: string;
  coordinates?: Coordinates;
  category?: string;
  time?: string;
}

interface TravelModeMapProps {
  activities: Activity[];
  selectedActivity: Activity | null;
  userLocation: Coordinates | null;
  mapCenter: Coordinates;
  onActivityClick: (activity: Activity) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  culture: "#E8935A",
  food: "#3ECFB2",
  nature: "#52C97A",
  adventure: "#F0614F",
  shopping: "#C9A84C",
  relaxation: "#8B7CF6",
  transport: "#94A3B8",
  attraction: "#F59E0B",
};

export default function TravelModeMap({
  activities,
  selectedActivity,
  userLocation,
  mapCenter,
  onActivityClick,
}: TravelModeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markers = useRef<maptilersdk.Marker[]>([]);
  const userMarker = useRef<maptilersdk.Marker | null>(null);
  const activityRef = useRef(activities);

  useEffect(() => {
    activityRef.current = activities;
  }, [activities]);

  // Initialise map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: MAP_STYLES.dark,
      center: [mapCenter.lng, mapCenter.lat],
      zoom: 13,
      pitch: 0,
      bearing: 0,
    });

    map.current.on("load", () => {
      addMarkers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── Add activity markers ──
  const addMarkers = () => {
    if (!map.current) return;

    // Clear old markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    activities.forEach((activity, index) => {
      if (!activity.coordinates?.lat) return;
      const { lat, lng } = activity.coordinates;
      const catColor = CATEGORY_COLORS[activity.category || ""] || "#E8935A";
      const isSelected = selectedActivity?.id === activity.id;

      const el = document.createElement("div");
      el.className = "plannora-marker";
      // Min 44px for mobile touch targets (Apple HIG)
      const size = isSelected ? 48 : 44;
      el.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${catColor};
        border: 3px solid ${isSelected ? "#FFD166" : "white"};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: pointer;
        box-shadow: ${isSelected ? `0 0 20px ${catColor}80, 0 4px 16px rgba(0,0,0,0.4)` : "0 4px 12px rgba(0,0,0,0.3)"};
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        animation: markerDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        animation-delay: ${index * 80}ms;
        opacity: 0;
        z-index: ${isSelected ? 20 : 1};
      `;

      const label = document.createElement("span");
      label.textContent = String(index + 1);
      label.style.cssText = `
        transform: rotate(45deg);
        color: white;
        font-size: ${isSelected ? "14px" : "11px"};
        font-weight: 700;
        display: block;
      `;
      el.appendChild(label);

      el.addEventListener("click", () => {
        const act = activityRef.current[index];
        if (act) onActivityClick(act);
      });

      const popup = new maptilersdk.Popup({
        offset: 25,
        className: "plannora-popup",
        focusAfterOpen: false,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 8px; min-width: 140px; color: white; background: rgba(5,10,24,0.95); border-radius: 10px;">
          <p style="font-weight: 700; font-size: 12px; margin: 0 0 2px;">${activity.name}</p>
          <p style="font-size: 10px; color: rgba(255,255,255,0.5); margin: 0;">${activity.time || ""} · ${activity.location || ""}</p>
        </div>
      `);

      const marker = new maptilersdk.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      if (isSelected) marker.togglePopup();
      markers.current.push(marker);
    });
  };

  // Redraw markers when activities or selection changes
  useEffect(() => {
    if (!map.current) return;
    if (map.current.isStyleLoaded()) {
      addMarkers();
    } else {
      map.current.once("load", addMarkers);
    }
  }, [activities, selectedActivity, onActivityClick]);

  // ── User location blue dot ──
  useEffect(() => {
    if (!map.current || !userLocation) return;

    if (userMarker.current) {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
      return;
    }

    const el = document.createElement("div");
    el.className = "travel-mode-user-dot";
    el.innerHTML = `
      <div class="travel-mode-pulse"></div>
      <div style="
        width: 16px; height: 16px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(59,130,246,0.6);
        position: relative; z-index: 2;
      "></div>
    `;

    userMarker.current = new maptilersdk.Marker({ element: el, anchor: "center" })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
  }, [userLocation]);

  // ── Draw route line from user to selected ──
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const sourceId = "travel-route";
    const layerId = "travel-route-line";

    if (userLocation && selectedActivity?.coordinates) {
      const coords: [number, number][] = [
        [userLocation.lng, userLocation.lat],
        [selectedActivity.coordinates.lng, selectedActivity.coordinates.lat],
      ];

      const data: GeoJSON.Feature = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: {},
      };

      if (map.current.getSource(sourceId)) {
        (map.current.getSource(sourceId) as maptilersdk.GeoJSONSource).setData(data);
      } else {
        map.current.addSource(sourceId, { type: "geojson", data });
        map.current.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#3B82F6",
            "line-width": 3,
            "line-dasharray": [3, 3],
            "line-opacity": 0.7,
          },
        });
      }

      // Fit bounds to show user + destination
      const bounds = new maptilersdk.LngLatBounds(coords[0], coords[0]);
      coords.forEach((c) => bounds.extend(c));
      // Responsive padding: smaller on mobile to avoid squishing
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      map.current.fitBounds(bounds, { padding: isMobile ? 40 : 80, maxZoom: 15, duration: 800 });
    } else {
      // Remove line when no selection or no user location
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
    }
  }, [userLocation, selectedActivity]);

  // ── Fly to selected activity ──
  useEffect(() => {
    if (!map.current || !selectedActivity?.coordinates) return;
    if (!userLocation) {
      map.current.flyTo({
        center: [selectedActivity.coordinates.lng, selectedActivity.coordinates.lat],
        zoom: 15,
        duration: 800,
      });
    }
  }, [selectedActivity, userLocation]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-none lg:rounded-2xl overflow-hidden"
    />
  );
}
