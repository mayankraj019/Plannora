"use client";

import { useState, useEffect } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Determine if the device has a touch screen. Custom cursor isn't useful for mobile.
    const isTouchDevice = () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    if (isTouchDevice()) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setTimeout(() => setRing({ x: e.clientX, y: e.clientY }), 60);
    };
    const over = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button,a,[data-hover]")) setHovered(true);
    };
    const out = () => setHovered(false);
    
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    
    return () => { 
      window.removeEventListener("mousemove", move); 
      window.removeEventListener("mouseover", over); 
      window.removeEventListener("mouseout", out); 
    };
  }, []);

  // Hide cursor immediately if touch screen to prevent an artifact showing up on mobile
  if (typeof window !== "undefined" && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0))) {
    return null;
  }

  return (
    <>
      <div className="cursor-dot" style={{ left: pos.x - 4, top: pos.y - 4, transform: hovered ? "scale(2)" : "scale(1)" }} />
      <div className="cursor-ring" style={{
        left: ring.x - 16, top: ring.y - 16,
        width: hovered ? 48 : 32, height: hovered ? 48 : 32,
        borderColor: hovered ? "rgba(255,140,66,0.8)" : "rgba(0,245,255,0.6)",
        marginLeft: hovered ? "-8px" : "0", marginTop: hovered ? "-8px" : "0",
      }} />
    </>
  );
}
