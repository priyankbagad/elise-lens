"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MagicLink } from "@/components/ui/MagicButton";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Dashboard", link: "/dashboard" },
  { name: "Enrich Lead", link: "/enrich" },
];

export function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-6 px-6 py-3 rounded-full w-full max-w-[768px] mx-4 min-w-0 transition-all duration-300",
          scrolled
            ? "bg-white/95 border border-[#EDE9FE] backdrop-blur-xl shadow-lg shadow-[#7C3AED]/10"
            : "bg-white/70 border border-[#EDE9FE]/50 backdrop-blur-md"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 pl-1">
          <span
            className="text-xl font-bold whitespace-nowrap pl-1"
            style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)" }}
          >
            <span className="text-[#7C3AED]">Elise</span>
            <span className="text-[#1A1A2E]"> Lens</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className={cn(
                "text-sm font-medium transition-colors duration-200 whitespace-nowrap",
                pathname === item.link
                  ? "text-[#7C3AED]"
                  : "text-[#6B7280] hover:text-[#1A1A2E]"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <MagicLink href="/dashboard" className="flex-shrink-0 h-9">
          Launch →
        </MagicLink>
      </div>
    </motion.header>
  );
}
