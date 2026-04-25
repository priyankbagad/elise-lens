"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────────────────────────── */

type Stats = {
  total: number;
  avgScore: number;
  thisWeek: number;
  hot: number;
  warm: number;
  cool: number;
  hotPct: number;
  sparkline: number[];
};

/* ── Root grid ───────────────────────────────────────────────────────────────── */

export function BentoStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`)
      .then((r) => r.json())
      .then((data) => {
        const leads: Array<{ score: number; tier: string; created_at: string }> =
          data.leads ?? [];
        const total = leads.length;

        if (total === 0) {
          setStats({ total: 0, avgScore: 0, thisWeek: 0, hot: 0, warm: 0, cool: 0, hotPct: 0, sparkline: Array(13).fill(0) });
          return;
        }

        const hot = leads.filter((l) => l.tier === "Hot").length;
        const warm = leads.filter((l) => l.tier === "Warm").length;
        const cool = leads.filter((l) => l.tier === "Cool").length;
        const avgScore = Math.round(leads.reduce((s, l) => s + (l.score ?? 0), 0) / total);
        const hotPct = Math.round((hot / total) * 100);

        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const thisWeek = leads.filter((l) => new Date(l.created_at).getTime() >= weekAgo).length;

        // Daily counts for last 13 days (sparkline)
        const sparkline = Array.from({ length: 13 }, (_, i) => {
          const dayStart = new Date();
          dayStart.setHours(0, 0, 0, 0);
          dayStart.setDate(dayStart.getDate() - (12 - i));
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          return leads.filter((l) => {
            const t = new Date(l.created_at).getTime();
            return t >= dayStart.getTime() && t < dayEnd.getTime();
          }).length;
        });

        setStats({ total, avgScore, thisWeek, hot, warm, cool, hotPct, sparkline });
      })
      .catch(() =>
        setStats({ total: 0, avgScore: 0, thisWeek: 0, hot: 0, warm: 0, cool: 0, hotPct: 0, sparkline: Array(13).fill(0) })
      );
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-3 gap-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn("h-[192px] rounded-xl bg-[#F5F3FF] animate-pulse", i === 3 ? "col-span-2" : "")}
          />
        ))}
      </div>
    );
  }

  const { total, avgScore, thisWeek, hot, warm, cool, hotPct, sparkline } = stats;

  return (
    <div className="grid grid-cols-3 gap-5">
      <BentoCard className="col-span-1" delay={0}>
        <TotalLeadsCard total={total} />
      </BentoCard>
      <BentoCard className="col-span-1" delay={0.07}>
        <AvgScoreCard avgScore={avgScore} total={total} hot={hot} warm={warm} cool={cool} />
      </BentoCard>
      <BentoCard className="col-span-1" delay={0.14}>
        <ThisWeekCard thisWeek={thisWeek} sparkline={sparkline} />
      </BentoCard>
      <BentoCard className="col-span-2" delay={0.21}>
        <BreakdownCard hot={hot} warm={warm} cool={cool} total={total} />
      </BentoCard>
      <BentoCard className="col-span-1" delay={0.28}>
        <HotLeadCard hotPct={hotPct} hot={hot} total={total} />
      </BentoCard>
    </div>
  );
}

/* ── Shared card shell ────────────────────────────────────────────────────────── */

function BentoCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(124,58,237,0.12)" }}
      className={cn(
        "relative rounded-xl border border-[#EDE9FE] bg-white p-6 overflow-hidden",
        "hover:border-[#7C3AED]/30 transition-colors duration-300",
        className
      )}
      style={{ boxShadow: "0 1px 3px rgba(124,58,237,0.08), 0 1px 2px rgba(0,0,0,0.06)" }}
    >
      {children}
    </motion.div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.1em] mb-3">
      {children}
    </p>
  );
}

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#7C3AED]/60">
      {children}
    </div>
  );
}

/* ── Animated number ─────────────────────────────────────────────────────────── */

function AnimatedNumber({ to, className }: { to: number; className?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, to]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {value}
    </span>
  );
}

/* ── Card 1: Total Leads ──────────────────────────────────────────────────────── */

function TotalLeadsCard({ total }: { total: number }) {
  return (
    <div className="flex flex-col h-full min-h-[160px]">
      <CardIcon><UsersIcon /></CardIcon>
      <CardLabel>Total Leads</CardLabel>
      <div className="flex-1 flex items-center gap-3">
        <span
          className="text-6xl font-bold text-[#1A1A2E] leading-none"
          style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
        >
          <AnimatedNumber to={total} />
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs text-neutral-400">All time · live from Supabase</p>
      </div>
    </div>
  );
}

/* ── Card 2: Avg Score ────────────────────────────────────────────────────────── */

function AvgScoreCard({
  avgScore,
  total,
  hot,
  warm,
  cool,
}: {
  avgScore: number;
  total: number;
  hot: number;
  warm: number;
  cool: number;
}) {
  const hotPct = total > 0 ? Math.round((hot / total) * 100) : 0;
  const warmPct = total > 0 ? Math.round((warm / total) * 100) : 0;
  const coolPct = total > 0 ? Math.round((cool / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full min-h-[160px]">
      <CardIcon><TargetIcon /></CardIcon>
      <CardLabel>Avg Score</CardLabel>
      <div className="flex-1 flex items-center gap-5">
        <ScoreRing score={avgScore} size={96} strokeWidth={9} />
        <div>
          <p className="text-[11px] text-neutral-400 font-medium mb-1.5">Distribution</p>
          <div className="space-y-1.5">
            <MiniLegendRow color="#EF4444" label="Hot" pct={hotPct} />
            <MiniLegendRow color="#F59E0B" label="Warm" pct={warmPct} />
            <MiniLegendRow color="#3B82F6" label="Cool" pct={coolPct} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniLegendRow({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-neutral-500 w-7">{label}</span>
      <span className="text-neutral-600 font-semibold">{pct}%</span>
    </div>
  );
}

/* ── Card 3: This Week ────────────────────────────────────────────────────────── */

function ThisWeekCard({ thisWeek, sparkline }: { thisWeek: number; sparkline: number[] }) {
  const max = Math.max(...sparkline, 1);

  return (
    <div className="flex flex-col h-full min-h-[160px]">
      <CardIcon><TrendUpIcon /></CardIcon>
      <CardLabel>New This Week</CardLabel>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-end gap-2">
          <span
            className="text-5xl font-bold text-[#1A1A2E] leading-none"
            style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            <AnimatedNumber to={thisWeek} />
          </span>
        </div>
        <div className="flex items-end gap-0.5 h-10 mt-3">
          {sparkline.map((v, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{ background: i === sparkline.length - 1 ? "#7C3AED" : "#EDE9FE" }}
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.03, ease: "easeOut" }}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-2">last 7 days</p>
      </div>
    </div>
  );
}

/* ── Card 4: Breakdown (wide) ──────────────────────────────────────────────────── */

function BreakdownCard({ hot, warm, cool, total }: { hot: number; warm: number; cool: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const segments = [
    { label: "Hot", count: hot, color: "#EF4444", pct: total > 0 ? (hot / total) * 100 : 0 },
    { label: "Warm", count: warm, color: "#F59E0B", pct: total > 0 ? (warm / total) * 100 : 0 },
    { label: "Cool", count: cool, color: "#3B82F6", pct: total > 0 ? (cool / total) * 100 : 0 },
  ];

  return (
    <div ref={ref} className="flex flex-col h-full min-h-[160px]">
      <CardIcon><PieChartIcon /></CardIcon>
      <CardLabel>Lead Breakdown</CardLabel>

      <div className="flex gap-6 mb-5">
        {segments.map((s) => (
          <div key={s.label} className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-xs text-neutral-400">{s.label}</span>
            </div>
            <span
              className="text-3xl font-bold"
              style={{ color: s.color, fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              {s.count}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">{Math.round(s.pct)}%</span>
          </div>
        ))}
        <div className="ml-auto text-right flex flex-col justify-center">
          <span className="text-[11px] text-neutral-400 font-medium">Total</span>
          <p className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
            {total}
          </p>
        </div>
      </div>

      <div className="flex h-2.5 rounded-full overflow-hidden gap-px mt-auto">
        {segments.map((s, idx) => (
          <motion.div
            key={s.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ background: s.color }}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${s.pct}%` } : {}}
            transition={{ duration: 1.1, delay: idx * 0.15, ease: "easeOut" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Card 5: Hot Lead Rate ────────────────────────────────────────────────────── */

function HotLeadCard({ hotPct, hot, total }: { hotPct: number; hot: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col h-full min-h-[160px]">
      <CardIcon><ZapIcon /></CardIcon>
      <CardLabel>Hot Lead Rate</CardLabel>
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <span
          className="text-6xl font-bold leading-none"
          style={{ color: "#7C3AED", fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
        >
          <AnimatedNumber to={hotPct} />
          <span className="text-4xl">%</span>
        </span>
        <p className="text-xs text-neutral-400 mt-2">{hot} of {total} leads are Hot</p>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between text-[10px] text-neutral-400 font-medium mb-1.5">
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#EDE9FE] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #7C3AED, #A855F7)" }}
            initial={{ width: 0 }}
            animate={isInView ? { width: `${hotPct}%` } : {}}
            transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-neutral-400 mt-1.5">Live from Supabase</p>
      </div>
    </div>
  );
}

/* ── Score Ring (SVG) ────────────────────────────────────────────────────────── */

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  color = "#7C3AED",
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const ref = useRef<SVGCircleElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const isDefaultPurple = color === "#7C3AED";
  const gradientId = `ring-grad-${size}-${score}`;

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width: size,
        height: size,
        filter: isDefaultPurple ? "drop-shadow(0 0 10px rgba(124,58,237,0.35))" : undefined,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {isDefaultPurple && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE9FE" strokeWidth={strokeWidth} />
        <motion.circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={isDefaultPurple ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: circumference - progress } : {}}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold leading-none"
          style={{
            fontSize: size * 0.235,
            color: isDefaultPurple ? "#7C3AED" : color,
            fontFamily: "var(--font-syne,'Syne',sans-serif)",
          }}
        >
          {score}
        </span>
        <span className="text-[9px] text-neutral-400 mt-0.5 font-medium">/100</span>
      </div>
    </div>
  );
}

/* ── Trend badge ─────────────────────────────────────────────────────────────── */

function TrendBadge({ value, positive }: { value: string; positive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
        positive
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-red-50 text-red-500 border border-red-200"
      )}
    >
      {positive ? "↑" : "↓"} {value}
    </span>
  );
}

/* ── Card icons ───────────────────────────────────────────────────────────────── */

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function PieChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
