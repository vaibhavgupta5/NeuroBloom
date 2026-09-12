"use client";

import { motion } from "framer-motion";
import { useParentStore } from "../../stores/useParentStore";
import { SvgIconBadge } from "../ui/SvgIconBadge";
import { Target, Check } from "lucide-react";

function GoalRing({ done, goal }) {
  const pct = Math.min(1, goal > 0 ? done / goal : 0);
  const R = 44;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="relative w-[110px] h-[110px] shrink-0">
      <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="55" cy="55" r={R} fill="none" stroke="#E8FAF6" strokeWidth="11" />
        {/* Progress */}
        <motion.circle
          cx="55"
          cy="55"
          r={R}
          fill="none"
          stroke="url(#goalGradient)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC * (1 - pct) }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3ECFB2" />
            <stop offset="100%" stopColor="#1A9E8C" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {pct >= 1 ? (
          <SvgIconBadge type="trophy" size={34} variant="amber" />
        ) : (
          <>
            <span className="font-sora font-bold text-[22px] text-[#1B2D3E] leading-none">
              {done}<span className="text-[#8FA3B1] text-[15px]">/{goal}</span>
            </span>
            <span className="font-dm-sans text-[10px] font-bold text-[#8FA3B1] mt-1">modules</span>
          </>
        )}
      </div>
    </div>
  );
}

function StreakStrip() {
  const { activeDaysStrip, child } = useParentStore();

  return (
    <div className="flex items-center gap-1.5">
      {activeDaysStrip.map((d) => (
        <div key={d.day} className="flex flex-col items-center gap-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
              d.active
                ? "bg-[#3ECFB2] border-[#1A9E8C] text-white shadow-[0_2px_0_#1A9E8C]"
                : "bg-white/60 border-white text-[#C4CFD8]"
            }`}
            title={d.active ? `${d.count} session${d.count === 1 ? "" : "s"}` : "Rest day"}
          >
            {d.active ? <Check size={13} strokeWidth={3.5} /> : <span className="w-1.5 h-1.5 rounded-full bg-[#D9E4EA]" />}
          </div>
          <span className="font-dm-sans text-[10px] font-bold text-[#8FA3B1]">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function DailyGoalRing() {
  const { stats, child, lastUpdatedAt } = useParentStore();
  const done = stats.todayCompletedCount;
  const goal = stats.dailyGoal || child.dailyGoal || 4;
  const complete = done >= goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-5 md:p-6 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center gap-5">
        <GoalRing done={done} goal={goal} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-[#3ECFB2]/20 flex items-center justify-center text-[#1A9E8C]">
              <Target size={16} />
            </span>
            <h3 className="font-nunito font-extrabold text-[#1B2D3E] text-base md:text-lg leading-tight">
              Daily Goal
            </h3>
          </div>
          <p className="font-dm-sans text-sm text-[#8FA3B1] leading-snug mb-3">
            {complete
              ? `${child.name} hit today's goal — amazing work!`
              : `${goal - done} more ${goal - done === 1 ? "module" : "modules"} to hit ${child.name}'s daily goal`}
          </p>
          <StreakStrip />
        </div>
      </div>

      {lastUpdatedAt && (
        <div className="font-dm-sans text-[11px] text-[#8FA3B1]/70 mt-3 text-right">
          Updated {new Date(lastUpdatedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
        </div>
      )}
    </motion.div>
  );
}
