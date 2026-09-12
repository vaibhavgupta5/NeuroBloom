"use client";

import { useEffect, useState } from "react";
import LiveScreenReplica from "./LiveScreenReplica";
import ParentRemoteControls from "./ParentRemoteControls";
import InteractiveMetricModal from "./InteractiveMetricModal";
import { SvgIconBadge } from "../../ui/SvgIconBadge";
import { useParentStore } from "../../../stores/useParentStore";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Info, Zap, ShieldCheck, Clock } from "lucide-react";

export default function UnifiedTelemetryHUD() {
  const { liveSession, child } = useParentStore();
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Sparkline data for live focus trend graph (grows as the session streams)
  const [focusHistory, setFocusHistory] = useState([]);

  useEffect(() => {
    setFocusHistory((prev) => {
      const next = [...prev, { time: `:${String(prev.length * 5).padStart(2, "0")}`, focus: liveSession.focusScore || 0 }];
      return next.slice(-8);
    });
  }, [liveSession.focusScore]);

  const liveFocusTrend = focusHistory.length > 0
    ? focusHistory
    : [{ time: ":00", focus: liveSession.focusScore || 0 }];

  const metrics = [
    {
      id: "focusScore",
      label: "Attention Hold Index",
      value: liveSession.isLive ? `${liveSession.focusScore || 0}%` : "—",
      status: liveSession.isLive ? liveSession.focusStatus || "Reading…" : "Waiting for a session",
      iconType: "focus",
      variant: "teal",
      tag: "Peak Focus",
    },
    {
      id: "avgResponseMs",
      label: "Tracking Pace & Speed",
      value: liveSession.isLive && liveSession.avgResponseMs ? `${liveSession.avgResponseMs} ms` : "—",
      status: liveSession.isLive ? "Steady Motor Rhythm" : "Waiting for a session",
      iconType: "zap",
      variant: "amber",
      tag: "Optimal Pace",
    },
    {
      id: "frustrationLevel",
      label: "Patience & Calm Meter",
      value: liveSession.isLive ? liveSession.frustrationLevel || "Low Risk" : "—",
      status: liveSession.isLive ? "Safe Emotional Range" : "Waiting for a session",
      iconType: "alert",
      variant: "blue",
      tag: "Safe Zone",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Idle state — no live session */}
      {!liveSession.isLive && (
        <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-8 md:p-12 shadow-[0_8px_32px_rgba(62,207,178,0.12)] flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#E8FAF6] border-2 border-[#3ECFB2]/30 flex items-center justify-center text-[#1A9E8C] mb-4">
            <Activity size={30} />
          </div>
          <h2 className="font-nunito font-extrabold text-xl md:text-2xl text-[#1B2D3E] mb-2">
            No live session right now
          </h2>
          <p className="font-dm-sans text-sm md:text-base text-[#8FA3B1] max-w-md">
            When {child.name} starts a game on their device, live telemetry will appear
            here automatically — screen mirror, focus metrics, and remote controls.
          </p>
        </div>
      )}

      {/* Top Banner Status Bar */}
      <div className={`bg-gradient-to-r from-[#1B2D3E] to-[#253A50] rounded-3xl p-4 md:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 border-2 border-white/20 ${liveSession.isLive ? "" : "opacity-50"}`}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <SvgIconBadge type="focus" size={28} variant="ghost" />
            {liveSession.isLive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#3ECFB2] rounded-full animate-ping border-2 border-[#1B2D3E]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-dm-sans text-[11px] md:text-xs font-bold uppercase tracking-wider ${liveSession.isLive ? "text-[#3ECFB2]" : "text-[#8FA3B1]"}`}>
                {liveSession.isLive ? "Live Co-Regulation HUD Active" : "Standby — Waiting for Session"}
              </span>
            </div>
            <h2 className="font-nunito font-bold text-lg md:text-2xl text-white leading-snug">
              {liveSession.isLive
                ? `${child.name} is playing ${liveSession.gameTitle || "Focus Ball Game"}`
                : `${child.name} is not playing right now`}
            </h2>
          </div>
        </div>

        <div className={`flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 self-start sm:self-auto ${liveSession.isLive ? "bg-white/10" : "bg-white/5"}`}>
          <Clock size={16} className="text-[#3ECFB2]" />
          <div className="font-dm-sans text-xs md:text-sm font-bold">
            Elapsed: <span className="text-[#3ECFB2]">{liveSession.elapsedSeconds || 0}s</span>
          </div>
        </div>
      </div>

      {/* Main Combined Grid (Live Mirror + Remote Controls) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Digital Screen Mirror Canvas (7 Cols) */}
        <div className="lg:col-span-7">
          <LiveScreenReplica liveSession={liveSession} />
        </div>

        {/* Remote Co-Regulation Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <ParentRemoteControls liveSession={liveSession} />
        </div>
      </div>

      {/* Interactive Telemetry Metrics Panel (3 Interactive Cards) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 md:mb-4">
          <h3 className="font-nunito font-bold text-lg md:text-xl text-[#1B2D3E] flex items-center gap-2">
            <Activity size={20} className="text-[#3ECFB2]" /> Interactive Realtime Telemetry
          </h3>
          <span className="font-dm-sans text-xs text-[#8FA3B1] flex items-center gap-1">
            <Info size={14} /> Click card for clinical details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {metrics.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMetric(m)}
              className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-4 md:p-5 shadow-[0_8px_24px_rgba(62,207,178,0.08)] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-2">
                <SvgIconBadge type={m.iconType} size={22} variant={m.variant} />
                <span className="bg-[#3ECFB2]/15 text-[#1A9E8C] px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold font-dm-sans">
                  {m.tag}
                </span>
              </div>
              <div className="font-dm-sans text-[11px] md:text-xs text-[#8FA3B1] font-bold uppercase tracking-wider">
                {m.label}
              </div>
              <div className="font-nunito font-extrabold text-xl md:text-3xl text-[#1B2D3E] my-1 group-hover:text-[#3ECFB2] transition-colors">
                {m.value}
              </div>
              <div className="font-dm-sans text-[11px] md:text-xs font-bold text-[#1A9E8C] flex items-center gap-1">
                <ShieldCheck size={14} /> {m.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Attention & Focus Sparkline Graph */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-4 md:p-6 shadow-[0_8px_32px_rgba(62,207,178,0.1)]">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#3ECFB2]" />
            <h4 className="font-nunito font-bold text-base md:text-lg text-[#1B2D3E]">
              Realtime Focus & Attention Stream
            </h4>
          </div>
          <span className="text-[11px] md:text-xs font-dm-sans text-[#8FA3B1] font-bold">
            Live 30-Second Window
          </span>
        </div>

        <div className="h-36 md:h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveFocusTrend}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ECFB2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3ECFB2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#8FA3B1" fontSize={11} />
              <YAxis domain={[50, 100]} stroke="#8FA3B1" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "16px",
                  border: "2px solid #3ECFB2",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="focus"
                stroke="#3ECFB2"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#focusGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric Clinical Explanation Modal */}
      <InteractiveMetricModal
        metric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />
    </div>
  );
}
