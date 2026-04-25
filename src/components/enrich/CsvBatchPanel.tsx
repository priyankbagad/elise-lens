"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────────────────────────── */

export interface CsvLead {
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
}

interface CsvBatchPanelProps {
  leads: CsvLead[];
  mode: "preview" | "enriching" | "done";
  progress: number;   // 1-based current index while enriching
  successCount: number;
  failCount: number;
  onEnrichAll: () => void;
  onCancel: () => void;
  onViewDashboard: () => void;
}

/* ── Component ───────────────────────────────────────────────────────────────── */

export function CsvBatchPanel({
  leads,
  mode,
  progress,
  successCount,
  failCount,
  onEnrichAll,
  onCancel,
  onViewDashboard,
}: CsvBatchPanelProps) {
  const total = leads.length;
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;
  const PREVIEW_MAX = 6;

  return (
    <div className="flex-1 overflow-hidden relative min-w-0 flex items-stretch">
      <AnimatePresence mode="wait">

        {/* ── Preview ── */}
        {mode === "preview" && (
          <motion.div
            key="preview"
            className="absolute inset-0 overflow-y-auto p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Header */}
              <div>
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5">
                  CSV Import
                </p>
                <h2
                  className="text-base font-semibold text-[#1A1A2E]"
                  style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
                >
                  {total} lead{total !== 1 ? "s" : ""} ready to enrich
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review the leads below, then click Enrich All to start.
                </p>
              </div>

              {/* Preview table */}
              <div className="rounded-xl border border-[#EDE9FE] bg-white overflow-hidden">
                {/* Column headers */}
                <div className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-3 px-4 py-2.5 bg-[#F8F7FF] border-b border-[#EDE9FE]">
                  {["Name", "Email", "Company", "City", "State"].map((h) => (
                    <span key={h} className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      {h}
                    </span>
                  ))}
                </div>

                {leads.slice(0, PREVIEW_MAX).map((lead, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_2fr_2fr_1fr_1fr] gap-3 px-4 py-2.5 border-b border-[#F5F3FF] last:border-0 hover:bg-[#F9F7FF] transition-colors"
                  >
                    <span className="text-xs font-medium text-[#1A1A2E] truncate">{lead.name || "—"}</span>
                    <span className="text-xs text-neutral-400 truncate">{lead.email || "—"}</span>
                    <span className="text-xs text-neutral-400 truncate">{lead.company || "—"}</span>
                    <span className="text-xs text-neutral-500">{lead.city || "—"}</span>
                    <span className="text-xs font-semibold text-[#7C3AED] uppercase">{lead.state || "—"}</span>
                  </div>
                ))}

                {total > PREVIEW_MAX && (
                  <div className="px-4 py-2.5 text-center text-xs text-neutral-400 bg-[#F8F7FF]">
                    …and {total - PREVIEW_MAX} more lead{total - PREVIEW_MAX !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onEnrichAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-[0_4px_15px_rgba(124,58,237,0.35)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)] transition-all"
                  style={{ background: "linear-gradient(135deg,#6D28D9,#7C3AED)" }}
                >
                  <SparklesIcon />
                  Enrich All {total} Leads
                </button>
                <button
                  onClick={onCancel}
                  className="text-sm text-neutral-400 hover:text-[#1A1A2E] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Enriching ── */}
        {mode === "enriching" && (
          <motion.div
            key="enriching"
            className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-6"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Pulsing icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border border-[#EDE9FE] bg-[#F5F3FF] flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon size={24} className="text-[#7C3AED]" />
                </motion.div>
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[9px] font-bold flex items-center justify-center">
                {progress}
              </span>
            </div>

            {/* Text */}
            <div className="text-center">
              <p
                className="text-lg font-semibold text-[#1A1A2E]"
                style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
              >
                Enriching {progress} of {total}…
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {leads[progress - 1]?.name && (
                  <>Processing <span className="font-medium text-[#7C3AED]">{leads[progress - 1].name}</span></>
                )}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-[10px] text-neutral-400 font-medium mb-1.5">
                <span>{pct}% complete</span>
                <span>{total - progress} remaining</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EDE9FE] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#6D28D9,#7C3AED,#A855F7)" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Completed ticks */}
            {progress > 1 && (
              <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
                {leads.slice(0, progress - 1).map((l, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-600 font-medium"
                  >
                    ✓ {l.name.split(" ")[0]}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Done ── */}
        {mode === "done" && (
          <motion.div
            key="done"
            className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-5 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "linear-gradient(135deg,#6D28D9,#7C3AED)", boxShadow: "0 8px 30px rgba(124,58,237,0.35)" }}
            >
              ✓
            </motion.div>

            <div>
              <h2
                className="text-xl font-bold text-[#1A1A2E]"
                style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
              >
                {successCount} lead{successCount !== 1 ? "s" : ""} enriched!
              </h2>
              {failCount > 0 && (
                <p className="text-xs text-neutral-400 mt-1">
                  {failCount} lead{failCount !== 1 ? "s" : ""} failed — check the console for details.
                </p>
              )}
              <p className="text-sm text-neutral-400 mt-1">
                All enriched leads are saved to Supabase and ready in your pipeline.
              </p>
            </div>

            <button
              onClick={onViewDashboard}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-[0_4px_15px_rgba(124,58,237,0.35)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)] transition-all"
              style={{ background: "linear-gradient(135deg,#6D28D9,#7C3AED)" }}
            >
              View Dashboard →
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────────── */

function SparklesIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("flex-shrink-0", className)}
    >
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    </svg>
  );
}
