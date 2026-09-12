"use client";

import { motion } from "framer-motion";
import { useParentStore } from "../../stores/useParentStore";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { Stethoscope } from "lucide-react";

export default function TherapistNotes() {
  const { therapistNotes } = useParentStore();

  return (
    <div className="bg-white/55 backdrop-blur-lg border border-white/60 rounded-3xl p-6 shadow-[0_8px_32px_rgba(62,207,178,0.12),0_2px_8px_rgba(0,0,0,0.05)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-nunito font-bold text-xl text-[#1B2D3E]">Notes from Dr. Neha</h2>
        <a href="#" className="font-dm-sans text-xs text-[#3ECFB2] font-bold hover:text-[#1A9E8C] transition-colors">
          Message Dr. Neha &rarr;
        </a>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-4 flex-1"
      >
        {therapistNotes.map((note) => (
          <motion.div
            key={note.id}
            variants={fadeUp}
            className="bg-white/70 backdrop-blur-md border border-white rounded-2xl p-4 shadow-sm border-l-2 border-l-[#3ECFB2] relative pt-6"
          >
            <div className="absolute -top-3 left-4 bg-[#3ECFB2] text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-[0_2px_0_#1A9E8C]">
              {note.date}
            </div>
            
            <div className="font-nunito font-bold text-[#1B2D3E] text-sm mb-2 flex items-center gap-1.5">
              <span><Stethoscope size={16} /></span> {note.author}
            </div>
            <p className="font-dm-sans italic text-[#1B2D3E]/80 text-sm leading-relaxed">
              &quot;{note.content}&quot;
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
