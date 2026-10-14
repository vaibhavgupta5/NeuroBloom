"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../../lib/animations";
import Link from "next/link";
import { Star } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      features: [
        "1 child profile",
        "Adaptive games & Talk board",
        "Parent dashboard & mood tracking",
        "Visual schedules",
      ],
      isPopular: false,
    },
    {
      name: "Family",
      features: [
        "Multiple child profiles",
        "Everything in Starter",
        "Optional camera expression practice",
        "Link your child's therapist",
      ],
      isPopular: true,
    },
    {
      name: "Clinical",
      features: [
        "Everything in Family",
        "Link multiple therapists per child",
        "Goals with mastery tracking",
        "AI-assisted report drafts, reviewed by the therapist",
      ],
      isPopular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-mint">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-ink">
              Free during our pilot
            </h2>
            <p className="font-dm-sans text-muted text-lg mt-3 max-w-xl mx-auto">
              NeuroBloom is a pilot. Every tier below is free to use right now — pricing shown is
              what we expect to charge once we leave pilot, not a current bill.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-center relative z-10 mt-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className={`clay-card p-8 flex flex-col relative transition-all duration-300 border-2 ${
                  plan.isPopular
                    ? "bg-gradient-to-br from-teal-400 to-blue-400 border-white/40 md:scale-105 shadow-[0_20px_40px_rgba(62,207,178,0.25)] z-20"
                    : "bg-white/70 border-white/80 z-10"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-teal-700 font-nunito font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md border border-mint flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Most Popular
                  </div>
                )}

                <h3 className={`font-nunito font-bold text-xl mb-4 ${plan.isPopular ? "text-white" : "text-ink"}`}>
                  {plan.name}
                </h3>

                <div className={`flex items-baseline gap-1 mb-8 ${plan.isPopular ? "text-white" : "text-ink"}`}>
                  <div className="w-full font-sora font-bold text-2xl tracking-tight">
                    Free in pilot
                  </div>
                </div>

                <div className="flex-grow space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className={`flex items-center gap-3 font-dm-sans ${plan.isPopular ? "text-white/90" : "text-ink"}`}>
                      <span className={plan.isPopular ? "text-white" : "text-teal-700"}>✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <Link href="/signup" className="w-full">
                  <button className={`w-full py-3 rounded-2xl font-bold transition-all duration-150 ${
                    plan.isPopular
                      ? "bg-white text-teal-700 hover:bg-white/90 hover:scale-[1.02] active:scale-95 shadow-[0_4px_0_rgba(255,255,255,0.3)]"
                      : "clay-btn-primary"
                  }`}>
                    Get Started Free
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p variants={fadeUp} className="mt-12 text-center text-muted font-dm-sans text-sm">
            No credit card required. You can delete your account and data at any time.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
