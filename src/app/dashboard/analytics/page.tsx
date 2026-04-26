"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type StoredLead = {
  id: string | number;
  name: string;
  company: string;
  city: string;
  state: string;
  score: number;
  tier: string;
  enrichedAt: string;
};

type CityRow = {
  city: string;
  state: string;
  count: number;
  avgScore: number;
  topTier: "Hot" | "Warm" | "Cool";
};

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: { 'x-user-id': session?.user?.id || '' },
      })
        .then((r) => r.json())
        .then((data) => {
          const rows = (data.leads ?? []).map((l: Record<string, unknown>) => ({
            id: l.id,
            name: l.name,
            company: l.company,
            city: l.city,
            state: l.state,
            score: l.score,
            tier: l.tier,
            enrichedAt: l.created_at,
          }));
          setLeads(rows);
        })
        .catch(() => setLeads([]));
    })();
  }, []);

  if (!mounted) {
    return (
      <>
        <DashboardHeader title="Analytics" subtitle="Insights" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-[#F5F3FF] animate-pulse" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (leads.length === 0) {
    return (
      <>
        <DashboardHeader title="Analytics" subtitle="Insights" />
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center mx-auto mb-4">
              <BarChartIcon />
            </div>
            <h2
              className="text-lg font-semibold text-[#1A1A2E] mb-2"
              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              No analytics yet
            </h2>
            <p className="text-sm text-neutral-400 mb-5">
              Enrich your first lead to see insights here
            </p>
            <Link
              href="/enrich"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-[0_4px_15px_rgba(124,58,237,0.35)]"
              style={{ background: "linear-gradient(135deg, #6D28D9, #7C3AED)" }}
            >
              Enrich First Lead →
            </Link>
          </div>
        </main>
      </>
    );
  }

  /* ── Calculations ── */
  const total = leads.length;
  const avgScore = Math.round(leads.reduce((s, l) => s + l.score, 0) / total);
  const hotCount = leads.filter((l) => l.score >= 80).length;
  const warmCount = leads.filter((l) => l.score >= 50 && l.score < 80).length;
  const coolCount = leads.filter((l) => l.score < 50).length;
  const hotPct = Math.round((hotCount / total) * 100);

  const cityCount = leads.reduce<Record<string, number>>((acc, l) => {
    const key = `${l.city}, ${l.state}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const scoreRanges = [
    { range: "0–25",   count: leads.filter((l) => l.score <= 25).length },
    { range: "26–50",  count: leads.filter((l) => l.score > 25 && l.score <= 50).length },
    { range: "51–75",  count: leads.filter((l) => l.score > 50 && l.score <= 75).length },
    { range: "76–100", count: leads.filter((l) => l.score > 75).length },
  ];

  const tierData = [
    { name: "Hot",  value: hotCount,  color: "#EF4444", pct: Math.round((hotCount / total) * 100) },
    { name: "Warm", value: warmCount, color: "#F59E0B", pct: Math.round((warmCount / total) * 100) },
    { name: "Cool", value: coolCount, color: "#3B82F6", pct: Math.round((coolCount / total) * 100) },
  ].filter((t) => t.value > 0);

  const citiesMap = leads.reduce<Record<string, StoredLead[]>>((acc, l) => {
    const key = `${l.city}__${l.state}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(l);
    return acc;
  }, {});

  const cityRows: CityRow[] = Object.entries(citiesMap)
    .map(([key, cityLeads]) => {
      const [city, state] = key.split("__");
      const avg = Math.round(cityLeads.reduce((s, l) => s + l.score, 0) / cityLeads.length);
      const h = cityLeads.filter((l) => l.score >= 80).length;
      const w = cityLeads.filter((l) => l.score >= 50 && l.score < 80).length;
      const c = cityLeads.length - h - w;
      const topTier: "Hot" | "Warm" | "Cool" = h >= w && h >= c ? "Hot" : w >= c ? "Warm" : "Cool";
      return { city, state, count: cityLeads.length, avgScore: avg, topTier };
    })
    .sort((a, b) => b.count - a.count);

  const kpiCards: { label: string; value: string; suffix: string; icon: ReactNode; isText: boolean }[] = [
    { label: "Total Leads Enriched", value: String(total),    suffix: "",  icon: <UsersIcon />,   isText: false },
    { label: "Average Lead Score",   value: String(avgScore), suffix: "",  icon: <ActivityIcon />, isText: false },
    { label: "Hot Leads",            value: String(hotPct),   suffix: "%", icon: <TargetIcon />,  isText: false },
    { label: "Top City",             value: topCity,          suffix: "",  icon: <MapPinIcon />,  isText: true },
  ];

  return (
    <>
      <DashboardHeader title="Analytics" subtitle="Insights" />

      <main className="flex-1 overflow-y-auto p-8 space-y-5">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-4 gap-5">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
              className="relative rounded-xl border border-[#EDE9FE] bg-white p-6"
              style={{ boxShadow: "0 1px 3px rgba(124,58,237,0.08), 0 1px 2px rgba(0,0,0,0.06)" }}
            >
              {/* Icon — absolute top-right */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  background: "#F5F3FF",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </div>

              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.1em] mb-3 pr-12">
                {card.label}
              </p>
              {card.isText ? (
                <p
                  className="text-xl font-bold text-[#7C3AED]"
                  style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
                >
                  {card.value}
                </p>
              ) : (
                <p
                  className="text-4xl font-bold text-[#1A1A2E] leading-none"
                  style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
                >
                  {card.value}
                  <span className="text-2xl text-neutral-400 ml-0.5">{card.suffix}</span>
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Score distribution bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4, ease: "easeOut" }}
            className="rounded-xl border border-[#EDE9FE] bg-white p-6"
            style={{ boxShadow: "0 1px 3px rgba(124,58,237,0.08), 0 1px 2px rgba(0,0,0,0.06)" }}
          >
            <p
              className="text-sm font-semibold text-[#1A1A2E] mb-0.5"
              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              Score Distribution
            </p>
            <p className="text-xs text-neutral-400 mb-5">Leads per score range</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreRanges} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" vertical={false} />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #EDE9FE",
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    cursor={{ fill: "#F5F3FF" }}
                    formatter={(v) => [v, "Leads"]}
                  />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Tier donut chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            className="rounded-xl border border-[#EDE9FE] bg-white p-6"
            style={{ boxShadow: "0 1px 3px rgba(124,58,237,0.08), 0 1px 2px rgba(0,0,0,0.06)" }}
          >
            <p
              className="text-sm font-semibold text-[#1A1A2E] mb-0.5"
              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              Leads by Tier
            </p>
            <p className="text-xs text-neutral-400 mb-5">Breakdown by lead quality</p>
            <div className="flex items-center gap-6 h-52">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius="52%"
                      outerRadius="78%"
                      dataKey="value"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {tierData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #EDE9FE",
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      formatter={(v, name) => [v, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex-shrink-0 space-y-4">
                {tierData.map((t) => (
                  <div key={t.name} className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: t.color }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#1A1A2E]">{t.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        {t.value} leads · {t.pct}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Cities table ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, duration: 0.4, ease: "easeOut" }}
          className="rounded-xl border border-[#EDE9FE] bg-white overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(124,58,237,0.08), 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div className="px-6 py-4 border-b border-[#EDE9FE]">
            <h2
              className="text-lg font-semibold text-[#1A1A2E]"
              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              Top Cities
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">Sorted by lead count</p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-5 px-6 py-2.5 bg-[#F8F7FF] border-b border-[#EDE9FE]">
            {["City", "State", "Leads", "Avg Score", "Top Tier"].map((h) => (
              <span
                key={h}
                className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.08em]"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {cityRows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-neutral-400 text-center">No city data yet</p>
          ) : (
            cityRows.map((row, i) => (
              <div
                key={`${row.city}-${row.state}-${i}`}
                className="grid grid-cols-5 px-6 py-3.5 border-b border-[#F5F3FF] last:border-0 hover:bg-[#F9F7FF] transition-colors"
              >
                <span className="text-sm font-medium text-[#1A1A2E]">{row.city}</span>
                <span className="text-sm text-neutral-400">{row.state}</span>
                <span className="text-sm font-bold text-[#7C3AED]">{row.count}</span>
                <span className="text-sm text-[#1A1A2E]">{row.avgScore}</span>
                <TierPill tier={row.topTier} />
              </div>
            ))
          )}
        </motion.div>

      </main>
    </>
  );
}

/* ─── KPI icons ─────────────────────────────────────────────────────────────── */

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

/* ─── Tier pill ──────────────────────────────────────────────────────────────── */

function TierPill({ tier }: { tier: "Hot" | "Warm" | "Cool" }) {
  const config = {
    Hot:  { bg: "bg-red-50",   text: "text-red-500",   dot: "bg-red-500" },
    Warm: { bg: "bg-amber-50", text: "text-amber-500", dot: "bg-amber-500" },
    Cool: { bg: "bg-blue-50",  text: "text-blue-500",  dot: "bg-blue-500" },
  };
  const c = config[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit",
        c.bg,
        c.text
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.dot)} />
      {tier}
    </span>
  );
}
