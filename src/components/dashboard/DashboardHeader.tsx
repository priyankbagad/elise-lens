"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MagicLink } from "@/components/ui/MagicButton";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Overview",
}: DashboardHeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-[60px] px-6 border-b border-[#EDE9FE] bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_#EDE9FE]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-[#9CA3AF] text-xs font-medium hover:text-[#7C3AED] transition-colors">Elise Lens</Link>
        <span className="text-[#D1D5DB] text-xs">/</span>
        <span className="text-[#1A1A2E] font-bold text-sm" style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}>{title}</span>
        {subtitle && subtitle !== title && (
          <>
            <span className="text-[#D1D5DB]">/</span>
            <span className="text-[#4B5563]">{subtitle}</span>
          </>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-[#F5F3FF] transition-colors">
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
        </button>

        {/* Enrich CTA */}
        <MagicLink href="/enrich" className="h-9 shadow-[0_4px_15px_rgba(124,58,237,0.35)]">
          <SparklesIcon />
          Enrich New Lead
        </MagicLink>
      </div>
    </header>
  );
}

/* ── Icon helpers ─────────────────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L13.5 8.5 L19 10 L13.5 11.5 L12 17 L10.5 11.5 L5 10 L10.5 8.5 Z" />
    </svg>
  );
}
