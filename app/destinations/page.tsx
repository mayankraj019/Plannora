"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Globe, Search, ArrowLeft, MapPin, Loader2 } from "lucide-react";

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1520986606214-8b456906c813?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=400&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&h=400&fit=crop&auto=format",
];

interface CountryData {
  name: string;
  country: string;
  continent: string;
  tag: string;
  img: string;
  flag: string;
}

const CONTINENTS = ["All", "Asia", "Europe", "Americas", "Africa", "Oceania"];
const TAGS = ["All", "Beach", "City", "Culture", "History", "Luxury", "Nature"];

const TAG_COLORS: Record<string, string> = {
  Beach: "#00F5D4", City: "#7B2FBE", Culture: "#FF8C42",
  History: "#C9A84C", Luxury: "#FF4D6D", Nature: "#3ECF8E",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [tag, setTag] = useState("All");
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,region,flags");
        const data = await res.json();
        
        const tags = ["Beach", "City", "Culture", "History", "Luxury", "Nature"];
        
        const formatted = data.map((c: any  , i: number) => ({
          name: c.name.common,
          country: c.name.official || c.name.common,
          continent: c.region === "Americas" ? "Americas" : c.region === "Asia" ? "Asia" : c.region === "Europe" ? "Europe" : c.region === "Africa" ? "Africa" : c.region === "Oceania" ? "Oceania" : "Other",
          tag: tags[i % tags.length],
          img: IMAGE_POOL[i % IMAGE_POOL.length],
          flag: c.flags.svg
        })).sort((a: any  , b: any  ) => a.name.localeCompare(b.name));
        
        setCountries(formatted);
      } catch (e) {
        console.error("Failed to fetch countries", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);

  const filtered = countries.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase());
    const matchContinent = continent === "All" || c.continent === continent;
    const matchTag = tag === "All" || c.tag === tag;
    return matchSearch && matchContinent && matchTag;
  });

  return (
    <div className="min-h-screen bg-[#050A18] text-white font-body">
      {/* Grid bg */}
      <div aria-hidden className="grid-bg fixed inset-0 z-0 pointer-events-none opacity-30" />

      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.07] -top-40 -left-40"
          style={{ background: "#00F5FF" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.06] -bottom-20 -right-20"
          style={{ background: "#FF8C42" }} />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4 plannora-glass border-b border-white/5">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid rgba(0,245,255,0.2)", color: "#00F5FF", background: "rgba(0,245,255,0.05)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-cyan-500/20 p-0.5">
             { }
<img src="/logo.png" alt="Plannora Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-lg">Destinations</span>
        </div>
        <Link href="/plan" className="ml-auto">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(255,140,66,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="text-sm font-bold px-5 py-2 rounded-lg text-[#050A18]"
            style={{ background: "linear-gradient(135deg, #FF8C42, #FF4D6D)" }}
          >
            Plan a Trip
          </motion.button>
        </Link>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(0,245,255,0.4)" }}>
            {filtered.length} destinations
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-bold">
            Explore the <span style={{ color: "#00F5FF" }} className="neon-text">World</span>
          </h1>
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-4 mb-8">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(0,245,255,0.5)" }} />
            <input
              type="text"
              placeholder="Search city or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono bg-white/5 border outline-none text-white placeholder:text-white/30"
              style={{ borderColor: "rgba(0,245,255,0.15)" }}
            />
          </div>

          {/* Continent filter */}
          <div className="flex flex-wrap gap-2">
            {CONTINENTS.map((c) => (
              <motion.button key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setContinent(c)}
                className="text-xs font-mono px-3 py-1.5 rounded-full transition-colors"
                style={{
                  border: `1px solid ${continent === c ? "#00F5FF" : "rgba(0,245,255,0.12)"}`,
                  background: continent === c ? "rgba(0,245,255,0.12)" : "transparent",
                  color: continent === c ? "#00F5FF" : "rgba(255,255,255,0.4)",
                }}>
                {c}
              </motion.button>
            ))}
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTag(t)}
                className="text-xs font-mono px-3 py-1.5 rounded-full transition-colors"
                style={{
                  border: `1px solid ${tag === t ? (TAG_COLORS[t] ?? "#00F5FF") : "rgba(255,255,255,0.08)"}`,
                  background: tag === t ? `${TAG_COLORS[t] ?? "#00F5FF"}18` : "transparent",
                  color: tag === t ? (TAG_COLORS[t] ?? "#00F5FF") : "rgba(255,255,255,0.4)",
                }}>
                {t}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-24 text-white/50 font-mono text-sm flex flex-col items-center">
              <Loader2 className="w-10 h-10 mb-4 opacity-50 animate-spin" style={{ color: "#00F5FF" }} />
              Loading 195+ countries...
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-24 text-white/30 font-mono text-sm">
              <MapPin className="w-10 h-10 mx-auto mb-4 opacity-30" />
              No destinations found. Try a different search.
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {filtered.map((city) => (
                <motion.div
                  key={city.name}
                  variants={fadeUp}
                  layout
                  className="relative h-56 rounded-2xl overflow-hidden cursor-pointer group"
                  whileHover={{ scale: 1.04, y: -5, zIndex: 10 }}
                  style={{ border: "1px solid rgba(0,245,255,0.1)", position: "relative" }}
                  onClick={() => window.open(`https://www.google.com/travel/search?q=${encodeURIComponent(city.name)}`, "_blank")}
                >
                   { }
<img
                    src={city.img}
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050A18] via-[#050A18]/20 to-transparent" />
                  {/* Neon glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: "inset 0 0 30px rgba(0,245,255,0.12)" }} />
                  {/* Tag badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: `${TAG_COLORS[city.tag] ?? "#00F5FF"}22`,
                        color: TAG_COLORS[city.tag] ?? "#00F5FF",
                        border: `1px solid ${TAG_COLORS[city.tag] ?? "#00F5FF"}44`,
                      }}>
                      {city.tag}
                    </span>
                  </div>
                  {/* Plan button on hover */}
                  <Link href={`/plan?destination=${encodeURIComponent(city.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md text-[#050A18] font-bold"
                      style={{ background: "#00F5FF" }}>
                      Plan →
                    </span>
                  </Link>
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-display font-bold text-sm">{city.name}</p>
                    <p className="text-[11px] font-mono" style={{ color: "rgba(0,245,255,0.65)" }}>{city.country}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
