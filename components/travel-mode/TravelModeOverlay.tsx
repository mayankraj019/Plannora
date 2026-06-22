"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Locate, AlertTriangle, Compass } from "lucide-react";
import dynamic from "next/dynamic";
import DestinationSelector from "./DestinationSelector";
import ETAPanel from "./ETAPanel";

const TravelModeMap = dynamic(() => import("./TravelModeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#080D1A]">
      <Compass className="w-8 h-8 text-amber animate-spin" />
    </div>
  ),
});

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

interface Day {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

interface TravelModeOverlayProps {
  itinerary: {
    user_destination: string;
    days: Day[];
    destinationCoordinates?: Coordinates;
  };
  mapCenter: Coordinates;
  onClose: () => void;
}

export default function TravelModeOverlay({
  itinerary,
  mapCenter,
  onClose,
}: TravelModeOverlayProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  // Start closed on mobile so the map is visible first
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  // Lock body scroll while overlay is open (prevents iOS Safari background scroll)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Request geolocation ──
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser");
      return;
    }

    setGeoError(null);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoError(null);
      },
      (err) => {
        console.warn("Travel Mode geolocation error:", err.message);
        setGeoError(
          err.code === 1
            ? "Location access denied. You can still browse destinations."
            : "Unable to determine your location"
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const cleanup = requestLocation();
    return cleanup;
  }, [requestLocation]);

  // ── Keyboard escape ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Flatten activities for the map
  const allActivities: Activity[] =
    itinerary.days?.flatMap((day) =>
      (day.activities || []).filter((a) => a.coordinates?.lat)
    ) || [];

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="travel-mode-overlay"
      >
        {/* ── Top Bar ── */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-cyan flex items-center justify-center shadow-lg shadow-teal/20">
              <Compass className="w-5 h-5 text-midnight" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-sm lg:text-base">
                Travel Mode
              </h1>
              <p className="text-[11px] text-white/50">
                {itinerary.user_destination}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle sidebar on mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Locate className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/30 hover:text-red-400 transition-colors"
              title="Exit Travel Mode (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="absolute inset-0 flex">
          {/* Map */}
          <div className="flex-1 relative">
            <TravelModeMap
              activities={allActivities}
              selectedActivity={selectedActivity}
              userLocation={userLocation}
              mapCenter={mapCenter}
              onActivityClick={handleActivitySelect}
            />

            {/* Geo Error Banner */}
            {geoError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-16 left-4 right-4 lg:right-auto lg:max-w-sm z-20 flex items-center gap-2 bg-amber/90 text-midnight px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {geoError}
              </motion.div>
            )}

            {/* ETA Panel (bottom of map) — shifts up on mobile when sheet is open */}
            {selectedActivity && (
              <div
                className={`absolute left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-20 transition-all duration-300 ${
                  sidebarOpen ? "bottom-[57vh] lg:bottom-4" : "bottom-4"
                }`}
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                <ETAPanel
                  destination={
                    selectedActivity.coordinates
                      ? {
                          name: selectedActivity.name,
                          location: selectedActivity.location,
                          coordinates: selectedActivity.coordinates,
                        }
                      : null
                  }
                  userLocation={userLocation}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <motion.div
            initial={false}
            animate={{
              width: sidebarOpen ? 320 : 0,
              opacity: sidebarOpen ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:block h-full bg-[#0A0F1C]/95 backdrop-blur-xl border-l border-white/5 overflow-hidden shrink-0"
          >
            <DestinationSelector
              days={itinerary.days || []}
              selectedId={selectedActivity?.id || null}
              userLocation={userLocation}
              onSelect={handleActivitySelect}
            />
          </motion.div>

          {/* Mobile Sidebar (slide-up sheet) */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="lg:hidden absolute bottom-0 left-0 right-0 z-40 h-[55vh] bg-[#0A0F1C]/98 backdrop-blur-xl border-t border-white/10 rounded-t-3xl overflow-hidden"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                <DestinationSelector
                  days={itinerary.days || []}
                  selectedId={selectedActivity?.id || null}
                  userLocation={userLocation}
                  onSelect={handleActivitySelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
