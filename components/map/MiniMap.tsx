"use client";
import { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { MAP_STYLES } from "@/lib/maptiler";

export default function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maptilersdk.Map({
      container: mapContainer.current,
      style: MAP_STYLES.pastel,   // beautiful pastel style for cards
      center: [lng, lat],
      zoom: 10,
      interactive: false,                   // non-interactive for card thumbnails
    });

    new maptilersdk.Marker({ color: "#E8935A" })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => map.remove();
  }, [lat, lng]);

  return <div ref={mapContainer} className="w-full h-[160px] rounded-lg" />;
}
