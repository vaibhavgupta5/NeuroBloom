"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer, fadeUp } from "../../lib/animations";

function AnimatedStat({ value, prefix = "", suffix = "", label, source, href }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  const numericMatch = value.match(/\d+/);
  const targetNumber = numericMatch ? parseInt(numericMatch[0], 10) : 0;

  useEffect(() => {
    if (isInView && targetNumber > 0) {
      let startTimestamp = null;
      const duration = 1200;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.floor(easeOut * targetNumber));
        if (progress < 1) window.requestAnimationFrame(step);
        else setDisplayValue(targetNumber);
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, targetNumber]);

  const renderValue = () => (targetNumber ? value.replace(/\d+/, displayValue) : value);

  return (
    <motion.div variants={fadeUp} className="clay-card p-8 flex flex-col items-center text-center">
      <div ref={ref} className="font-sora font-bold text-[40px] text-teal-700 leading-tight mb-2 flex items-center tabular">
        {prefix}{renderValue()}{suffix}
      </div>
      <p className="font-dm-sans text-ink font-medium leading-relaxed">{label}</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-dm-sans text-xs text-muted hover:text-teal-700 mt-3 underline">
        {source}
      </a>
    </motion.div>
  );
}

export default function ProblemSection() {
  return (
    <section className="py-24 bg-[#D4F5EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="uppercase tracking-[0.2em] font-dm-sans text-teal-700 text-sm font-bold block mb-4">
              The Challenge
            </span>
            <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-ink max-w-3xl mx-auto leading-tight">
              Families are waiting — for specialists, for slots, for answers.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-10">
            <AnimatedStat
              value="1 in 36"
              label="children are diagnosed with autism in the US"
              source="CDC, 2023 surveillance data"
              href="https://www.cdc.gov/autism/data-research/index.html"
            />
            <AnimatedStat
              value="1 in 89"
              label="children were found to have autism in a multi-state Indian study"
              source="Neurology India, INCLEN study, 2019"
              href="https://journals.lww.com/neur/fulltext/2019/67010/prevalence_of_autism_spectrum_disorder_in_indian.21.aspx"
            />
            <AnimatedStat
              value="~2"
              suffix=" years"
              label="pass between a parent's first concern and a diagnosis in India, after seeing several clinicians"
              source="StartupTalky, reporting on Indian diagnostic delays"
              href="https://startuptalky.com/news/india-child-development-delay-diagnosis-too-late/"
            />
          </div>

          <motion.div variants={fadeUp} className="text-center">
            <p className="font-dm-sans font-medium text-xl text-teal-700 bg-white/40 px-6 py-3 rounded-full inline-block backdrop-blur-sm border border-white/60 shadow-sm">
              NeuroBloom gives families short, structured practice to use between appointments — not a replacement for diagnosis or therapy.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
