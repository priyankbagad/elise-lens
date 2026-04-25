"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type ButtonState = "idle" | "loading" | "success";

interface StatefulButtonProps {
  children: React.ReactNode;
  className?: string;
  /** Async function — button manages idle→loading→success state automatically */
  onClick?: () => Promise<void>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Controlled loading: show spinner without an async onClick (e.g. from parent state) */
  loading?: boolean;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function StatefulButton({
  children,
  onClick,
  loading: controlledLoading,
  disabled,
  className,
  type = "button",
}: StatefulButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  // Controlled mode (loading prop) takes precedence over internal async state
  const isLoading = controlledLoading !== undefined ? controlledLoading : state === "loading";
  const isSuccess = controlledLoading === undefined && state === "success";
  const isDisabled = disabled || isLoading || isSuccess;

  async function handleClick() {
    if (!onClick || isLoading || isSuccess) return;
    setState("loading");
    try {
      await onClick();
      setState("success");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
    }
  }

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick ? handleClick : undefined}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      className={cn(
        "relative flex items-center justify-center gap-2 font-semibold",
        "transition-colors duration-200 overflow-hidden select-none",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="flex items-center gap-2"
          >
            <SpinnerIcon />
            Loading…
          </motion.span>
        ) : isSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, type: "spring", stiffness: 400, damping: 18 }}
            className="flex items-center gap-2"
          >
            <CheckIcon />
            Done!
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────────── */

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="animate-spin flex-shrink-0"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
