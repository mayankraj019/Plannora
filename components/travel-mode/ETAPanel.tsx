"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Car, Footprints, ExternalLink, MapPin } from "lucide-react";
import {
  haversineDistance,
  estimateETA,
  formatDistance,
  buildGoogleMapsUrl,
} from "./travelModeUtils";

interface ETAPanelProps {
  /** Currently selected destination */
  destination: {
    name: string;
    location?: string;
    coordinates: { lat: number; lng: number };
  } | null;
  /** User's live GPS position */
  userLocation: { lat: number; lng: number } | null;
}

export default function ETAPanel({ destination, userLocation }: ETAPanelProps) {
  if (!destination) return null;

  const hasUserLocation = !!userLocation;
  const distance = hasUserLocation
    ? haversineDistance(
        userLocation.lat,
        userLocation.lng,
        destination.coordinates.lat,
        destination.coordinates.lng
      )
    : null;

  const walkETA = distance !== null ? estimateETA(distance, "walk") : null;
  const driveETA = distance !== null ? estimateETA(distance, "drive") : null;
  const distanceLabel = distance !== null ? formatDistance(distance) : null;

  const googleMapsUrl = hasUserLocation
    ? buildGoogleMapsUrl(
        userLocation.lat,
        userLocation.lng,
        destination.coordinates.lat,
        destination.coordinates.lng
      )
    : buildGoogleMapsUrl(
        destination.coordinates.lat,
        destination.coordinates.lng,
        destination.coordinates.lat,
        destination.coordinates.lng
      );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={destination.name}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="travel-mode-eta-panel"
      >
        {/* Destination Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber/20 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-amber" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base text-white leading-tight truncate">
              {destination.name}
            </h3>
            {destination.location && (
              <p className="text-xs text-white/50 mt-0.5 truncate">
                {destination.location}
              </p>
            )}
          </div>
        </div>

        {/* Distance & ETA */}
        {hasUserLocation && distance !== null ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <Navigation className="w-4 h-4 text-teal mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{distanceLabel}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Distance</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <Car className="w-4 h-4 text-amber mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{driveETA}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Drive</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <Footprints className="w-4 h-4 text-coral mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{walkETA}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Walk</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-center border border-white/5">
            <p className="text-xs text-white/50">
              {hasUserLocation
                ? "Calculating distance..."
                : "Enable location to see distance & ETA"}
            </p>
          </div>
        )}

        {/* Google Maps Button */}
        <button
          onClick={() => window.open(googleMapsUrl, "_blank")}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-amber to-coral text-white font-semibold text-sm shadow-lg shadow-amber/20 hover:shadow-amber/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Navigation className="w-4 h-4" />
          Open in Google Maps
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
