"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../../lib/animations";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Within 3 weeks, Arjun started using picture symbols to ask for things. We hadn't seen that in 2 years of clinic visits.",
      name: "Priya M.",
      role: "Parent of 6-year-old"
    },
    {
      quote: "The parent dashboard gives me insights I used to get only during monthly check-ins. Now I adapt Rohan's plan weekly.",
      name: "Dr. Neha Sharma",
      role: "Behavioral Therapist"
    },
    {
      quote: "The games actually hold her attention. The emotion detection told us she was calm and focused the whole time.",
      name: "Amit K.",
      role: "Father of 8-year-old"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-[#1B2D3E]">
              Families Who Found Their Bloom
            </h2>
          </motion.div>

          <div className="flex overflow-x-auto pb-8 md:pb-0 md:grid md:grid-cols-3 gap-8 snap-x snap-mandatory hide-scrollbar">
            {testimonials.map((testi, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="snap-center shrink-0 w-[85vw] md:w-auto clay-card bg-white/70 backdrop-blur-md p-8 relative flex flex-col group hover:shadow-xl transition-all duration-300 border-2 border-white/80"
              >
                {/* Decorative Quote */}
                <div className="text-[120px] text-[#3ECFB2]/15 font-bold absolute -top-8 left-4 leading-none select-none font-serif">
                  &quot;
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex gap-1 mb-6 text-[#FFB020]">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                  
                  <p className="font-dm-sans italic text-lg text-[#1B2D3E] mb-8 leading-relaxed flex-grow">
                    &quot;{testi.quote}&quot;
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="bg-[#E8FAF6] rounded-full w-12 h-12 flex items-center justify-center font-nunito font-bold text-[#1A9E8C] text-lg border-2 border-white shadow-sm shrink-0">
                      {testi.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-nunito font-bold text-[#1B2D3E]">
                        {testi.name}
                      </div>
                      <div className="font-dm-sans text-sm text-[#8FA3B1]">
                        {testi.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}
