import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlannerState {
  step: number;
  destination: any;
  dates: { from: Date | null; to: Date | null };
  companions: string;
  tripTypes: string[];
  budgetTier: string;
  preferences: {
    flights: boolean;
    hotels: boolean;
    dietary: string[];
    pace: string;
    mustSee: string;
  };
  language: string;
  setLanguage: (lang: string) => void;
  setStep: (step: number) => void;
  setDestination: (dest: any) => void;
  setDates: (dates: any) => void;
  setCompanions: (comp: string) => void;
  toggleTripType: (type: string) => void;
  setBudgetTier: (tier: string) => void;
  setPreferences: (prefs: any) => void;
  currentItinerary: any;
  setCurrentItinerary: (itinerary: any) => void;
  updateDay: (dayNumber: number, newDayData: any) => void;
  resetTrip: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      step: 1,
      destination: null,
      dates: { from: null, to: null },
      companions: "solo",
      tripTypes: [],
      budgetTier: "mid-range",
      preferences: {
        flights: false,
        hotels: true,
        dietary: [],
        pace: "relaxed",
        mustSee: "",
      },
      language: "English",
      currentItinerary: null,
      setLanguage: (lang) => set({ language: lang }),
      setStep: (step) => set({ step }),
      setDestination: (dest) => set({ destination: dest }),
      setDates: (dates) => set({ dates }),
      setCompanions: (comp) => set({ companions: comp }),
      toggleTripType: (type) =>
        set((state) => ({
          tripTypes: state.tripTypes.includes(type)
            ? state.tripTypes.filter((t) => t !== type)
            : state.tripTypes.length < 3
              ? [...state.tripTypes, type]
              : state.tripTypes,
        })),
      setBudgetTier: (tier) => set({ budgetTier: tier }),
      setPreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
      setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
      resetTrip: () => set({
        step: 1,
        destination: null,
        dates: { from: null, to: null },
        companions: "solo",
        tripTypes: [],
        budgetTier: "mid-range",
        preferences: { flights: false, hotels: true, dietary: [], pace: "relaxed", mustSee: "" },
        currentItinerary: null,
      }),
      updateDay: (dayNumber, newDayData) => 
        set((state) => {
          if (!state.currentItinerary || !state.currentItinerary.days) return state;
          const updatedDays = state.currentItinerary.days.map((day: any) => 
            day.dayNumber === dayNumber ? { ...day, ...newDayData, dayNumber } : day
          );
          return { currentItinerary: { ...state.currentItinerary, days: updatedDays } };
        }),
    }),
    {
      name: "plannora-store",
      // Persist ALL trip inputs so that navigation never loses the user's destination/settings
      partialize: (state) => ({
        currentItinerary: state.currentItinerary,
        language: state.language,
        destination: state.destination,
        dates: state.dates,
        companions: state.companions,
        tripTypes: state.tripTypes,
        budgetTier: state.budgetTier,
        preferences: state.preferences,
        step: state.step,
      }),
    }
  )
);
