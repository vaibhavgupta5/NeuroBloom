"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../../lib/animations";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative bg-gradient-to-br from-[#3ECFB2] to-[#4A90D9] rounded-[40px] p-12 md:p-20 text-center overflow-hidden shadow-2xl border-4 border-[#E8FAF6]"
        >
          {/* Background Blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-[20%] right-[30%] w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.h2 variants={fadeUp} className="font-nunito font-bold text-3xl md:text-[42px] text-white mb-6 leading-tight max-w-2xl mx-auto">
              Your Child&apos;s Growth Starts Today
            </motion.h2>
            
            <motion.p variants={fadeUp} className="font-dm-sans text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Join 500+ families already using NeuroBloom to support their children&apos;s journey.
            </motion.p>
            
            <Link href="/dashboard">
              <motion.button 
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#1A9E8C] font-bold text-lg rounded-2xl px-8 py-4 shadow-[0_6px_0_rgba(255,255,255,0.4)] active:shadow-none active:translate-y-1.5 transition-all duration-150 flex items-center gap-2"
              >
                Create Free Account <span>→</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
