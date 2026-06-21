"use client";

import { useState, useEffect, useRef } from "react";

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Check if the device has a touch screen. Custom cursors are not useful for touch interfaces.
    const isTouchDevice = () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    if (isTouchDevice()) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button,a,input,textarea,[data-hover]")) {
        setHovered(true);
      }
    };

    const out = () => setHovered(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);

    // Smooth animation loop using requestAnimationFrame
    let animId: number;
    const tick = () => {
      // Linear interpolation (lerp) for smooth trailing delay
      const ease = 0.15;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Hide custom cursor elements on touch devices
  if (typeof window !== "undefined" && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0))) {
    return null;
  }

  return (
    <div
      ref={ringRef}
      className={`fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-[9999] transition-all duration-300 -ml-4 -mt-4 ${
        hovered 
          ? "border-amber bg-amber/5 scale-125 shadow-[0_0_15px_rgba(255,140,66,0.3)]" 
          : "border-cyan/50 bg-transparent scale-100 shadow-[0_0_10px_rgba(0,245,255,0.15)]"
      }`}
    />
  );
}
