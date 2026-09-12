"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { Brain, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

export default function InteractiveMetricModal({ metric, onClose }) {
  if (!metric) return null;

  const metricDescriptions = {
    focusScore: {
      title: "Attention Hold & Visual Focus Index",
      clinicalDefinition:
        "Measures sustained visual attention and smooth eye pursuit during tracking exercises. Higher scores indicate continuous concentration without sensory distraction.",
      statusText: "Current focus level is in the top 15% range for Arjun's age group.",
      parentTip: "Arjun is maintaining deep visual focus. This is a great moment to send a praise sticker!",
      iconType: "focus",
    },
    avgResponseMs: {
      title: "Response Pace & Reaction Time",
      clinicalDefinition:
        "Calculates the latency in milliseconds between target movements and physical taps. Steady response times reflect optimal neuro-motor coordination.",
      statusText: "Average reaction speed: 310ms (Optimal range: 250ms - 450ms).",
      parentTip: "Consistent response pace indicates Arjun is feeling calm and confident.",
      iconType: "zap",
    },
    frustrationLevel: {
      title: "Patience & Frustration Sensor",
      clinicalDefinition:
        "Monitors rapid erratic taps, repeated miss-taps, or sudden hesitation to detect sensory overload or emotional frustration early.",
      statusText: "Risk Level: Low (0 rapid error clusters detected).",
      parentTip: "If frustration rises, use the remote control deck to lower the game speed or send a calm breath pause.",
      iconType: "alert",
    },
  };

  const info = metricDescriptions[metric.id] || {
    title: metric.label,
    clinicalDefinition: "Provides real-time neuro-cognitive tracking during interactive play.",
    statusText: `Current value: ${metric.value}`,
    parentTip: "Keep observing Arjun's progress live.",
    iconType: "star",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#1B2D3E]/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 shadow-2xl border-4 border-[#3ECFB2]/30"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <SvgIconBadge type={info.iconType} size={32} variant="teal" />
            <div>
              <span className="text-xs font-bold text-[#3ECFB2] uppercase tracking-wider">
                Clinical Diagnostic Metric
              </span>
              <h3 className="font-nunito font-bold text-2xl text-[#1B2D3E]">
                {info.title}
              </h3>
            </div>
          </div>

          <div className="bg-[#E8FAF6] p-4 rounded-2xl border border-[#3ECFB2]/30 mb-5">
            <div className="flex items-start gap-2 text-[#1A9E8C] font-dm-sans font-bold text-sm mb-1">
              <Brain size={18} className="shrink-0 mt-0.5" /> What this measures:
            </div>
            <p className="font-dm-sans text-xs md:text-sm text-[#56728A] leading-relaxed">
              {info.clinicalDefinition}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm font-dm-sans font-bold text-[#1B2D3E]">
              <CheckCircle2 size={18} className="text-[#3ECFB2]" /> Live Status:
              <span className="text-[#3ECFB2] font-extrabold">{info.statusText}</span>
            </div>
            <div className="flex items-start gap-2 text-sm font-dm-sans text-[#56728A] bg-slate-50 p-3 rounded-xl border">
              <HelpCircle size={18} className="text-[#FFB020] shrink-0 mt-0.5" />
              <span><strong>Parent Action Tip:</strong> {info.parentTip}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#3ECFB2] text-white py-3 rounded-xl font-nunito font-bold text-lg shadow-[0_4px_0_#1A9E8C] active:translate-y-1 transition-all"
          >
            Got it, thanks!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
