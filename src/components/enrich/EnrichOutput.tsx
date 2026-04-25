"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MagicButton } from "@/components/ui/MagicButton";
import { ScoreRing } from "@/components/dashboard/BentoStats";
import type { LeadFormData } from "./EnrichForm";
import type { EnrichState } from "./EnrichPipeline";

/* ─── API result type ────────────────────────────────────────────────────────── */

export interface ApiResult {
  lead: {
    id?: string;
    name: string;
    email: string;
    company: string;
    address: string;
    city: string;
    state: string;
  };
  enrichment: {
    population: number | null;
    medianIncome: number | null;
    renterPct: number | null;
    vacancyRate: number | null;
    unemploymentRate: number | null;
    cityDescription: string | null;
    news: Array<{
      title: string;
      source: string;
      url: string;
      publishedAt: string;
    }>;
  };
  scoring: {
    score: number;
    tier: string;
    tierColor: string;
    breakdown: Array<{ factor: string; points: number; note: string }>;
  };
  outreach: {
    subject: string;
    body: string;
    insights: string[];
    talkTrack: string[];
    bestTimeToCall: string;
  };
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

interface EnrichOutputProps {
  state: EnrichState;
  leadData: LeadFormData | null;
  enrichmentResult: ApiResult | null;
}

export function EnrichOutput({ state, leadData, enrichmentResult }: EnrichOutputProps) {
  return (
    <div className="flex-1 overflow-hidden relative min-w-0">
      <AnimatePresence mode="wait">
        {state !== "complete" ? (
          <motion.div
            key="waiting"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8"
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-14 h-14 rounded-2xl border border-[#EDE9FE] bg-[#F5F3FF] flex items-center justify-center">
              <OutputPlaceholderIcon />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-400">
                {state === "loading" ? "Enriching lead data…" : "Results will appear here"}
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                {state === "loading"
                  ? "Score, city intel, and outreach email are being generated"
                  : "Fill in lead details and click Enrich Lead →"}
              </p>
            </div>
            {state === "loading" && (
              <motion.div className="flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : !enrichmentResult ? (
          <motion.div
            key="error"
            className="absolute inset-0 flex items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-neutral-500">No enrichment data available.</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="absolute inset-0 overflow-y-auto p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4 pb-6">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5">
                  Step 3
                </p>
                <h2 className="text-base font-semibold text-[#1A1A2E]" style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
                  Enrichment Results
                </h2>
              </motion.div>

              <ScoreCard scoring={enrichmentResult.scoring} delay={0.15} />
              <CityIntelCard
                enrichment={enrichmentResult.enrichment}
                city={enrichmentResult.lead.city}
                state={enrichmentResult.lead.state}
                delay={0.25}
              />
              {enrichmentResult.enrichment.news.length > 0 && (
                <NewsFeedCard
                  news={enrichmentResult.enrichment.news}
                  city={enrichmentResult.lead.city}
                  delay={0.35}
                />
              )}
              <OutreachEmailCard
                outreach={enrichmentResult.outreach}
                toEmail={enrichmentResult.lead.email}
                delay={0.45}
              />
              <SalesInsightsCard outreach={enrichmentResult.outreach} delay={0.55} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Score Card ─────────────────────────────────────────────────────────────── */

function ScoreCard({ scoring, delay }: { scoring: ApiResult["scoring"]; delay: number }) {
  const { score, breakdown } = scoring;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const tier =
    score >= 75
      ? { emoji: "🔥", label: "Hot Lead", cls: "text-red-400 bg-red-500/10 border-red-500/20" }
      : score >= 50
      ? { emoji: "✅", label: "Warm Lead", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
      : { emoji: "🧊", label: "Cool Lead", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" };

  return (
    <Card delay={delay}>
      <CardLabel icon={<ScoreIcon />}>Lead Score</CardLabel>
      <div className="flex items-center gap-5 mt-4">
        <ScoreRing score={score} size={110} strokeWidth={9} color={color} />
        <div>
          <p className="text-5xl font-black leading-none" style={{ color, fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>
            {score}
          </p>
          <p className="text-xs text-neutral-500 mt-1">out of 100</p>
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold mt-3 px-3 py-1 rounded-full border", tier.cls)}>
            {tier.emoji} {tier.label}
          </span>
        </div>
      </div>
      {breakdown?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#EDE9FE] space-y-2">
          {breakdown.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-3">
              <p className="text-[11px] text-neutral-400 leading-snug flex-1">{item.note}</p>
              <span className="text-[11px] font-bold text-[#7C3AED] flex-shrink-0">+{item.points}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ─── City Intelligence ──────────────────────────────────────────────────────── */

function CityIntelCard({
  enrichment,
  city,
  state,
  delay,
}: {
  enrichment: ApiResult["enrichment"];
  city: string;
  state: string;
  delay: number;
}) {
  const { renterPct, medianIncome, population, vacancyRate, cityDescription } = enrichment;

  const stats = (
    [
      renterPct != null && { label: "Renter Percentage", value: `${renterPct}%`, positive: renterPct > 55 },
      medianIncome != null && { label: "Median Income", value: `$${medianIncome.toLocaleString()}`, positive: true },
      population != null && { label: "Population", value: population.toLocaleString(), positive: true },
      vacancyRate != null && { label: "Vacancy Rate", value: `${vacancyRate}%`, positive: vacancyRate < 6 },
    ] as const
  ).filter(Boolean) as Array<{ label: string; value: string; positive: boolean }>;

  return (
    <Card delay={delay}>
      <CardLabel icon={<MapPinIcon />}>
        City Intelligence · {city}, {state}
      </CardLabel>
      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl p-3 bg-[#F5F3FF] border border-[#EDE9FE]">
              <p className="text-[10px] text-neutral-500 mb-1 leading-tight">{s.label}</p>
              <p
                className={cn("text-lg font-bold", s.positive ? "text-[#1A1A2E]" : "text-neutral-400")}
                style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-600 mt-4">Market data unavailable for this location.</p>
      )}
      {cityDescription && (
        <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed line-clamp-3">{cityDescription}</p>
      )}
    </Card>
  );
}

/* ─── News Feed ──────────────────────────────────────────────────────────────── */

function NewsFeedCard({
  news,
  city,
  delay,
}: {
  news: ApiResult["enrichment"]["news"];
  city: string;
  delay: number;
}) {
  return (
    <Card delay={delay}>
      <CardLabel icon={<NewspaperIcon />}>Recent Headlines · {city}</CardLabel>
      <div className="mt-3 space-y-3">
        {news.map((item, i) => (
          <motion.a
            key={i}
            href={item.url || "#"}
            target={item.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.08 }}
            className="group flex gap-3 p-3 rounded-xl hover:bg-[#F5F3FF] transition-colors cursor-pointer"
          >
            <div className="w-1 rounded-full flex-shrink-0 mt-0.5 self-stretch bg-[#7C3AED]/30 group-hover:bg-[#7C3AED]/60 transition-colors" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#1A1A2E] leading-snug group-hover:text-[#7C3AED] transition-colors">
                {item.title}
              </p>
              <p className="text-[10px] text-neutral-600 mt-1">
                {item.source} · {item.publishedAt}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </Card>
  );
}

/* ─── AI Outreach Email ──────────────────────────────────────────────────────── */

function OutreachEmailCard({
  outreach,
  toEmail,
  delay,
}: {
  outreach: ApiResult["outreach"];
  toEmail: string;
  delay: number;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const full = `To: ${toEmail}\nSubject: ${outreach.subject}\n\n${outreach.body}`;
    navigator.clipboard.writeText(full).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <Card delay={delay} noPadding>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDE9FE]">
        <CardLabel icon={<MailIcon />} noPad>AI Outreach Email</CardLabel>
        <MagicButton variant="ghost" onClick={copy} className="h-8">
          {copied ? (<><span>✓</span> Copied</>) : (<><CopyIcon /> Copy Email</>)}
        </MagicButton>
      </div>
      <div className="px-4 py-3 border-b border-[#EDE9FE] space-y-1.5">
        <MetaRow label="To" value={toEmail} />
        <MetaRow label="Subject" value={outreach.subject} />
        <div className="flex items-center gap-2 mt-2">
          <Badge color="cyan" small>Claude AI</Badge>
          <Badge color="purple" small>Personalized</Badge>
        </div>
      </div>
      <div className="px-4 py-4 max-h-56 overflow-y-auto">
        <p className="text-xs text-[#374151] whitespace-pre-line leading-relaxed">{outreach.body}</p>
      </div>
    </Card>
  );
}

/* ─── Sales Insights ─────────────────────────────────────────────────────────── */

function SalesInsightsCard({ outreach, delay }: { outreach: ApiResult["outreach"]; delay: number }) {
  return (
    <Card delay={delay}>
      <CardLabel icon={<LightbulbIcon />}>Sales Insights</CardLabel>
      <ul className="mt-4 space-y-3">
        {outreach.insights.map((insight, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.07 }}
            className="flex items-start gap-2.5"
          >
            <span className="text-[#7C3AED] font-bold text-sm mt-0.5 flex-shrink-0">•</span>
            <p className="text-xs text-[#374151] leading-relaxed">{insight}</p>
          </motion.li>
        ))}
      </ul>

      {outreach.talkTrack?.length > 0 && (
        <>
          <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mt-5 mb-3">
            Talk Track
          </p>
          <ol className="space-y-2.5">
            {outreach.talkTrack.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-[11px] text-neutral-600 font-semibold flex-shrink-0 mt-0.5 w-3">{i + 1}.</span>
                <p className="text-xs text-neutral-400 leading-relaxed">{line}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      {outreach.bestTimeToCall && (
        <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE]">
          <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest flex-shrink-0">
            Best Time
          </span>
          <p className="text-xs text-[#7C3AED] font-medium">{outreach.bestTimeToCall}</p>
        </div>
      )}
    </Card>
  );
}

/* ─── Shared primitives ──────────────────────────────────────────────────────── */

function Card({ children, delay, noPadding = false }: { children: React.ReactNode; delay: number; noPadding?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("rounded-2xl border border-[#EDE9FE] bg-white overflow-hidden", !noPadding && "p-4")}
    >
      {children}
    </motion.div>
  );
}

function CardLabel({ icon, children, noPad = false }: { icon: React.ReactNode; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", !noPad && "")}>
      <span className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0">{icon}</span>
      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">{children}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-neutral-600 w-12 flex-shrink-0">{label}:</span>
      <span className="text-[#374151] truncate">{value}</span>
    </div>
  );
}

function Badge({ color, children, small = false }: { color: "emerald" | "cyan" | "purple"; children: React.ReactNode; small?: boolean }) {
  const styles = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cyan: "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border font-semibold", small ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1", styles[color])}>
      {children}
    </span>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */

function OutputPlaceholderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ScoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function NewspaperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
