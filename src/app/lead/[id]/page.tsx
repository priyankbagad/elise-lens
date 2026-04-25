"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/dashboard/BentoStats";
import type { ApiResult } from "@/components/enrich/EnrichOutput";
import { MagicButton, MagicLink } from "@/components/ui/MagicButton";

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
  fullData: ApiResult;
};

type TierInfo = { color: string; emoji: string; label: string; cls: string };

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function getTierInfo(score: number): TierInfo {
  if (score >= 75)
    return { color: "#FF4D4D", emoji: "🔥", label: "Hot Lead", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
  if (score >= 50)
    return { color: "#FFAC30", emoji: "✅", label: "Warm Lead", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  return { color: "#4D9FFF", emoji: "🧊", label: "Cool Lead", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function LeadProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [lead, setLead] = useState<StoredLead | null | undefined>(undefined);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.lead) { setLead(null); return; }
        const l = data.lead;
        setLead({
          id: l.id,
          name: l.name,
          company: l.company,
          city: l.city,
          state: l.state,
          score: l.score,
          tier: l.tier,
          enrichedAt: l.created_at,
          fullData: {
            lead: {
              id: l.id,
              name: l.name,
              email: l.email ?? "",
              company: l.company,
              address: l.address ?? "",
              city: l.city,
              state: l.state,
            },
            enrichment: l.enrichment,
            scoring: l.scoring,
            outreach: l.outreach,
          },
        });
      })
      .catch(() => setLead(null));
  }, [id]);

  if (lead === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 50%, #F5F3FF 100%)" }}>
        <div className="w-5 h-5 rounded-full border-2 border-[#7C3AED]/30 border-t-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 50%, #F5F3FF 100%)" }}>
        <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center">
          <span className="text-xl">🔍</span>
        </div>
        <p
          className="text-[#1A1A2E] text-lg font-semibold"
          style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
        >
          Lead not found
        </p>
        <p className="text-neutral-500 text-sm text-center max-w-xs">
          This lead may have been removed or the ID is invalid.
        </p>
        <MagicLink href="/dashboard" variant="ghost" className="mt-1 h-9">
          <span className="w-4 h-4"><ArrowLeftIcon /></span>
          Back to Dashboard
        </MagicLink>
      </div>
    );
  }

  const data = lead.fullData;
  const tierInfo = getTierInfo(lead.score);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 50%, #F5F3FF 100%)" }}>
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#EDE9FE]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-[#1A1A2E] transition-colors"
          >
            <span className="w-4 h-4 flex-shrink-0"><ArrowLeftIcon /></span>
            Dashboard
          </Link>
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <p className="text-sm font-medium text-[#1A1A2E] truncate hidden sm:block">
              {lead.name}
            </p>
            <span className="text-[#D1D5DB] hidden sm:block flex-shrink-0">·</span>
            <span
              className={cn(
                "text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0",
                tierInfo.cls
              )}
            >
              {tierInfo.emoji} {tierInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">

          {/* ── Left Column ── */}
          <div className="space-y-4">
            <LeadHeaderCard lead={lead} />
            <ScoreCardFull scoring={data.scoring} delay={0.1} />
            <CityIntelCard
              enrichment={data.enrichment}
              city={data.lead.city}
              state={data.lead.state}
              delay={0.2}
            />
            {data.enrichment.news.length > 0 && (
              <NewsFeedCard
                news={data.enrichment.news}
                city={data.lead.city}
                delay={0.3}
              />
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-4">
            <OutreachEmailCard
              outreach={data.outreach}
              toEmail={data.lead.email}
              delay={0.05}
            />
            <SalesInsightsCard insights={data.outreach.insights} delay={0.15} />
            <TalkTrackCard talkTrack={data.outreach.talkTrack} delay={0.25} />
            {data.outreach.bestTimeToCall && (
              <BestTimeCard bestTime={data.outreach.bestTimeToCall} delay={0.35} />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

/* ─── Lead Header Card ───────────────────────────────────────────────────────── */

function LeadHeaderCard({ lead }: { lead: StoredLead }) {
  const data = lead.fullData;
  const tierInfo = getTierInfo(lead.score);
  const initials = getInitials(lead.name);

  const avatarGradient =
    lead.score >= 75
      ? "from-red-500/80 to-red-700/60"
      : lead.score >= 50
      ? "from-amber-500/80 to-amber-700/60"
      : "from-blue-500/80 to-blue-700/60";

  const location = [data.lead.city, data.lead.state].filter(Boolean).join(", ");

  return (
    <Card delay={0}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br",
            avatarGradient
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-bold text-[#1A1A2E] leading-tight truncate"
            style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            {lead.name}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5 truncate">{lead.company}</p>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-2",
              tierInfo.cls
            )}
          >
            {tierInfo.emoji} {tierInfo.label}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 pt-4 border-t border-[#EDE9FE]">
        {data.lead.email && (
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0"><MailIcon /></span>
            <a
              href={`mailto:${data.lead.email}`}
              className="text-[#374151] hover:text-[#7C3AED] transition-colors truncate"
            >
              {data.lead.email}
            </a>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0"><MapPinIcon /></span>
            <span className="text-neutral-400 truncate">{location}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-xs">
          <span className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0"><ClockIcon /></span>
          <span className="text-neutral-500">Enriched {formatDate(lead.enrichedAt)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#EDE9FE] flex justify-center">
        <MagicLink href="/enrich" className="w-full">
          <span className="w-3.5 h-3.5"><RefreshIcon /></span>
          Re-enrich Lead
        </MagicLink>
      </div>
    </Card>
  );
}

/* ─── Score Card ─────────────────────────────────────────────────────────────── */

function ScoreCardFull({
  scoring,
  delay,
}: {
  scoring: ApiResult["scoring"];
  delay: number;
}) {
  const { score, breakdown } = scoring;
  const tierInfo = getTierInfo(score);

  return (
    <Card delay={delay}>
      <SectionLabel icon={<StarIcon />}>Lead Score</SectionLabel>

      <div className="flex items-center gap-6 mt-1">
        <ScoreRing score={score} size={110} strokeWidth={9} color={tierInfo.color} />
        <div>
          <p
            className="text-5xl font-black leading-none"
            style={{ color: tierInfo.color, fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            {score}
          </p>
          <p className="text-xs text-neutral-500 mt-1">out of 100</p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold mt-3 px-3 py-1 rounded-full border",
              tierInfo.cls
            )}
          >
            {tierInfo.emoji} {tierInfo.label}
          </span>
        </div>
      </div>

      {breakdown?.length > 0 && (
        <div className="mt-5 pt-4 border-t border-[#EDE9FE]">
          <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-3">
            Score Breakdown
          </p>
          <div className="space-y-0">
            {breakdown.map((item, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 py-2 border-b border-[#EDE9FE] last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-neutral-400">{item.factor}</p>
                  {item.note && (
                    <p className="text-[10px] text-neutral-600 mt-0.5 leading-snug">{item.note}</p>
                  )}
                </div>
                <span className="text-xs font-bold text-[#7C3AED] flex-shrink-0 mt-0.5">
                  +{item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── City Intelligence Card ─────────────────────────────────────────────────── */

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
  const { population, medianIncome, renterPct, vacancyRate, unemploymentRate, cityDescription } =
    enrichment;

  const stats = (
    [
      population != null && { label: "Population", value: population.toLocaleString(), positive: true },
      medianIncome != null && { label: "Median Income", value: `$${medianIncome.toLocaleString()}`, positive: true },
      renterPct != null && { label: "Renter Rate", value: `${renterPct}%`, positive: renterPct > 55 },
      vacancyRate != null && { label: "Vacancy Rate", value: `${vacancyRate}%`, positive: vacancyRate < 6 },
      unemploymentRate != null && { label: "Unemployment", value: `${unemploymentRate}%`, positive: unemploymentRate < 4 },
    ] as const
  ).filter(Boolean) as Array<{ label: string; value: string; positive: boolean }>;

  return (
    <Card delay={delay}>
      <SectionLabel icon={<MapPinIcon />}>
        City Intelligence · {city}, {state}
      </SectionLabel>

      {stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 bg-[#F5F3FF] border border-[#EDE9FE]"
            >
              <p className="text-[10px] text-neutral-500 mb-1">{s.label}</p>
              <p
                className={cn(
                  "text-base font-bold",
                  s.positive ? "text-[#1A1A2E]" : "text-neutral-400"
                )}
                style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-600">Market data unavailable for this location.</p>
      )}

      {cityDescription && (
        <p className="text-xs text-neutral-400 mt-4 leading-relaxed">{cityDescription}</p>
      )}
    </Card>
  );
}

/* ─── News Feed Card ─────────────────────────────────────────────────────────── */

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
      <SectionLabel icon={<NewspaperIcon />}>Recent Headlines · {city}</SectionLabel>
      <div className="space-y-1">
        {news.slice(0, 3).map((item, i) => (
          <motion.a
            key={i}
            href={item.url || "#"}
            target={item.url ? "_blank" : undefined}
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.08 }}
            className="group flex gap-3 p-3 rounded-xl hover:bg-[#F5F3FF] transition-colors"
          >
            <div className="w-1 rounded-full flex-shrink-0 self-stretch bg-[#7C3AED]/30 group-hover:bg-[#7C3AED]/60 transition-colors" />
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

/* ─── Outreach Email Card ────────────────────────────────────────────────────── */

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
    const text = `To: ${toEmail}\nSubject: ${outreach.subject}\n\n${outreach.body}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <Card delay={delay} noPadding>
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE9FE]">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0"><MailIcon /></span>
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
            AI Outreach Email
          </p>
        </div>
        <MagicButton
          variant="ghost"
          onClick={copy}
          className="h-8"
        >
          {copied ? "✓ Copied" : "Copy Email"}
        </MagicButton>
      </div>

      {/* To / Subject / badges */}
      <div className="px-5 py-3 border-b border-[#EDE9FE] space-y-1.5">
        <div className="flex gap-2 text-xs">
          <span className="text-neutral-600 w-14 flex-shrink-0">To:</span>
          <span className="text-[#374151] truncate">{toEmail}</span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-neutral-600 w-14 flex-shrink-0">Subject:</span>
          <span className="text-[#374151]">{outreach.subject}</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="inline-flex items-center rounded-full border font-semibold text-[9px] px-2 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20">
            Claude AI
          </span>
          <span className="inline-flex items-center rounded-full border font-semibold text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-400 border-purple-500/20">
            Personalized
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-xs text-[#374151] whitespace-pre-line leading-relaxed">
          {outreach.body}
        </p>
      </div>
    </Card>
  );
}

/* ─── Sales Insights Card ────────────────────────────────────────────────────── */

function SalesInsightsCard({ insights, delay }: { insights: string[]; delay: number }) {
  return (
    <Card delay={delay}>
      <SectionLabel icon={<LightbulbIcon />}>Sales Insights</SectionLabel>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.07 }}
            className="flex items-start gap-3"
          >
            <span className="text-base flex-shrink-0 leading-none mt-0.5">💡</span>
            <p className="text-xs text-[#374151] leading-relaxed">{insight}</p>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}

/* ─── Talk Track Card ────────────────────────────────────────────────────────── */

function TalkTrackCard({ talkTrack, delay }: { talkTrack: string[]; delay: number }) {
  return (
    <Card delay={delay}>
      <SectionLabel icon={<PhoneIcon />}>Cold Call Starters</SectionLabel>
      <ol className="space-y-2.5">
        {talkTrack.map((line, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + i * 0.07 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE]"
          >
            <span className="w-5 h-5 rounded-full bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-[#7C3AED]">
              {i + 1}
            </span>
            <p className="text-xs text-[#374151] leading-relaxed">{line}</p>
          </motion.li>
        ))}
      </ol>
    </Card>
  );
}

/* ─── Best Time Card ─────────────────────────────────────────────────────────── */

function BestTimeCard({ bestTime, delay }: { bestTime: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rounded-2xl border border-[#7C3AED]/25 bg-[#7C3AED]/[0.04] p-5"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 text-xl">
          📅
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#7C3AED]/50 uppercase tracking-widest mb-1">
            Best Time to Call
          </p>
          <p
            className="text-sm font-semibold text-[#7C3AED]"
            style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            {bestTime}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Shared Card Shell ──────────────────────────────────────────────────────── */

function Card({
  children,
  delay = 0,
  noPadding = false,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  noPadding?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-[#EDE9FE] bg-white overflow-hidden",
        !noPadding && "p-5",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0">{icon}</span>}
      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
        {children}
      </p>
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="m12 19-7-7 7-7M5 12h14" />
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
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6M10 22h4" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.06a16 16 0 0 0 8 8l.38-.38a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
