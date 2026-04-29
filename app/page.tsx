"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, type ElementType } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { ArrowRight, MapPin, Globe, Sparkles, Loader2, Zap, Map, Clock, Users, Star, Navigation } from "lucide-react";
import ItineraryMap from "@/components/map/ItineraryMap";
import { Button } from "@/components/ui/Button";

/* ─── Data ─────────────────────────────────────── */
const DEMO_LOCATIONS = [
  { id: "1", name: "Eiffel Tower", location: "Paris, France", coordinates: { lat: 48.8584, lng: 2.2945 }, category: "culture", time: "10:00 AM" },
  { id: "2", name: "Fushimi Inari", location: "Kyoto, Japan", coordinates: { lat: 34.9671, lng: 135.7727 }, category: "culture", time: "09:00 AM" },
  { id: "3", name: "Central Park", location: "New York, USA", coordinates: { lat: 40.7812, lng: -73.9665 }, category: "nature", time: "02:00 PM" },
];

const STATS = [
  { value: "50K+", label: "Trips Generated", icon: Map },
  { value: "120+", label: "Countries", icon: Globe },
  { value: "4.9★", label: "User Rating", icon: Star },
  { value: "< 10s", label: "Plan Time", icon: Zap },
];

const CITY_CARDS = [
  { name: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=260&fit=crop&auto=format" },
  { name: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=260&fit=crop&auto=format" },
  { name: "New York", country: "USA", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=260&fit=crop&auto=format" },
  { name: "Rome", country: "Italy", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=260&fit=crop&auto=format" },
  { name: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=260&fit=crop&auto=format" },
  { name: "Dubai", country: "UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=260&fit=crop&auto=format" },
  { name: "London", country: "UK", img: "https://images.unsplash.com/photo-1520986606214-8b456906c813?w=400&h=260&fit=crop&auto=format" },
  { name: "Sydney", country: "Australia", img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=260&fit=crop&auto=format" },
  { name: "Kyoto", country: "Japan", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=260&fit=crop&auto=format" },
  { name: "Barcelona", country: "Spain", img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=260&fit=crop&auto=format" },
];

const FEATURES = [
  { icon: Zap, label: "AI-powered itineraries", color: "#FF8C42" },
  { icon: Map, label: "Interactive live map", color: "#00F5D4" },
  { icon: Clock, label: "Day-by-day planning", color: "#7B2FBE" },
  { icon: Users, label: "Group trip support", color: "#FF4D6D" },
];

interface UserLocation { city: string; country: string; loading: boolean; }

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const fadeUp: Variants  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

/* ─── Particle Canvas ────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? "0,245,255" : "255,140,66",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 z-0 pointer-events-none" />;
}


/* ─── Animated Stat ──────────────────────────────── */
function StatCard({ value, label, icon: Icon, delay }: { value: string; label: string; icon: ElementType; delay: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    if (value.includes("+") || value.includes("★") || value.includes("<")) {
      const num = parseInt(value.replace(/[^0-9]/g, ""));
      if (isNaN(num)) {
        setDisplayValue(value);
        return;
      }
      
      let start = 0;
      const duration = 2000;
      const increment = num / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= num) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start).toLocaleString() + (value.includes("+") ? "+" : ""));
        }
      }, 16);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      className="holo-card p-5 flex flex-col gap-2 text-center group cursor-default"
      whileHover={{ scale: 1.05, y: -4 }}
    >
      <Icon className="w-5 h-5 text-cyan-400 mx-auto mb-1" style={{ color: "#00F5FF" }} />
      <div className="stat-number">{displayValue}</div>
      <p className="text-xs text-ivory/50 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuthStore();
  const [userLocation, setUserLocation] = useState<UserLocation>({ city: "Your Location", country: "", loading: true });
  const [glitch, setGlitch] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const mapTiltX = useTransform(smoothY, [-300, 300], [6, -6]);
  const mapTiltY = useTransform(smoothX, [-300, 300], [-6, 6]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  // Random glitch trigger
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 600);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Geolocation
  useEffect(() => {
    let cancelled = false;
    const setCity = (city: string, country: string) => {
      if (!cancelled) setUserLocation({ city, country, loading: false });
    };
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => { if (d.city) setCity(d.city, d.country_name || ""); else throw new Error(); })
      .catch(() =>
        fetch("https://api.bigdatacloud.net/data/ip-geolocation")
          .then(r => r.json())
          .then(d => { const city = d.location?.city || ""; if (city) setCity(city, d.country?.name || ""); else setCity("Your Location", ""); })
          .catch(() => setCity("Your Location", ""))
      );
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          if (cancelled) return;
          const { latitude, longitude, accuracy } = pos.coords;
          if (accuracy > 10000) return;
          try {
            const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const d = await r.json();
            const city = d.city || d.locality || "";
            if (city) setCity(city, d.countryName || "");
          } catch { /* keep IP result */ }
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
    return () => { cancelled = true; };
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); };
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative min-h-screen bg-[#050A18] text-ivory overflow-hidden font-body" onMouseMove={handleMouseMove}>

      {/* ── Particle field ── */}
      <ParticleCanvas />

      {/* ── Grid background ── */}
      <div aria-hidden className="grid-bg absolute inset-0 z-0 pointer-events-none opacity-40" />

      {/* ── Scanline sweep ── */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
          style={{ animation: "scanMove 8s linear infinite", top: 0 }} />
      </div>

      {/* ── Ambient glows ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[140px] opacity-[0.08] -top-60 -left-60"
          style={{ background: "#FF8C42", animation: "orbFloat 10s ease-in-out infinite" }} />
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.08] -bottom-40 -right-40"
          style={{ background: "#00F5FF", animation: "orbFloat 12s ease-in-out infinite", animationDelay: "5s" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: "#7B2FBE", animation: "orbFloat 9s ease-in-out infinite", animationDelay: "2s" }} />
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 z-50 px-8 py-5 flex justify-between items-center plannora-glass border-b border-cyan-500/10"
      >
        {/* Logo */}
        <Link href="/">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400 }}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-cyan-500/20 p-1">
                <img src="/logo.png" alt="Plannora Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "0 0 12px rgba(0,245,255,0.3)", animation: "pulseRing 2s ease-out infinite" }} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Plan<span style={{ color: "#00F5FF" }} className="neon-text">nora</span>
            </span>
          </motion.div>
        </Link>

        {/* Nav links */}
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-ivory/40 text-sm hidden md:inline font-mono">{user.email}</span>
              <Button variant="ghost" className="text-ivory/70 hover:text-white" onClick={handleSignOut}>Sign Out</Button>
              <Link href="/plan">
                <Button variant="primary" className="relative overflow-hidden">
                  Plan a Trip <Navigation className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-ivory/70 hover:text-white text-sm">Log in</Button>
              </Link>
              <Link href="/plan">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[#050A18] relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #00F5D4, #00F5FF)" }}
                >
                  Get Started <ArrowRight className="inline w-4 h-4 ml-1" />
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* ══════════ HERO: text left, map right ══════════ */}
      <main className="relative z-10 pt-36 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

        {/* ── Left: Text content ── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-7">

          {/* Status badge */}
          <motion.div variants={fadeUp}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-widest"
              style={{ border: "1px solid rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.06)", color: "#00F5FF" }}
              animate={{ boxShadow: ["0 0 0px rgba(0,245,255,0)", "0 0 16px rgba(0,245,255,0.35)", "0 0 0px rgba(0,245,255,0)"] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5" />
              AI Powered Travel
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={fadeUp}>
            <h1
              className="text-5xl lg:text-[4.5rem] font-display font-bold leading-[1.05] tracking-tight"
              style={{ animation: glitch ? "glitch 0.6s steps(1) 1" : "none" }}
            >
              <span className="text-white">Plan your</span>
              <br />
              <span className="gradient-text-animate">perfect trip.</span>
              <br />
              <span className="text-white/90">In </span>
              <span style={{ color: "#00F5FF" }} className="neon-text">seconds.</span>
            </h1>
          </motion.div>

          {/* Sub */}
          <motion.p variants={fadeUp} className="text-base text-ivory/55 max-w-md leading-relaxed font-mono">
            <span style={{ color: "#00F5FF" }}>{">"}</span> Plannora uses advanced AI to generate hyper-personalized
            itineraries. Visualize every step on a live interactive map.
          </motion.p>

          {/* Feature pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <motion.div
                key={label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium cursor-default"
                style={{ border: `1px solid ${color}22`, background: `${color}0A`, color: `${color}` }}
                whileHover={{ scale: 1.06, boxShadow: `0 0 16px ${color}40` }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} className="flex items-center gap-4 mt-1">
            <Link href="/plan">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,140,66,0.5)" }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-[#050A18] relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #FF8C42, #FF4D6D)" }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Start Planning Free
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>
            </Link>
            <Link href="/auth/login" className="text-sm text-ivory/50 hover:text-ivory transition-colors font-mono underline underline-offset-4">
              Sign in →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3 mt-2">
            {STATS.map(({ value, label, icon }, i) => (
              <StatCard key={label} value={value} label={label} icon={icon} delay={i * 0.08} />
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: Holographic Map ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          className="relative"
          style={{ perspective: 1200 }}
        >
          <motion.div
            className="relative h-[520px] lg:h-[620px] w-full rounded-2xl overflow-hidden scanlines"
            style={{
              rotateX: mapTiltX,
              rotateY: mapTiltY,
              animation: "floatCard 7s ease-in-out infinite",
              border: "1px solid rgba(0,245,255,0.2)",
              boxShadow: "0 0 0 1px rgba(0,245,255,0.05), 0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,245,255,0.06)",
            }}
          >
            {/* Corner HUD decorations */}
            {([["top-0 left-0","border-t border-l"],["top-0 right-0","border-t border-r"],["bottom-0 left-0","border-b border-l"],["bottom-0 right-0","border-b border-r"]] as [string,string][]).map(([pos, borders], i) => (
              <div key={i} className={`absolute ${pos} w-6 h-6 ${borders} z-20 pointer-events-none`}
                style={{ borderColor: "#00F5FF", opacity: 0.6 }} />
            ))}
            {/* HUD top bar */}
            <div className="absolute top-0 left-0 right-0 z-20 px-4 py-2 flex items-center justify-between pointer-events-none"
              style={{ background: "rgba(5,10,24,0.75)", borderBottom: "1px solid rgba(0,245,255,0.12)" }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono" style={{ color: "#00F5FF" }}>LIVE MAP · REAL-TIME</span>
              </div>
              <span className="text-xs font-mono" style={{ color: "rgba(0,245,255,0.4)" }}>{timeStr}</span>
            </div>
            <ItineraryMap activities={DEMO_LOCATIONS} traceLiveLocation={true} />
            {/* Location pill */}
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
              whileHover={{ scale: 1.03, y: -3 }}
              className="absolute bottom-5 right-5 holo-card p-4 cursor-default w-64"
              style={{ background: "rgba(5,10,24,0.88)" }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #00F5D4, #00F5FF)" }}
                  animate={{ boxShadow: ["0 0 0px rgba(0,245,255,0)", "0 0 16px rgba(0,245,255,0.6)", "0 0 0px rgba(0,245,255,0)"] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <AnimatePresence mode="wait">
                    {userLocation.loading
                      ? <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader2 className="text-[#050A18] w-4 h-4 animate-spin" /></motion.span>
                      : <motion.span key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}><MapPin className="text-[#050A18] w-4 h-4" /></motion.span>
                    }
                  </AnimatePresence>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
                    <motion.p key={userLocation.city} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      className="font-semibold text-white text-sm truncate">
                      {userLocation.loading ? "Detecting…" : `📍 ${userLocation.city}`}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs font-mono mt-0.5 truncate" style={{ color: "rgba(0,245,255,0.6)" }}>
                    {userLocation.loading ? "Acquiring signal…" : `${timeStr}${userLocation.country ? ` · ${userLocation.country}` : ""}`}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

      </main>

      {/* ══════════ POPULAR DESTINATIONS GRID ══════════ */}
      <section className="relative z-10 px-6 pb-16 max-w-7xl mx-auto"
        style={{ borderTop: "1px solid rgba(0,245,255,0.08)", paddingTop: "3rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(0,245,255,0.4)" }}>Explore the world</p>
            <h2 className="text-2xl font-display font-bold text-white">Popular <span style={{ color: "#00F5FF" }} className="neon-text">Destinations</span></h2>
          </div>
          <Link href="/destinations">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="text-xs font-mono px-4 py-2 rounded-lg"
              style={{ border: "1px solid rgba(0,245,255,0.2)", color: "#00F5FF", background: "rgba(0,245,255,0.05)" }}
            >
              View all →
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CITY_CARDS.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + i * 0.07, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
              className="relative h-60 rounded-2xl overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.04, y: -6, zIndex: 10 }}
              style={{ border: "1px solid rgba(0,245,255,0.1)", position: "relative" }}
            >
              <img
                src={city.img}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050A18] via-[#050A18]/30 to-transparent" />
              {/* Neon glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ boxShadow: "inset 0 0 30px rgba(0,245,255,0.15), 0 0 30px rgba(0,245,255,0.08)" }} />
              {/* Top badge */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-mono px-2 py-1 rounded-md"
                  style={{ background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}>
                  Explore
                </span>
              </div>
              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-display font-bold text-base leading-tight">{city.name}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: "rgba(0,245,255,0.7)" }}>{city.country}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
