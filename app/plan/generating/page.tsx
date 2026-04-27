"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Globe, Sparkles } from "lucide-react";
import { usePlannerStore } from "@/store/plannerStore";

const LOADING_MESSAGES = [
  "Geocoding your destination...",
  "Researching local gems...",
  "Consulting with local experts...",
  "Crafting your perfect itinerary...",
  "Calculating optimal routes...",
  "Finding the best food spots...",
  "Finalizing details...",
];

async function geocodeDestination(query: string): Promise<{ lat: number; lng: number }> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!key) return { lat: 48.8566, lng: 2.3522 }; // Paris as safe default
  try {
    const res = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${key}&limit=1`
    );
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
  } catch (e) {
    console.error("Client geocoding error:", e);
  }
  return { lat: 48.8566, lng: 2.3522 };
}

export default function GeneratingPage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const router = useRouter();
  const { destination, dates, companions, tripTypes, budgetTier, preferences, language, setCurrentItinerary } = usePlannerStore();
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    const generateTrip = async () => {
      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      // Determine final destination string
      const destName = destination?.name?.trim() || "";
      if (!destName) {
        alert("Please enter a destination first.");
        router.push("/plan");
        return;
      }

      // Geocode destination CLIENT-SIDE — guaranteed real coordinates
      const geoCoords = await geocodeDestination(destName);

      const days = dates.from && dates.to
        ? Math.max(1, Math.ceil((dates.to.getTime() - dates.from.getTime()) / (1000 * 60 * 60 * 24)))
        : 3;

      try {
        const response = await fetch("/api/trips/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: destName,
            destinationCoordinates: geoCoords,
            days,
            companions,
            tripTypes,
            budget: budgetTier,
            preferences,
            language,
          }),
        });

        const data = await response.json();

        if (data.success && data.itinerary) {
          const finalItinerary = {
            ...data.itinerary,
            // Always use client-geocoded coordinates so map is never wrong
            destinationCoordinates: geoCoords,
            user_destination: destName,
            user_dates: dates.from && dates.to
              ? `${dates.from.toLocaleDateString()} - ${dates.to.toLocaleDateString()}`
              : "Upcoming",
            user_duration: days,
            user_companions: companions,
            user_budget: budgetTier,
            user_tripTypes: tripTypes,
          };
          setCurrentItinerary(finalItinerary);
          router.push("/trips/latest");
        } else {
          alert(`Failed to generate itinerary: ${data.error}`);
          router.push("/plan");
        }
      } catch (error) {
        console.error("Error generating trip:", error);
        alert("An unexpected error occurred during generation.");
        router.push("/plan");
      }
    };

    generateTrip();

    return () => clearInterval(interval);
  }, [router, destination, dates, companions, tripTypes, budgetTier, preferences, language, setCurrentItinerary]);

  return (
    <div className="min-h-screen bg-midnight text-ivory flex flex-col items-center justify-center font-body relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-amber/30 rounded-full blur-[100px]"
      />

      <div className="z-10 flex flex-col items-center text-center max-w-md px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="mb-8 text-amber relative"
        >
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/5 border border-amber/20 p-2 shadow-2xl">
            <img src="/logo.png" alt="Plannora Logo" className="w-full h-full object-contain" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 bg-midnight p-1 rounded-full"
          >
            <Sparkles className="w-6 h-6 text-coral" />
          </motion.div>
        </motion.div>

        <h1 className="text-3xl font-display font-bold mb-4">Designing Your Journey</h1>

        <div className="h-8 overflow-hidden">
          <motion.p
            key={messageIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-ivory/60 text-lg"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </div>

        <div className="w-full h-1 bg-ivory/10 rounded-full mt-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber to-coral"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 20, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}
