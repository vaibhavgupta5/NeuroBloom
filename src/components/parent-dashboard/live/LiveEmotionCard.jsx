"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { useParentStore } from "../../../stores/useParentStore";
import { EMOTION_META } from "../../../lib/emotionUtils";
import { Camera, CameraOff, Radio } from "lucide-react";

/**
 * Live "Emotion Radar" — the child's current facial emotion (camera) plus the
 * privacy-safe single frame preview. The frame is a still image refreshed
 * every ~10s; nothing is ever recorded.
 */
export default function LiveEmotionCard() {
  const { liveSession, child } = useParentStore();
  const { emotion, emotionConfidence, snapshotFrame, isLive } = liveSession;

  const [history, setHistory] = useState([]); // last ~6 readings
  const lastEmotionRef = useRef(null);

  useEffect(() => {
    if (!emotion || emotion === lastEmotionRef.current) return;
    lastEmotionRef.current = emotion;
    setHistory((prev) =>
      [...prev, { emotion, at: new Date() }].slice(-6)
    );
  }, [emotion]);

  const meta = emotion ? EMOTION_META[emotion] : null;
  const cameraDenied = isLive && !emotion;

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-4 md:p-5 shadow-[0_8px_24px_rgba(62,207,178,0.08)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <SvgIconBadge
            type={meta ? meta.iconKey : "emotion"}
            size={22}
            variant={emotion === "frustrated" || emotion === "angry" || emotion === "stressed" ? "coral" : "teal"}
          />
          <div>
            <div className="font-dm-sans text-[11px] md:text-xs text-[#8FA3B1] font-bold uppercase tracking-wider">
              Emotion Radar
            </div>
            <div
              className="font-nunito font-extrabold text-lg md:text-xl leading-tight"
              style={{ color: meta ? meta.color : "#1B2D3E" }}
            >
              {isLive ? (meta ? meta.label : "Camera off") : "—"}
            </div>
          </div>
        </div>
        {isLive && (
          <span className="bg-[#3ECFB2]/15 text-[#1A9E8C] px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold font-dm-sans flex items-center gap-1">
            <Radio size={11} className="animate-pulse" /> Camera
          </span>
        )}
      </div>

      {/* Emotion translation for the parent */}
      {isLive && meta && (
        <p className="font-dm-sans text-xs md:text-sm text-[#56728A] leading-snug">
          {child.name} — {meta.parentText.toLowerCase()}
        </p>
      )}
      {isLive && !meta && (
        <p className="font-dm-sans text-xs md:text-sm text-[#8FA3B1] leading-snug">
          {cameraDenied
            ? "Camera off — running in auto mode (difficulty adapts to gameplay only)."
            : "Reading the camera…"}
        </p>
      )}
      {!isLive && (
        <p className="font-dm-sans text-xs md:text-sm text-[#8FA3B1] leading-snug">
          Waiting for a session.
        </p>
      )}

      {/* Confidence bar */}
      {isLive && meta && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-dm-sans text-[10px] font-bold text-[#8FA3B1] uppercase tracking-wide">
              Confidence
            </span>
            <span className="font-sora font-bold text-xs text-[#1B2D3E]">
              {Math.round((emotionConfidence || 0) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#8FA3B1]/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: meta.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((emotionConfidence || 0) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Camera snapshot frame (single still, replaced every ~10s) */}
      <div>
        {snapshotFrame ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-white/80 shadow-sm w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={snapshotFrame}
              alt="Live camera preview"
              className="w-[180px] h-[135px] object-cover"
            />
            <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7E6B] animate-pulse" /> LIVE
            </span>
          </div>
        ) : isLive ? (
          <div className="w-[180px] h-[135px] rounded-2xl border-2 border-dashed border-[#8FA3B1]/30 bg-[#E8FAF6]/50 flex flex-col items-center justify-center gap-1.5">
            <CameraOff size={22} className="text-[#8FA3B1]" />
            <span className="font-dm-sans text-[10px] text-[#8FA3B1] text-center px-3">
              Waiting for camera frame…
            </span>
          </div>
        ) : null}
        <p className="font-dm-sans text-[10px] text-[#8FA3B1] mt-1.5 flex items-center gap-1">
          <Camera size={11} /> Live preview · refreshes every 10s · not recorded
        </p>
      </div>

      {/* Rolling emotion timeline (last readings) */}
      {history.length > 0 && (
        <div>
          <div className="font-dm-sans text-[10px] font-bold text-[#8FA3B1] uppercase tracking-wide mb-1.5">
            Recent readings
          </div>
          <div className="flex items-end gap-1.5">
            {history.map((h, i) => {
              const m = EMOTION_META[h.emotion];
              return (
                <div key={i} className="flex flex-col items-center gap-1" title={`${m?.label} · ${h.at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`}>
                  <div
                    className="rounded-full"
                    style={{
                      backgroundColor: m?.color || "#8FA3B1",
                      width: 10 + i * 2,
                      height: 10 + i * 2,
                      opacity: 0.4 + (i / history.length) * 0.6,
                    }}
                  />
                  <span className="font-dm-sans text-[8px] text-[#8FA3B1]">
                    {h.at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
