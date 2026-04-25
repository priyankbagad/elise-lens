"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

type Stat =
  | { hasCounter: true; value: number; prefix?: string; suffix: string; label: string }
  | { hasCounter: false; label: string };

const stats: Stat[] = [
  { hasCounter: true, value: 4, suffix: "", label: "APIs Integrated" },
  { hasCounter: true, value: 2, prefix: "<", suffix: "s", label: "Enrichment Time" },
  { hasCounter: false, label: "AI-Powered Scoring" },
  { hasCounter: false, label: "Built for Modern Sales" },
];

function Counter({
  from,
  to,
  prefix = "",
  suffix = "",
}: {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(from, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, from, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="py-16 bg-[#7C3AED] border-y border-[#6D28D9]/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4">
          {stats.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="text-3xl md:text-4xl font-bold text-white"
                  style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}
                >
                  {stat.hasCounter ? (
                    <Counter
                      from={0}
                      to={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  ) : (
                    <span className="text-white/90 text-2xl">✦</span>
                  )}
                </div>
                <div className="text-sm text-white/80 mt-1.5 font-medium tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
              {i < stats.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-white/30" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
