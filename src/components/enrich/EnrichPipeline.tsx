"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export type EnrichState = "idle" | "loading" | "complete";

interface EnrichPipelineProps {
  state: EnrichState;
  onComplete: () => void;
}

/* ─── Pipeline definition ────────────────────────────────────────────────────── */

const NODES = [
  {
    id: "input",
    label: "Lead Input",
    sublabel: "Validating fields",
    icon: <UserIcon />,
  },
  {
    id: "census",
    label: "Census API",
    sublabel: "Pulling demographics",
    icon: <DatabaseIcon />,
  },
  {
    id: "datause",
    label: "DataUSA",
    sublabel: "Economic indicators",
    icon: <BarChartIcon />,
  },
  {
    id: "news",
    label: "NewsAPI",
    sublabel: "Recent city headlines",
    icon: <NewspaperIcon />,
  },
  {
    id: "claude",
    label: "Claude AI",
    sublabel: "Scoring + email draft",
    icon: <BrainIcon />,
  },
  {
    id: "score",
    label: "Score Ready",
    sublabel: "Enrichment complete",
    icon: <StarIcon />,
  },
];

const STEP_MS = 720;

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function EnrichPipeline({ state, onComplete }: EnrichPipelineProps) {
  const [activeNode, setActiveNode] = useState(-1);
  const [completedNodes, setCompletedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (state === "idle") {
      setActiveNode(-1);
      setCompletedNodes(new Set());
      return;
    }
    if (state !== "loading") return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    NODES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveNode(i);
          if (i > 0) setCompletedNodes((prev) => new Set([...prev, i - 1]));
        }, i * STEP_MS)
      );
    });

    // Mark all complete + fire callback
    timers.push(
      setTimeout(() => {
        setActiveNode(-1);
        setCompletedNodes(new Set(NODES.map((_, i) => i)));
        onComplete();
      }, NODES.length * STEP_MS + 350)
    );

    return () => timers.forEach(clearTimeout);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-[320px] flex-shrink-0 border-r border-[#EDE9FE] flex flex-col items-center justify-center px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8 w-full">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5">
          Step 2
        </p>
        <h2
          className="text-base font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
        >
          Enrichment Pipeline
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-xs mt-1",
              state === "loading"
                ? "text-[#7C3AED]"
                : state === "complete"
                ? "text-emerald-400"
                : "text-neutral-600"
            )}
          >
            {state === "idle" && "Awaiting lead input"}
            {state === "loading" && "Processing data sources…"}
            {state === "complete" && "All sources enriched ✓"}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Node list */}
      <div className="w-full flex flex-col">
        {NODES.map((node, i) => {
          const isActive = activeNode === i;
          const isDone = completedNodes.has(i);
          const isLineActive =
            i < NODES.length - 1 && (isDone || state === "complete");

          return (
            <React.Fragment key={node.id}>
              <PipelineNode
                node={node}
                index={i}
                isActive={isActive}
                isDone={isDone}
              />
              {i < NODES.length - 1 && (
                <PipelineConnector isActive={isLineActive} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Node ───────────────────────────────────────────────────────────────────── */

function PipelineNode({
  node,
  index,
  isActive,
  isDone,
}: {
  node: (typeof NODES)[number];
  index: number;
  isActive: boolean;
  isDone: boolean;
}) {
  const circleColor = isDone
    ? "border-emerald-500 bg-emerald-500/10"
    : isActive
    ? "border-[#7C3AED] bg-[#7C3AED]/10"
    : "border-[#EDE9FE] bg-[#F5F3FF]";

  const iconColor = isDone
    ? "text-emerald-400"
    : isActive
    ? "text-[#7C3AED]"
    : "text-[#D1D5DB]";

  const labelColor = isDone
    ? "text-emerald-500"
    : isActive
    ? "text-[#1A1A2E]"
    : "text-[#9CA3AF]";

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      {/* Circle */}
      <div className="relative flex-shrink-0">
        {/* Pulse ring */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border border-[#7C3AED]/50"
            animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}

        <motion.div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
            circleColor
          )}
          animate={
            isActive
              ? { boxShadow: "0 0 18px rgba(124,58,237,0.25)" }
              : { boxShadow: "none" }
          }
        >
          <span className={cn("w-[15px] h-[15px] transition-colors duration-300", iconColor)}>
            {isDone ? <CheckIcon /> : node.icon}
          </span>
        </motion.div>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-semibold transition-colors duration-300", labelColor)}>
          {node.label}
        </p>
        <p className="text-[10px] text-[#9CA3AF] leading-tight">{node.sublabel}</p>
      </div>

      {/* Done tick */}
      <AnimatePresence>
        {isDone && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-emerald-400 text-xs flex-shrink-0 font-bold"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Connector line ─────────────────────────────────────────────────────────── */

function PipelineConnector({ isActive }: { isActive: boolean }) {
  return (
    // pl-[17px] = circle center offset (w-9/2 = 18px) minus line half-width (1px) = 17px
    <div className="pl-[17px] py-0.5">
      <div className="relative w-0.5 h-7 bg-[#EDE9FE] rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full rounded-full"
          style={{ background: "linear-gradient(to bottom, #7C3AED, #6D28D9)" }}
          initial={{ height: "0%" }}
          animate={isActive ? { height: "100%" } : { height: "0%" }}
          transition={{ duration: 0.38, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

/* ─── SVG Icons ──────────────────────────────────────────────────────────────── */

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v4c0 1.7 4 3 9 3s9-1.3 9-3V5" />
      <path d="M3 9v4c0 1.7 4 3 9 3s9-1.3 9-3V9" />
      <path d="M3 13v4c0 1.7 4 3 9 3s9-1.3 9-3v-4" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function NewspaperIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.16Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.16Z" />
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
