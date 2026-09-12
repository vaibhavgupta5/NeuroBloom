"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function ParentSplashScreen({ onComplete }) {
  const [show, setShow] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Initializing clinical workspace...",
    "Establishing live telemetry bridge...",
    "Syncing child co-regulation state...",
    "Welcome to NeuroBloom Parent Portal"
  ];

  useEffect(() => {
    // Check if splash was already shown in this session
    const hasSeenSplash = sessionStorage.getItem("neurobloom_parent_splash_seen");
    if (hasSeenSplash) {
      setShow(false);
      if (onComplete) onComplete();
      return;
    }

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    const timer = setTimeout(() => {
      sessionStorage.setItem("neurobloom_parent_splash_seen", "true");
      setShow(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(timer);
    };
  }, [onComplete, steps.length]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] bg-gradient-to-br from-[#E8FAF6] via-white to-[#3ECFB2]/20 backdrop-blur-2xl flex items-center justify-center px-4 overflow-hidden"
        >
          {/* Animated Background Blobs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#3ECFB2]/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-[#4A90D9]/20 blur-3xl animate-pulse" />

          {/* Splash Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm md:max-w-md bg-white/80 backdrop-blur-2xl border-2 border-white/80 rounded-3xl p-6 md:p-8 text-center shadow-[0_16px_48px_rgba(62,207,178,0.2)] relative z-10 flex flex-col items-center"
          >
            {/* Logo Mark */}
            <div className="relative mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-[#3ECFB2] to-[#1A9E8C] text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Leaf size={36} className="text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFB020] rounded-full border-2 border-white flex items-center justify-center text-white">
                <Sparkles size={12} />
              </span>
            </div>

            {/* Brand Title */}
            <h1 className="font-nunito font-extrabold text-2xl md:text-3xl text-[#1B2D3E] tracking-tight mb-1">
              Neuro<span className="text-[#3ECFB2]">Bloom</span>
            </h1>
            <p className="font-dm-sans text-xs md:text-sm text-[#8FA3B1] font-medium mb-6">
              Parent Co-Regulation & Realtime Tracking Platform
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3 border border-white">
              <motion.div
                className="bg-gradient-to-r from-[#3ECFB2] to-[#4A90D9] h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Dynamic Step Text */}
            <div className="h-6 flex items-center justify-center">
              <motion.div
                key={loadingStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="font-dm-sans text-xs font-bold text-[#1A9E8C] flex items-center gap-1.5"
              >
                <ShieldCheck size={14} /> {steps[loadingStep]}
              </motion.div>
            </div>

            {/* Footer Trust Badge */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] font-dm-sans text-[#8FA3B1]">
              <Heart size={12} className="text-[#FF7E6B]" fill="currentColor" />
              <span>Designed for ASD & ADHD Co-Regulation</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
