"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

/* ─── Context ──────────────────────────────────────────────────────────────── */

interface SidebarCtxType {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SidebarCtx = createContext<SidebarCtxType>({ open: true, setOpen: () => {} });
export const useSidebar = () => useContext(SidebarCtx);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebarOpen");
      if (stored !== null) setOpen(stored !== "false");
    } catch {}
  }, []);

  function handleSetOpen(v: boolean) {
    setOpen(v);
    try { localStorage.setItem("sidebarOpen", String(v)); } catch {}
  }

  return (
    <SidebarCtx.Provider value={{ open, setOpen: handleSetOpen }}>{children}</SidebarCtx.Provider>
  );
}

/* ─── Shell ─────────────────────────────────────────────────────────────────── */

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 50%, #F5F3FF 100%)" }}>
        {children}
      </div>
    </SidebarProvider>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────────────── */

export interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface SidebarProps {
  topLinks: NavLink[];
  bottomLinks?: NavLink[];
  className?: string;
}

export function Sidebar({ topLinks, bottomLinks = [], className }: SidebarProps) {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string | null } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const username = user?.email?.split('@')[0] || 'User';
  const avatarText = username.slice(0, 2).toUpperCase();

  return (
    <motion.aside
      animate={{ width: open ? 220 : 68 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "flex-shrink-0 flex flex-col h-full overflow-hidden z-30",
        "border-r border-[#EDE9FE]",
        className
      )}
      style={{ background: "linear-gradient(180deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)" }}
    >
      {/* ── Logo row — two separate layouts so collapsed header fits in 68px ── */}
      {open ? (
        <div className="flex items-center justify-between h-[64px] px-4 flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-lg bg-white blur-sm opacity-30" />
              <div className="relative w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
                <span className="text-[11px] font-black text-[#7C3AED] tracking-tight">EL</span>
              </div>
            </div>
            <span
              className="text-sm font-bold text-white whitespace-nowrap tracking-tight"
              style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}
            >
              Elise <span className="text-white/70">Lens</span>
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[64px] flex-shrink-0 border-b border-white/10">
          <button
            onClick={() => setOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Expand sidebar"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 pt-3 pb-1 overflow-y-auto overflow-x-hidden">
        <SidebarSection links={topLinks} pathname={pathname} open={open} />
      </nav>

      {/* ── Bottom ── */}
      {bottomLinks.length > 0 && (
        <div className="flex flex-col gap-0.5 px-2 py-2 border-t border-white/10">
          <SidebarSection links={bottomLinks} pathname={pathname} open={open} />
        </div>
      )}

      {/* ── Back to Home ── */}
      <div className="px-2 pb-1">
        <Link
          href="/"
          title={!open ? "Back to Home" : undefined}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white/35 hover:text-white/65 hover:bg-white/[0.06] transition-colors group"
        >
          <span className="flex-shrink-0 w-[18px] h-[18px]"><ArrowLeftIcon /></span>
          {open && <span className="text-xs whitespace-nowrap">Back to Home</span>}
        </Link>
      </div>

      {/* ── User row ── */}
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
            {avatarText}
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="user-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-semibold text-white truncate leading-tight">{username}</p>
                <p className="text-[10px] text-white/50 truncate mt-0.5">{user?.email || 'Loading…'}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {open && (
            <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title={!open ? "Sign out" : undefined}
          className="mt-1 flex items-center gap-2 text-sm text-red-300/70 hover:text-red-300 transition-colors px-2 py-2 rounded-lg hover:bg-white/[0.06] w-full"
        >
          <span className="flex-shrink-0 w-[18px] h-[18px]"><LogOutIcon /></span>
          {open && <span className="text-xs whitespace-nowrap">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

/* ─── SidebarSection ─────────────────────────────────────────────────────────── */

function SidebarSection({
  links,
  pathname,
  open,
}: {
  links: NavLink[];
  pathname: string;
  open: boolean;
}) {
  return (
    <>
      {links.map((link) => {
        const isActive = !link.disabled && pathname === link.href;

        if (link.disabled) {
          return (
            <div
              key={link.label}
              title={!open ? link.label : undefined}
              className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium opacity-40 cursor-not-allowed text-white/65"
            >
              <span className="flex-shrink-0 w-[18px] h-[18px]">{link.icon}</span>
              {open && <span className="whitespace-nowrap">{link.label}</span>}
            </div>
          );
        }

        return (
          <Link
            key={link.label}
            href={link.href}
            title={!open ? link.label : undefined}
            className={cn(
              "relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group overflow-hidden",
              isActive
                ? "bg-white/[0.15] text-white shadow-sm"
                : "text-white/65 hover:text-white hover:bg-white/[0.08]"
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[55%] w-[3px] bg-white rounded-r-full" />
            )}
            <span className="flex-shrink-0 w-[18px] h-[18px]">{link.icon}</span>
            <AnimatePresence initial={false}>
              {open && (
                <motion.span
                  key={`label-${link.label}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.12 }}
                  className="whitespace-nowrap"
                >
                  {link.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </>
  );
}

/* ─── SidebarContent (right side) ───────────────────────────────────────────── */

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden min-w-0 bg-[#F8F7FF]", className)}>
      {children}
    </div>
  );
}

/* ─── Tiny icon helpers ──────────────────────────────────────────────────────── */

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
