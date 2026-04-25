"use client";

import React from "react";
import { motion } from "framer-motion";
import { MagicLink } from "@/components/ui/MagicButton";

/* ─── Feature data ───────────────────────────────────────────────────────────── */

const features = [
  {
    Icon: EnrichIcon,
    title: "Real-Time Enrichment",
    description:
      "Census, DataUSA, NewsAPI and Wikipedia data pulled instantly for every lead.",
    tag: "5 APIs · Real-time",
    num: "01",
  },
  {
    Icon: ScoringIcon,
    title: "AI Lead Scoring",
    description:
      "0–100 score based on renter percentage, vacancy rates, market size and ICP fit.",
    tag: "0–100 Score · ICP Fit",
    num: "02",
  },
  {
    Icon: OutreachIcon,
    title: "Personalized Outreach",
    description:
      "Claude AI drafts emails using real city data — not generic templates.",
    tag: "Claude AI · Personalized",
    num: "03",
  },
];

/* ─── Section ────────────────────────────────────────────────────────────────── */

export function FeatureCards() {
  return (
    <section id="features" className="py-20 px-4 max-w-7xl mx-auto" style={{ overflow: 'visible' }}>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mt-14"
      >
        <MagicLink href="/enrich">Try Elise Lens →</MagicLink>
      </motion.div>
    </section>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────────── */

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const { Icon, title, description, tag, num } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -6 }}
      className="relative h-full bg-white border border-[#EDE9FE] rounded-[20px] p-10 px-8 overflow-hidden group cursor-default transition-all duration-300 hover:border-[#7C3AED] hover:shadow-[0_20px_60px_rgba(124,58,237,0.12)]"
    >
      {/* Card number */}
      <span
        className="absolute top-6 right-6 text-5xl font-extrabold text-[#E5E7EB] select-none leading-none"
        style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
      >
        {num}
      </span>

      {/* Icon container */}
      <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] group-hover:bg-[#7C3AED] flex items-center justify-center transition-colors duration-300 flex-shrink-0">
        <span className="text-[#7C3AED] group-hover:text-white transition-colors duration-300">
          <Icon />
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[22px] font-bold text-[#1A1A2E] mt-6 leading-snug"
        style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-[15px] text-[#6B7280] leading-[1.7] mt-3">
        {description}
      </p>

      {/* Bottom tag */}
      <div className="mt-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F5F3FF] text-[#7C3AED] text-xs font-medium">
          {tag}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */

function EnrichIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function ScoringIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function OutreachIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
