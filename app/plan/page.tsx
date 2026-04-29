"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePlannerStore } from "@/store/plannerStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowRight, ArrowLeft, Plane, Users, Calendar, MapPin, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function PlanWizard() {
  const { step, setStep, destination, setDestination, dates, setDates, companions, setCompanions, tripTypes, toggleTripType, budgetTier, setBudgetTier, language, setLanguage, resetTrip } = usePlannerStore();
  const router = useRouter();

  // Clear previous trip data whenever the user opens the plan wizard
  useEffect(() => {
    resetTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const languages = [
    { name: "English", native: "English" },
    { name: "Hindi", native: "हिन्दी" },
    { name: "Marathi", native: "मराठी" },
    { name: "Bengali", native: "বাংলা" },
    { name: "Tamil", native: "தமிழ்" },
    { name: "Telugu", native: "తెలుగు" },
    { name: "Kannada", native: "ಕನ್ನಡ" },
    { name: "Malayalam", native: "മലയാളમ" },
    { name: "Gujarati", native: "ગુજરાતી" },
    { name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  ];

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
    else router.push("/plan/generating");
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push("/");
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-midnight text-midnight dark:text-ivory pt-24 pb-12 px-6 flex flex-col items-center font-body">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between text-sm font-medium mb-2 text-midnight/60 dark:text-ivory/60">
          <span>Step {step} of 7</span>
          <span>{["Language", "Destination", "Dates", "Companions", "Vibe", "Budget", "Details"][step - 1]}</span>
        </div>
        <div className="h-2 bg-amber/20 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-amber"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-2xl bg-white dark:bg-[#111727] border border-amber/10 shadow-2xl rounded-2xl p-8 lg:p-12 min-h-[460px] flex flex-col relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber/10 rounded-full blur-[80px] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col z-10"
          >
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber to-coral">Choose your language</h2>
                <p className="text-midnight/60 dark:text-ivory/60">Your itinerary and Nexora will speak in this language.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setLanguage(lang.name)}
                      className={`p-4 rounded-xl border-2 transition-all text-center flex flex-col gap-1 ${
                        language === lang.name 
                          ? "border-amber bg-amber/10 text-midnight dark:text-ivory shadow-[0_0_15px_rgba(255,191,0,0.2)]" 
                          : "border-ivory/10 hover:border-amber/40 hover:bg-ivory/5 text-midnight/60 dark:text-ivory/60"
                      }`}
                    >
                      <span className="text-lg font-bold">{lang.native}</span>
                      <span className="text-[10px] uppercase tracking-widest opacity-60">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold">Where are you heading?</h2>
                <p className="text-midnight/60 dark:text-ivory/60">Search for a city, region, or country.</p>
                <div className="relative mt-4">
                  <MapPin className="absolute left-4 top-4 text-amber w-6 h-6" />
                  <Input 
                    className="pl-14 text-xl h-16 bg-transparent border-2 border-amber/20 focus-visible:border-amber shadow-inner" 
                    placeholder="e.g. Tokyo, Japan" 
                    value={destination?.name || ""}
                    onChange={(e) => setDestination({ name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold">When is your trip?</h2>
                <div className="mt-4 border-2 border-amber/20 rounded-xl bg-ivory/30 dark:bg-midnight/50 overflow-x-auto w-full max-w-full flex justify-start sm:justify-center p-2">
                  <DayPicker
                    mode="range"
                    selected={{ from: dates.from || undefined, to: dates.to || undefined }}
                    onSelect={(range) => setDates({ from: range?.from || null, to: range?.to || null })}
                    className="custom-calendar mx-auto sm:mx-0"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold">Who's traveling?</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {["solo", "family", "couple", "group"].map(comp => (
                    <button 
                      key={comp}
                      onClick={() => setCompanions(comp)}
                      className={`p-6 rounded-xl border-2 transition-all text-left flex flex-col items-center justify-center text-center ${companions === comp ? "border-amber bg-amber/10 shadow-[0_8px_24px_rgba(232,147,90,0.15)] scale-[1.02]" : "border-amber/10 hover:border-amber/30 bg-ivory/30 dark:bg-midnight/30"}`}
                    >
                      <Users className={`w-8 h-8 mb-3 transition-colors ${companions === comp ? "text-amber" : "text-midnight/40 dark:text-ivory/40"}`} />
                      <div className="font-semibold capitalize text-lg">{comp}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold">What's the vibe?</h2>
                <p className="text-midnight/60 dark:text-ivory/60">Select up to 3 themes.</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {["Beach", "Adventure", "Culture", "Food", "Shopping", "Nature", "Romantic", "Wellness"].map(vibe => {
                    const isSelected = tripTypes.includes(vibe);
                    return (
                      <button 
                        key={vibe}
                        onClick={() => toggleTripType(vibe)}
                        className={`px-6 py-3 rounded-full border-2 text-base font-medium transition-all ${isSelected ? "border-amber bg-amber text-white shadow-md scale-105" : "border-amber/20 hover:border-amber/50 bg-ivory/30 dark:bg-midnight/30 text-midnight dark:text-ivory hover:scale-105"}`}
                      >
                        {vibe}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold">What's your budget?</h2>
                <div className="flex flex-col gap-4 mt-4">
                  {["budget", "mid-range", "luxury"].map(tier => (
                    <button 
                      key={tier}
                      onClick={() => setBudgetTier(tier)}
                      className={`p-6 rounded-xl border-2 flex items-center justify-between transition-all ${budgetTier === tier ? "border-amber bg-amber/10 shadow-md scale-[1.01]" : "border-amber/10 hover:border-amber/30 bg-ivory/30 dark:bg-midnight/30"}`}
                    >
                      <span className="font-semibold capitalize text-xl">{tier}</span>
                      <span className="text-amber font-display font-bold tracking-widest text-xl">
                        {tier === "budget" ? "$" : tier === "mid-range" ? "$$" : "$$$"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-display font-bold">Any final details?</h2>
                <textarea 
                  className="w-full h-40 p-5 mt-4 rounded-xl border-2 border-amber/20 bg-ivory/30 dark:bg-midnight/30 resize-none focus:outline-none focus:border-amber shadow-inner transition-colors text-lg"
                  placeholder="E.g. I am vegetarian, I want to avoid crowded places..."
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 flex items-center justify-between border-t border-amber/10 z-10">
          <Button variant="ghost" onClick={handleBack} className="gap-2 text-midnight/60 dark:text-ivory/60 hover:text-midnight dark:hover:text-ivory">
            <ArrowLeft className="w-5 h-5" /> Back
          </Button>
          <Button onClick={handleNext} size="lg" className="gap-2 px-8 shadow-lg shadow-amber/20">
            {step === 7 ? (
              <>Generate <Sparkles className="w-5 h-5" /></>
            ) : (
              <>Next <ArrowRight className="w-5 h-5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
