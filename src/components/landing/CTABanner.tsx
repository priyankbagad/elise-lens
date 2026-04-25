"use client";

import React from "react";
import { motion } from "framer-motion";
import { MagicLink } from "@/components/ui/MagicButton";

const BEAMS = Array.from({ length: 9 }, (_, i) => i);

export function CTABanner() {
  return (
    <section className="relative overflow-hidden py-36 bg-[#F5F3FF]">
      {/* Animated vertical beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {BEAMS.map((i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${8 + i * 11}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{
              duration: 2.5 + i * 0.35,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "easeInOut",
            }}
          >
            <div className="h-full w-full bg-gradient-to-b from-transparent via-[#7C3AED]/30 to-transparent" />
          </motion.div>
        ))}
        {/* Central radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,rgba(124,58,237,0.07)_0%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#7C3AED] text-xs font-bold tracking-[0.25em] uppercase mb-5">
            Get Started Today
          </p>
          <h2
            className="text-4xl md:text-6xl font-bold text-[#1A1A2E] mb-6 leading-tight"
            style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}
          >
            Ready to enrich your
            <br />
            <span className="text-[#7C3AED]">first lead?</span>
          </h2>
          <p className="text-[#6B7280] text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            Join modern sales teams and start converting cold leads into warm
            conversations today.
          </p>
          <MagicLink href="/dashboard" className="text-base font-bold shadow-xl shadow-[#7C3AED]/15">
            Launch Elise Lens →
          </MagicLink>
        </motion.div>
      </div>
    </section>
  );
}
