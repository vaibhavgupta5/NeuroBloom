"use client";

import { motion } from "framer-motion";
import { useParentStore } from "../../stores/useParentStore";
import { staggerContainer } from "../../lib/animations";
import { SvgIconBadge } from "../ui/SvgIconBadge";
import { EMOTION_META } from "../../lib/emotionUtils";

export default function ActivityTimeline() {
  const { sessionTimeline, child } = useParentStore();

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-nunito font-bold text-xl text-ink">
          Today&apos;s Sessions — {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
        </h2>
      </div>

      <div className="flex-1 relative border-l-2 border-teal-400/30 ml-4 pl-6 pb-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          {sessionTimeline.map((event, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              className="relative"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-teal-700 rounded-full shadow-[0_0_0_4px_rgba(62,207,178,0.2)]"></div>

              <div className="font-dm-sans text-xs text-muted mb-1 font-bold">{event.time}</div>
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-3 shadow-sm">
                <SvgIconBadge type={event.iconKey || "emotion"} size={22} variant="blue" />
                <div className="flex-1 min-w-0">
                  <div className="font-nunito font-bold text-ink text-sm truncate">
                    {event.module}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
                    <span>⏱ {event.duration}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      Mood: <SvgIconBadge type={event.moodIconKey || "happy"} size={14} variant="ghost" className="p-0 border-0" />
                      <span className="text-ink font-medium">{event.mood}</span>
                    </span>
                    {event.emotion && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <span className="font-dm-sans">Camera:</span>
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-dm-sans"
                            style={{
                              backgroundColor: `${EMOTION_META[event.emotion]?.color || "#8FA3B1"}22`,
                              color: EMOTION_META[event.emotion]?.color || "#8FA3B1",
                            }}
                          >
                            {EMOTION_META[event.emotion]?.label || event.emotion}
                          </span>
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>Score: <span className="text-teal-700 font-bold">{event.score}%</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {sessionTimeline.length === 0 ? (
        <p className="font-dm-sans text-sm text-[#5F7384]">No activities yet today.</p>
      ) : (
        <div className="mt-4 pt-4 border-t border-white/60">
          <div className="bg-mint text-[#1A7F6E] px-4 py-3 rounded-xl text-sm font-dm-sans font-bold flex items-center gap-2 shadow-sm border border-white">
            <SvgIconBadge type="star" size={16} variant="amber" />
            <span>{child.name} finished {sessionTimeline.length} {sessionTimeline.length === 1 ? "activity" : "activities"} today.</span>
          </div>
        </div>
      )}
    </div>
  );
}
