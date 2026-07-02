"use client";

import { useToastStore, ToastMessage } from "@/store/toastStore";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#00F5D4] shrink-0 animate-pulse" />,
    error: <AlertTriangle className="w-5 h-5 text-[#FF4D6D] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#00F5FF] shrink-0" />,
  };

  const borders = {
    success: "border-[#00F5D4]/20 shadow-[0_0_15px_rgba(0,245,212,0.15)]",
    error: "border-[#FF4D6D]/20 shadow-[0_0_15px_rgba(255,77,109,0.15)]",
    info: "border-[#00F5FF]/20 shadow-[0_0_15px_rgba(0,245,255,0.15)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-midnight/80 backdrop-blur-xl border ${borders[toast.type]} relative overflow-hidden`}
    >
      {/* Dynamic Progress Indicator */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration ?? 4000) / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] ${
          toast.type === "success"
            ? "bg-[#00F5D4]"
            : toast.type === "error"
            ? "bg-[#FF4D6D]"
            : "bg-[#00F5FF]"
        }`}
      />

      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 flex flex-col gap-0.5 pr-2">
        {toast.title && <h4 className="text-sm font-semibold text-white tracking-tight">{toast.title}</h4>}
        <p className="text-xs text-[#E8F0FF]/80 leading-relaxed font-body">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-[#E8F0FF]/40 hover:text-white transition-colors p-0.5 rounded-lg hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
