"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MagicLink } from "@/components/ui/MagicButton";

/* ─── Mock data ──────────────────────────────────────────────────────────────── */

export type Lead = {
  id: string | number;
  name: string;
  company: string;
  city: string;
  state: string;
  score: number;
  status: "new" | "contacted" | "qualified" | "archived";
  date: string;
  avatarInitials: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function toRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function stageToStatus(stage: string): Lead["status"] {
  if (stage === "qualified") return "qualified";
  if (stage === "contacted" || stage === "responded") return "contacted";
  if (stage === "closed") return "archived";
  return "new";
}

type SortKey = "name" | "score" | "date";

/* ─── Root component ─────────────────────────────────────────────────────────── */

export function RecentLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cool">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`)
      .then((r) => r.json())
      .then((data) => {
        const rows = (data.leads ?? []).map(
          (l: {
            id: string;
            name: string;
            company: string;
            city: string;
            state: string;
            score: number;
            pipeline_stage: string;
            created_at: string;
          }) => ({
            id: l.id,
            name: l.name,
            company: l.company,
            city: l.city,
            state: l.state,
            score: l.score,
            status: stageToStatus(l.pipeline_stage),
            date: toRelativeTime(l.created_at),
            avatarInitials: getInitials(l.name),
          })
        );
        setLeads(rows);
      })
      .catch(() => setLeads([]));
  }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    if (q && !l.name.toLowerCase().includes(q) && !l.company.toLowerCase().includes(q) && !l.city.toLowerCase().includes(q)) return false;
    if (filter === "hot") return l.score >= 80;
    if (filter === "warm") return l.score >= 50 && l.score < 80;
    if (filter === "cool") return l.score < 50;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "score") cmp = a.score - b.score;
    else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    else cmp = filtered.indexOf(a) - filtered.indexOf(b); // preserve API order (created_at desc)
    return sortAsc ? cmp : -cmp;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  return (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white overflow-hidden shadow-sm">
      {/* Table header row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE9FE] gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <h2
            className="text-lg font-semibold text-[#1A1A2E] whitespace-nowrap flex-shrink-0"
            style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            Recent Leads
          </h2>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F3FF] border border-[#EDE9FE] w-52 focus-within:border-[#7C3AED]/40 focus-within:bg-white transition-colors">
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="bg-transparent outline-none flex-1 text-[#1A1A2E] placeholder:text-[#9CA3AF] text-xs"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(["all", "hot", "warm", "cool"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all duration-150",
                filter === f
                  ? f === "all"
                    ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                    : f === "hot"
                    ? "bg-red-50 text-red-500"
                    : f === "warm"
                    ? "bg-amber-50 text-amber-500"
                    : "bg-blue-50 text-blue-500"
                  : "text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#F5F3FF]"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div className="w-px h-4 bg-[#EDE9FE] mx-1" />
          <MagicLink href="/enrich" className="h-8">
            + Enrich Lead
          </MagicLink>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-[#EDE9FE] bg-[#F5F3FF]">
        <SortHeader label="Lead" sortKey="name" current={sortKey} asc={sortAsc} onClick={() => handleSort("name")} />
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.08em]">Company</span>
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.08em]">City</span>
        <SortHeader label="Score" sortKey="score" current={sortKey} asc={sortAsc} onClick={() => handleSort("score")} />
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.08em]">Status</span>
        <SortHeader label="Added" sortKey="date" current={sortKey} asc={sortAsc} onClick={() => handleSort("date")} />
      </div>

      {/* Rows */}
      <div>
        <AnimatePresence mode="popLayout">
          {sorted.map((lead, i) => (
            <LeadRow key={lead.id} lead={lead} index={i} />
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <span className="text-2xl">🔍</span>
            <p className="text-sm font-medium text-[#1A1A2E]">No leads found</p>
            <p className="text-xs text-neutral-400 mt-0.5">Try a different search term or filter</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#EDE9FE]">
        <span className="text-xs text-[#9CA3AF]">Showing {sorted.length} of {leads.length} leads</span>
        <button className="text-xs text-[#7C3AED] hover:underline font-medium">View all leads →</button>
      </div>
    </div>
  );
}

/* ─── Lead row ───────────────────────────────────────────────────────────────── */

function LeadRow({ lead, index }: { lead: Lead; index: number }) {
  const router = useRouter();
  const tier = lead.score >= 80 ? "hot" : lead.score >= 50 ? "warm" : "cool";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => router.push(`/lead/${lead.id}`)}
      className="relative grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3.5 border-b border-[#F5F3FF] hover:bg-[#F9F7FF] transition-colors group cursor-pointer items-center"
    >
      {/* Left hover accent */}
      <span className="absolute left-0 inset-y-0 w-[3px] bg-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity rounded-r-sm" />
      {/* Lead */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar initials={lead.avatarInitials} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#1A1A2E] truncate">{lead.name}</p>
        </div>
      </div>

      {/* Company */}
      <p className="text-sm text-neutral-400 truncate">{lead.company}</p>

      {/* City */}
      <p className="text-sm text-neutral-500 truncate">{lead.city}, {lead.state}</p>

      {/* Score */}
      <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-0.5">
          <span className="text-base font-bold text-[#7C3AED]">{lead.score}</span>
          <span className="text-[10px] text-neutral-400">/100</span>
        </div>
        <ScoreBadge score={lead.score} tier={tier} />
      </div>

      {/* Status */}
      <StatusBadge status={lead.status} />

      {/* Date + view report */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-neutral-600 whitespace-nowrap">{lead.date}</span>
        <Link
          href={`/lead/${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-[#7C3AED] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
        >
          View Report →
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shadow-[#7C3AED]/25"
      style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
    >
      {initials}
    </div>
  );
}

function ScoreBadge({ score, tier }: { score: number; tier: "hot" | "warm" | "cool" }) {
  const config = {
    hot:  { bg: "bg-red-50",    text: "text-red-500",    dot: "bg-red-500",    label: "Hot" },
    warm: { bg: "bg-amber-50",  text: "text-amber-500",  dot: "bg-amber-500",  label: "Warm" },
    cool: { bg: "bg-blue-50",   text: "text-blue-500",   dot: "bg-blue-500",   label: "Cool" },
  } as const;
  const c = config[tier];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full", c.bg, c.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Lead["status"] }) {
  const map: Record<Lead["status"], { label: string; class: string }> = {
    new: { label: "New", class: "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]" },
    contacted: { label: "Contacted", class: "bg-purple-50 text-purple-600 border-purple-200" },
    qualified: { label: "Qualified", class: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    archived: { label: "Archived", class: "bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB]" },
  };
  const { label, class: cls } = map[status];
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", cls)}>
      {label}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 text-[#9CA3AF]">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function SortHeader({
  label,
  sortKey,
  current,
  asc,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onClick: () => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors text-left",
        active ? "text-[#7C3AED]" : "text-neutral-600 hover:text-neutral-400"
      )}
    >
      {label}
      <span className="text-[8px]">{active ? (asc ? "▲" : "▼") : "⇅"}</span>
    </button>
  );
}

