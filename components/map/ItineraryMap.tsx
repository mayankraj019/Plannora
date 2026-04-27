"use client";
import { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { MAP_STYLES } from "@/lib/maptiler";

interface Activity {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  category: string;
  time: string;
}

interface ItineraryMapProps {
  activities: Activity[];
  activeActivityId?: string;
  onActivityClick?: (id: string) => void;
  traceLiveLocation?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  culture:     "#E8935A",
  food:        "#3ECFB2",
  nature:      "#52C97A",
  adventure:   "#F0614F",
  shopping:    "#C9A84C",
  relaxation:  "#8B7CF6",
  transport:   "#94A3B8",
};

export default function ItineraryMap({ activities, activeActivityId, onActivityClick, traceLiveLocation }: ItineraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markers = useRef<maptilersdk.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const firstWithCoords = activities.find(a => a.coordinates?.lat);
    const center = firstWithCoords
      ? [firstWithCoords.coordinates.lng, firstWithCoords.coordinates.lat]
      : [0, 20];

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: MAP_STYLES.streets,
      center: center as [number, number],
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });

    const geolocate = new maptilersdk.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    map.current.addControl(geolocate);

    map.current.on("load", () => {
      addMarkersAndRoutes();
      // Auto-trigger geolocation if no activities are present or if explicitly requested
      if (activities.length === 0 || traceLiveLocation) {
        geolocate.trigger();
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const addMarkersAndRoutes = () => {
    if (!map.current) return;

    markers.current.forEach(m => m.remove());
    markers.current = [];

    const coords: [number, number][] = [];

    activities.forEach((activity, index) => {
      if (!activity.coordinates || typeof activity.coordinates.lat !== 'number') return;
      const { lat, lng } = activity.coordinates;
      coords.push([lng, lat]);

      const el = document.createElement("div");
      el.className = "plannora-marker";
      el.style.cssText = `
        width: 36px; height: 36px;
        background: ${CATEGORY_COLORS[activity.category] || "#E8935A"};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
        animation: markerDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        animation-delay: ${index * 120}ms;
        opacity: 0;
      `;

      const label = document.createElement("span");
      // Use activity type to decide label (number for activities, emoji/icon for restaurants)
      label.textContent = (activity as any).type === 'restaurant' ? "🍴" : String(index + 1);
      label.style.cssText = `
        transform: rotate(45deg);
        color: white;
        font-size: ${(activity as any).type === 'restaurant' ? '14px' : '12px'};
        font-weight: 700;
        display: block;
      `;
      el.appendChild(label);

      el.addEventListener("click", () => onActivityClick?.(activity.id));
      el.addEventListener("mouseenter", () => {
        el.style.transform = "rotate(-45deg) scale(1.2)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "rotate(-45deg) scale(1)";
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      });

      const popup = new maptilersdk.Popup({ 
        offset: 25, 
        className: "plannora-popup",
        focusAfterOpen: false,
        closeButton: false
      })
        .setHTML(`
          <div style="padding: 8px; min-width: 160px; color: black;">
            <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px;">${activity.name}</p>
            <p style="font-size: 11px; color: #888; margin: 0;">${activity.time} · ${activity.location}</p>
          </div>
        `);

      const marker = new maptilersdk.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    if (coords.length > 1 && map.current.isStyleLoaded()) {
      if (map.current.getSource("route")) {
        (map.current.getSource("route") as maptilersdk.GeoJSONSource).setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        });
      } else {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords },
            properties: {},
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#E8935A",
            "line-width": 3,
            "line-dasharray": [2, 2],
            "line-opacity": 0.8,
          },
        });
      }
    }

    if (coords.length > 0) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maptilersdk.LngLatBounds(coords[0], coords[0])
      );
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
    }
  };

  useEffect(() => {
    if (!map.current) return;
    
    if (map.current.isStyleLoaded()) {
      addMarkersAndRoutes();
    } else {
      map.current.once("load", addMarkersAndRoutes);
    }
  }, [activities]);

  useEffect(() => {
    markers.current.forEach((marker, i) => {
      const el = marker.getElement();
      if (activities[i]?.id === activeActivityId) {
        el.style.transform = "rotate(-45deg) scale(1.3)";
        el.style.zIndex = "10";
        marker.togglePopup();
      } else {
        el.style.transform = "rotate(-45deg) scale(1)";
        el.style.zIndex = "1";
      }
    });
  }, [activeActivityId, activities]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-xl overflow-hidden shadow-lg"
    />
  );
}
