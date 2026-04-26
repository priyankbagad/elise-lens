"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MagicButton } from "@/components/ui/MagicButton";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

export interface LeadFormData {
  fullName: string;
  email: string;
  companyName: string;
  propertyAddress: string;
  city: string;
  state: string;
}

interface EnrichFormProps {
  onSubmit: (data: LeadFormData) => void;
  onCsvFile?: (file: File) => void;
  disabled?: boolean;
}

/* ─── Default values (demo-ready) ───────────────────────────────────────────── */

const DEFAULTS: LeadFormData = {
  fullName: "Sarah Chen",
  email: "sarah.chen@westviewprops.com",
  companyName: "Westview Properties",
  propertyAddress: "123 W 6th Street",
  city: "Austin",
  state: "TX",
};

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function EnrichForm({ onSubmit, onCsvFile, disabled = false }: EnrichFormProps) {
  const [form, setForm] = useState<LeadFormData>(DEFAULTS);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null | undefined) {
    if (file && file.name.endsWith(".csv")) onCsvFile?.(file);
  }

  function set(field: keyof LeadFormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Name is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Invalid email format";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(form);
  }

  return (
    <div className="w-[288px] flex-shrink-0 border-r border-[#EDE9FE] flex flex-col overflow-y-auto">
      <div className="p-5 flex flex-col h-full">
        {/* Section header */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-0.5">
            Step 1
          </p>
          <h2
            className="text-base font-semibold text-[#1A1A2E]"
            style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
          >
            Lead Details
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Fill in the lead info to start enrichment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
          <Field
            label="Full Name"
            placeholder="Sarah Chen"
            value={form.fullName}
            onChange={set("fullName")}
            disabled={disabled}
            error={errors.fullName}
            autoFocus
          />
          <Field
            label="Email Address"
            placeholder="sarah@company.com"
            type="email"
            value={form.email}
            onChange={set("email")}
            disabled={disabled}
            error={errors.email}
          />
          <Field
            label="Company Name"
            placeholder="Westview Properties"
            value={form.companyName}
            onChange={set("companyName")}
            disabled={disabled}
          />
          <Field
            label="Property Address"
            placeholder="123 W 6th Street"
            value={form.propertyAddress}
            onChange={set("propertyAddress")}
            disabled={disabled}
          />
          <div className="grid grid-cols-[1fr_72px] gap-2">
            <Field
              label="City"
              placeholder="Austin"
              value={form.city}
              onChange={set("city")}
              disabled={disabled}
              error={errors.city}
            />
            <Field
              label="State"
              placeholder="TX"
              value={form.state}
              onChange={set("state")}
              disabled={disabled}
              maxLength={2}
              className="uppercase"
              error={errors.state}
            />
          </div>

          {/* CTA */}
          <MagicButton
            type="submit"
            disabled={disabled}
            className="w-full mt-1 rounded-xl"
          >
            {disabled ? "Enriching…" : "Enrich Lead →"}
          </MagicButton>
        </form>

        {/* CSV drop zone */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-px bg-[#EDE9FE]" />
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-widest">
              or bulk import
            </span>
            <div className="flex-1 h-px bg-[#EDE9FE]" />
          </div>

          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200",
              isDragging
                ? "border-[#7C3AED]/50 bg-[#7C3AED]/[0.04]"
                : "border-[#EDE9FE] hover:border-[#7C3AED]/30 hover:bg-[#F5F3FF]",
              disabled && "pointer-events-none opacity-50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <AnimatePresence mode="wait">
              {isDragging ? (
                <motion.div
                  key="drag"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <UploadIcon className="mx-auto text-[#7C3AED] mb-2" />
                  <p className="text-xs font-semibold text-[#7C3AED]">Drop to upload</p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <UploadIcon className="mx-auto text-[#9CA3AF] mb-2" />
                  <p className="text-xs font-medium text-neutral-400">
                    Drop a CSV file here
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">
                    to enrich multiple leads at once
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-2.5 font-mono">
                    name · email · city · state
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────────────────────────────── */

function Field({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  type = "text",
  maxLength,
  className,
  autoFocus,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 outline-none",
          "bg-[#F5F3FF] border border-[#EDE9FE] text-[#1A1A2E] placeholder:text-[#9CA3AF]",
          "focus:border-[#7C3AED]/40 focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/10",
          disabled && "opacity-40 cursor-not-allowed",
          error && "border-red-400 focus:border-red-400 focus:ring-red-100",
          className
        )}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ─── Micro icons ────────────────────────────────────────────────────────────── */

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

