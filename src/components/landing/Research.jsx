"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "../../lib/animations";

const PRACTICES = [
  "Visual Supports", "First-Then Boards", "Prompt Fading", "Parent-Mediated Teaching", "Least-to-Most Prompting",
];

const FINDINGS = [
  {
    claim: "Visual Supports and First-Then boards are named evidence-based practices",
    detail: "The National Clearinghouse on Autism Evidence and Practice's 2020 review found Visual Supports met the bar for an evidence-based practice across 104 single-case studies, spanning ages 0–22.",
    source: "AFIRM / NCAEP, 2020",
    href: "https://afirm.fpg.unc.edu/wp-content/uploads/Visual-Supports-Brief-Packet.pdf",
  },
  {
    claim: "Serious games have improved emotion recognition in published trials",
    detail: "A 2024 systematic review of serious games for autistic children and teens found emotion recognition improved in both studies that measured it, alongside gains in joint attention and behaviour.",
    source: "Healthcare, 2024 (PubMed 38470619)",
    href: "https://pubmed.ncbi.nlm.nih.gov/38470619/",
  },
  {
    claim: "Parent-mediated strategies move the needle, not just clinic time",
    detail: "Randomized trials of parent-mediated interventions (JASPER and similar models) found caregivers who were coached in simple joint-engagement strategies produced real gains in their child's engagement.",
    source: "PMC, randomized comparative trial",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4755315/",
  },
];

export default function Research() {
  return (
    <section id="research" className="py-24 bg-mint overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <span className="font-dm-sans text-teal-700 font-semibold mb-3 block text-lg bg-white/50 px-4 py-1.5 rounded-full inline-block border border-white/60">
              Built on published research
            </span>
            <h2 className="font-nunito font-bold text-3xl md:text-[38px] text-ink">
              The techniques are proven. NeuroBloom isn&apos;t a clinical trial — yet.
            </h2>
            <p className="font-dm-sans text-ink-soft text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              We didn&apos;t invent these methods. We built an app around them. Here&apos;s what the underlying research
              actually found — read the papers, don&apos;t just take our word for it.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-16">
            {PRACTICES.map((p) => (
              <span key={p} className="bg-white/60 border border-white/80 rounded-full px-5 py-2.5 text-sm font-medium text-teal-700 shadow-sm">
                {p}
              </span>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FINDINGS.map((f) => (
              <motion.a
                key={f.claim}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp}
                className="clay-card p-7 flex flex-col gap-3 bg-white/70 hover:bg-white transition-colors"
              >
                <h3 className="font-nunito font-bold text-lg text-ink leading-snug">{f.claim}</h3>
                <p className="font-dm-sans text-[15px] text-ink-soft leading-relaxed flex-1">{f.detail}</p>
                <span className="font-dm-sans text-xs font-bold text-teal-700 underline">{f.source} ↗</span>
              </motion.a>
            ))}
          </div>

          <motion.p variants={fadeUp} className="text-center font-dm-sans text-sm text-muted mt-10 max-w-2xl mx-auto">
            NeuroBloom is a pilot product, not a diagnosed medical device. It&apos;s built to work alongside your
            child&apos;s existing care, not replace it.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
