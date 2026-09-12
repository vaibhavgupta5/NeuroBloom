"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useParentStore } from "../../stores/useParentStore";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { Gamepad2, Flame, Puzzle, Smile } from "lucide-react";

function useCountUp(target, duration = 1.2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const increment = target / (duration * 60); // Assuming 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [target, duration, isInView]);

  return { count, ref };
}

function StatCard({ stat }) {
  const { count, ref } = useCountUp(stat.value);

  // For floats like 4.2
  const displayValue = Number.isInteger(stat.value) ? count : (count / Math.ceil(stat.value) * stat.value).toFixed(1);

  return (
    <motion.div
      variants={fadeUp}
      ref={ref}
      className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-5 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.iconBg}`}>
          {stat.icon}
        </div>
        <div className="font-dm-sans text-[13px] text-[#8FA3B1] font-medium leading-tight">
          {stat.label}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="font-sora font-bold text-[32px] text-[#1B2D3E] leading-none">
          {stat.value === 4.2 && count === Math.ceil(stat.value) ? stat.value : displayValue}
          {stat.suffix}
        </div>
      </div>
      <div className={`text-[11px] font-bold mt-2 ${stat.subLabelColor}`}>
        {stat.subLabel}
      </div>
    </motion.div>
  );
}

export default function StatsRow() {
  const { stats } = useParentStore();

  const statCards = [
    {
      icon: <Gamepad2 size={28} />,
      iconBg: "bg-[#3ECFB2]/20",
      value: stats.todayMinutes,
      suffix: " min",
      label: "Active Today",
      subLabel: stats.todayMinutesDelta >= 0
        ? `↑ +${stats.todayMinutesDelta} min vs yesterday`
        : `↓ ${stats.todayMinutesDelta} min vs yesterday`,
      subLabelColor: stats.todayMinutesDelta >= 0 ? "text-[#3ECFB2]" : "text-[#FF7E6B]"
    },
    {
      icon: <Flame size={28} />,
      iconBg: "bg-[#FF7E6B]/20",
      value: stats.weeklyStreak,
      suffix: " days",
      label: "Current Streak",
      subLabel: stats.weeklyStreak >= 7 ? "Personal best!" : "Keep it going!",
      subLabelColor: "text-[#FF7E6B]"
    },
    {
      icon: <Puzzle size={28} />,
      iconBg: "bg-[#4A90D9]/20",
      value: stats.totalModules,
      suffix: "",
      label: "Modules Done",
      subLabel: "This month",
      subLabelColor: "text-[#8FA3B1]"
    },
    {
      icon: <Smile size={28} />,
      iconBg: "bg-[#C4B5FD]/30",
      value: stats.avgMoodScore,
      suffix: "/5",
      label: "Avg Mood Score",
      subLabel: "Past 7 days",
      subLabelColor: "text-[#8FA3B1]"
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {statCards.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </motion.div>
  );
}
