"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export type StepStatus = "pending" | "active" | "done";

export interface EnrichStep {
  id: number;
  label: string;
  desc: string;
  status: StepStatus;
  detail?: string;
}

interface EnrichModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

const STEP_DEFS: { label: string; desc: string }[] = [
  { label: "Verifying identity",    desc: "Cross-referencing public records" },
  { label: "Fetching company data", desc: "LinkedIn, Crunchbase, news feeds" },
  { label: "Scoring lead",          desc: "Applying AI scoring model" },
  { label: "Generating summary",    desc: "Composing enrichment report" },
];

const STEP_DURATION_MS = 1400;

function makeSteps(statuses: StepStatus[]): EnrichStep[] {
  return STEP_DEFS.map((def, i) => ({ id: i + 1, ...def, status: statuses[i] }));
}

/* ─── Modal ──────────────────────────────────────────────────────────────────── */

export function EnrichModal({ isOpen, onComplete }: EnrichModalProps) {
  const [steps, setSteps] = useState<EnrichStep[]>(() =>
    makeSteps(STEP_DEFS.map(() => "pending"))
  );
  const [elapsedSecs, setElapsedSecs] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsedSecs(0);
      return;
    }
    const interval = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSteps(makeSteps(STEP_DEFS.map(() => "pending")));
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    STEP_DEFS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s) =>
              s.id === i + 1
                ? { ...s, status: "active" }
                : s
            )
          );
        }, i * STEP_DURATION_MS)
      );

      timers.push(
        setTimeout(() => {
          setSteps((prev) =>
            prev.map((s) =>
              s.id === i + 1
                ? { ...s, status: "done" }
                : s
            )
          );

          if (i === STEP_DEFS.length - 1) {
            setTimeout(() => onComplete?.(), 400);
          }
        }, i * STEP_DURATION_MS + STEP_DURATION_MS * 0.85)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [isOpen, onComplete]);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;
  const allDone = steps.length > 0 && doneCount === steps.length;
  const activeIdx = steps.findIndex((s) => s.status === "active");

  const timeoutMsg =
    elapsedSecs >= 30
      ? "This is taking unusually long. You can wait or try again."
      : elapsedSecs >= 15
      ? "Still working... APIs are taking longer than usual"
      : null;

  const stepLabel = allDone
    ? "Complete!"
    : activeIdx >= 0
    ? `Step ${activeIdx + 1} of ${steps.length}...`
    : steps.length > 0
    ? "Starting..."
    : "Initializing...";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-[#7C3AED]/[0.08] backdrop-blur-[8px]" />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white border border-[#7C3AED]/30 shadow-2xl shadow-[#7C3AED]/10 p-7"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h2
                className="text-xl font-semibold text-[#1A1A2E]"
                style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
              >
                {allDone ? "Enrichment Complete" : "Enriching Lead..."}
              </h2>
              <p className="text-sm text-[#6B7280] mt-1">
                Pulling real-time market intelligence
              </p>
            </div>

            {/* Step rows */}
            <div className="flex flex-col gap-4 mb-7">
              {steps.map((step, i) => {
                const isActive = step.status === "active";
                const isDone = step.status === "done";

                return (
                  <motion.div
                    key={step.id}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center mt-0.5">
                      {isDone ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 22 }}
                          className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/60 flex items-center justify-center"
                        >
                          <CheckIcon />
                        </motion.div>
                      ) : isActive ? (
                        <motion.div
                          className="w-8 h-8 rounded-full border-2 border-[#7C3AED]/25 border-t-[#7C3AED]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-[#EDE9FE] flex items-center justify-center">
                          <span className="text-[11px] font-semibold text-[#9CA3AF]">
                            {i + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Text block */}
                    <div className="flex-1 min-w-0">
                      {/* Label row */}
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium leading-tight",
                            isDone
                              ? "text-emerald-500"
                              : isActive
                              ? "text-[#1A1A2E]"
                              : "text-[#9CA3AF]"
                          )}
                        >
                          {step.label}
                        </p>

                        {/* Status badge */}
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={step.status}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "text-[11px] font-medium flex-shrink-0",
                              isDone
                                ? "text-emerald-500"
                                : isActive
                                ? "text-[#7C3AED]"
                                : "text-[#9CA3AF]"
                            )}
                          >
                            {isDone ? (
                              "Done ✓"
                            ) : isActive ? (
                              <span className="flex items-center gap-0.5">
                                Running
                                <motion.span
                                  animate={{ opacity: [1, 0.2, 1] }}
                                  transition={{ duration: 1.1, repeat: Infinity }}
                                >
                                  ...
                                </motion.span>
                              </span>
                            ) : (
                              "Waiting"
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {/* Description */}
                      <p
                        className={cn(
                          "text-[11px] mt-0.5",
                          isActive ? "text-[#6B7280]" : "text-[#9CA3AF]"
                        )}
                      >
                        {step.desc}
                      </p>

                      {/* Detail — only when done */}
                      <AnimatePresence>
                        {isDone && step.detail && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[11px] text-[#7C3AED] mt-1 font-medium truncate"
                          >
                            {step.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar + label */}
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-[#EDE9FE] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #7C3AED, #6D28D9)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepLabel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[11px] text-[#9CA3AF] text-center"
                >
                  {stepLabel}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence>
                {timeoutMsg && (
                  <motion.p
                    key={timeoutMsg}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "text-[11px] text-center font-medium pt-1",
                      elapsedSecs >= 30 ? "text-amber-500" : "text-[#7C3AED]"
                    )}
                  >
                    {timeoutMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────────── */

export function EnrichToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-emerald-500/30 shadow-xl shadow-emerald-500/10"
    >
      <span className="text-emerald-400 font-bold">✓</span>
      <p className="text-sm font-medium text-emerald-300">Lead enriched successfully</p>
    </motion.div>
  );
}

/* ─── Icon ───────────────────────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22c55e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
