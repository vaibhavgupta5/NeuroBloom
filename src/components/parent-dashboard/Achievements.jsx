"use client";

import { motion } from "framer-motion";
import { useParentStore } from "../../stores/useParentStore";
import { SvgIconBadge } from "../ui/SvgIconBadge";
import { Trophy, Lock } from "lucide-react";

export default function Achievements() {
  const { achievements, child } = useParentStore();

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-nunito font-bold text-xl text-ink flex items-center gap-2">
          <span>{child.name}&apos;s Achievements</span>
          <Trophy size={20} className="text-amber-400" />
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 content-start">
        {achievements.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={badge.unlocked ? { scale: 0.8, opacity: 0 } : { opacity: 0 }}
            whileInView={badge.unlocked ? { scale: 1, opacity: 1 } : { opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={badge.unlocked ? { type: "spring", stiffness: 200, damping: 15, delay: index * 0.08 } : { delay: index * 0.05 }}
            className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 relative ${
              badge.unlocked 
                ? "bg-white/80 backdrop-blur-md border border-white shadow-[0_4px_12px_rgba(62,207,178,0.15)]" 
                : "bg-white/30 border border-white/50 opacity-50 grayscale"
            }`}
          >
            <div className="mb-1">
              <SvgIconBadge type={badge.iconKey || "star"} size={26} variant={badge.unlocked ? "amber" : "ghost"} />
            </div>
            <div className="font-dm-sans text-[10px] font-bold text-center leading-tight text-ink">
              {badge.label}
            </div>
            
            {!badge.unlocked && (
              <div className="absolute bottom-1 right-1 opacity-70">
                <Lock size={12} className="text-ink" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
