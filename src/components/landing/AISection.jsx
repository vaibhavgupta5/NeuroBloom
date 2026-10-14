"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { Target, Smile, ClipboardCheck, FileText, Brain } from "lucide-react";

export default function AISection() {
  const aiFeatures = [
    {
      icon: <Target />,
      title: "Adaptive difficulty",
      desc: "Each game tracks how independently your child answers and steps the level up or down — no manual slider to tune"
    },
    {
      icon: <Smile />,
      title: "Camera expression practice",
      desc: "Off by default. When a parent turns it on, Mirror Me reads the child's expression on-device (never uploaded) to play a copy-the-face game — not to diagnose mood"
    },
    {
      icon: <ClipboardCheck />,
      title: "Independence, not just scores",
      desc: "Every answer records whether it needed a hint, so progress charts show real independence, not just accuracy"
    },
    {
      icon: <FileText />,
      title: "AI-assisted therapist reports",
      desc: "A therapist can draft a progress report from your child's real session data using Gemini — then reviews and edits it before you ever see it"
    }
  ];

  const labels = ["Adaptive levels", "Expression practice", "Independence tracking", "Therapist reports"];

  return (
    <section className="pt-24 pb-18 bg-ink overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="font-dm-sans text-teal-700 font-semibold mb-3 block text-lg uppercase tracking-wider">
            How it adapts
          </span>
          <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-white">
            Software that pays attention, so you don&apos;t have to tune it
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="w-full md:w-[45%] flex flex-col gap-10"
          >
            {aiFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeUp} className="flex gap-6 items-start">
                <div className="bg-teal-400/20 p-4 rounded-2xl flex-shrink-0 border border-teal-400/30 shadow-[0_4px_12px_rgba(62,207,178,0.1)]">
                  <span className="flex items-center text-teal-700">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-nunito font-bold text-xl text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-dm-sans text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="w-full md:w-[55%] relative h-[450px] md:h-[600px] flex items-center justify-center mt-12 md:mt-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-400/20 rounded-full blur-[50px]"></div>
            <div className="relative z-10 w-32 h-32 bg-ink border-2 border-teal-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(62,207,178,0.4)]">
              <Brain size={64} className="text-teal-700" />
            </div>
            {labels.map((label, index) => {
              const angle = index * (360 / labels.length);
              return (
                <motion.div
                  key={index}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(180px) rotate(-${angle}deg)`
                  }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, delay: index * 0.4, ease: "easeInOut" }}
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-dm-sans font-medium text-sm md:text-base px-6 py-3 rounded-full shadow-lg whitespace-nowrap">
                    {label}
                  </div>
                </motion.div>
              );
            })}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <circle cx="50%" cy="50%" r="180" fill="none" stroke="#3ECFB2" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
