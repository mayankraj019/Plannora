"use client";

import { MapPin, Clock } from "lucide-react";
import { haversineDistance, formatDistance } from "./travelModeUtils";

interface Activity {
  id: string;
  name: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  category?: string;
  time?: string;
}

interface Day {
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

interface DestinationSelectorProps {
  days: Day[];
  selectedId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onSelect: (activity: Activity) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  culture:     "#E8935A",
  food:        "#3ECFB2",
  nature:      "#52C97A",
  adventure:   "#F0614F",
  shopping:    "#C9A84C",
  relaxation:  "#8B7CF6",
  transport:   "#94A3B8",
  attraction:  "#F59E0B",
};

export default function DestinationSelector({
  days,
  selectedId,
  userLocation,
  onSelect,
}: DestinationSelectorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="font-display font-bold text-sm text-white/80 uppercase tracking-wider">
          Destinations
        </h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          Select a destination to navigate
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {days.map((day) => (
          <div key={day.dayNumber}>
            {/* Day Header */}
            <div className="sticky top-0 z-10 px-4 py-2 bg-white/5 backdrop-blur-md border-b border-white/5">
              <span className="text-xs font-bold text-amber uppercase tracking-wider">
                Day {day.dayNumber}
              </span>
              <span className="text-xs text-white/40 ml-2">{day.theme}</span>
            </div>

            {/* Activities */}
            {day.activities
              ?.filter((a) => a.coordinates?.lat)
              .map((activity) => {
                const isSelected = selectedId === activity.id;
                const dist =
                  userLocation && activity.coordinates
                    ? haversineDistance(
                        userLocation.lat,
                        userLocation.lng,
                        activity.coordinates.lat,
                        activity.coordinates.lng
                      )
                    : null;
                const catColor =
                  CATEGORY_COLORS[activity.category || ""] || "#E8935A";

                return (
                  <button
                    key={activity.id}
                    onClick={() => onSelect(activity)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all border-b border-white/[0.03] hover:bg-white/5 ${
                      isSelected
                        ? "bg-amber/10 border-l-2 border-l-amber"
                        : "border-l-2 border-l-transparent"
                    }`}
                  >
                    {/* Category dot */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${catColor}20` }}
                    >
                      <MapPin
                        className="w-4 h-4"
                        style={{ color: catColor }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold leading-tight truncate ${
                          isSelected ? "text-amber" : "text-white"
                        }`}
                      >
                        {activity.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-white/40">
                        {activity.time && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </span>
                        )}
                        {dist !== null && (
                          <span className="text-teal font-medium">
                            {formatDistance(dist)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-amber mt-2 shrink-0 travel-mode-glow" />
                    )}
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
