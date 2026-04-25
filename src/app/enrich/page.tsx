"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EnrichForm, type LeadFormData } from "@/components/enrich/EnrichForm";
import { EnrichOutput, type ApiResult } from "@/components/enrich/EnrichOutput";
import { EnrichModal, EnrichToast } from "@/components/enrich/EnrichModal";
import { CsvBatchPanel, type CsvLead } from "@/components/enrich/CsvBatchPanel";

/* ── Error toast ──────────────────────────────────────────────────────────── */

function ErrorToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm"
    >
      <span className="text-red-400 text-sm font-medium">
        Enrichment failed — check the server and try again.
      </span>
      <button onClick={onDismiss} className="text-red-400/60 hover:text-red-400 text-xs ml-1">
        ✕
      </button>
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function EnrichPage() {
  const router = useRouter();

  /* ── Single-lead state ── */
  const [enrichState, setEnrichState] = useState<"idle" | "loading" | "complete">("idle");
  const [submittedData, setSubmittedData] = useState<LeadFormData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showError, setShowError] = useState(false);
  const [enrichmentResult, setEnrichmentResult] = useState<ApiResult | null>(null);

  const apiDone = useRef(false);
  const modalDone = useRef(false);
  const pendingResult = useRef<ApiResult | null>(null);

  /* ── CSV batch state ── */
  const [csvLeads, setCsvLeads] = useState<CsvLead[]>([]);
  const [csvMode, setCsvMode] = useState<"idle" | "preview" | "enriching" | "done">("idle");
  const [csvProgress, setCsvProgress] = useState(0);
  const [csvSuccessCount, setCsvSuccessCount] = useState(0);
  const [csvFailCount, setCsvFailCount] = useState(0);

  /* ── Single-lead handlers ── */

  const tryFinalize = useCallback(() => {
    if (!apiDone.current || !modalDone.current) return;
    setShowModal(false);
    setTimeout(() => {
      setEnrichmentResult(pendingResult.current);
      setEnrichState("complete");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }, 300);
  }, []);

  async function handleSubmit(data: LeadFormData) {
    setSubmittedData(data);
    setEnrichState("loading");
    setShowModal(true);
    setShowError(false);
    apiDone.current = false;
    modalDone.current = false;
    pendingResult.current = null;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          company: data.companyName,
          city: data.city,
          state: data.state,
          email: data.email,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result: ApiResult = await res.json();
      pendingResult.current = result;
      apiDone.current = true;
      tryFinalize();
    } catch (err) {
      console.error("Enrich error:", err);
      setShowModal(false);
      setEnrichState("idle");
      setShowError(true);
    }
  }

  function handleModalComplete() {
    modalDone.current = true;
    tryFinalize();
  }

  /* ── CSV handlers ── */

  function handleCsvFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.toLowerCase().trim().replace(/\s+/g, "_"),
      complete: (results) => {
        const leads: CsvLead[] = results.data
          .map((row) => ({
            name: (row.name ?? row.full_name ?? "").trim(),
            email: (row.email ?? "").trim(),
            company: (row.company ?? row.company_name ?? "").trim(),
            address: (row.address ?? row.property_address ?? "").trim(),
            city: (row.city ?? "").trim(),
            state: (row.state ?? "").trim().toUpperCase(),
          }))
          .filter((l) => l.name && l.city && l.state);

        if (leads.length === 0) {
          setShowError(true);
          return;
        }

        setCsvLeads(leads);
        setCsvMode("preview");
      },
      error: () => setShowError(true),
    });
  }

  async function handleCsvEnrich() {
    setCsvMode("enriching");
    setCsvProgress(0);
    let successes = 0;
    let failures = 0;

    for (let i = 0; i < csvLeads.length; i++) {
      setCsvProgress(i + 1);
      const lead = csvLeads[i];

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enrich`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: lead.name,
            email: lead.email,
            company: lead.company,
            address: lead.address,
            city: lead.city,
            state: lead.state,
          }),
        });
        if (res.ok) {
          successes++;
        } else {
          failures++;
          console.warn(`Failed to enrich ${lead.name}: HTTP ${res.status}`);
        }
      } catch (err) {
        failures++;
        console.error(`Error enriching ${lead.name}:`, err);
      }

      // 1-second gap between calls (except after the last one)
      if (i < csvLeads.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setCsvSuccessCount(successes);
    setCsvFailCount(failures);
    setCsvMode("done");
  }

  function handleCsvCancel() {
    setCsvLeads([]);
    setCsvMode("idle");
    setCsvProgress(0);
  }

  /* ── Render ── */

  const isCsvActive = csvMode !== "idle";

  return (
    <>
      <DashboardHeader title="Enrich Lead" subtitle="New Lead" />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <EnrichForm
          onSubmit={handleSubmit}
          onCsvFile={handleCsvFile}
          disabled={enrichState === "loading" || csvMode === "enriching"}
        />

        {isCsvActive ? (
          <CsvBatchPanel
            leads={csvLeads}
            mode={csvMode as "preview" | "enriching" | "done"}
            progress={csvProgress}
            successCount={csvSuccessCount}
            failCount={csvFailCount}
            onEnrichAll={handleCsvEnrich}
            onCancel={handleCsvCancel}
            onViewDashboard={() => router.push("/dashboard")}
          />
        ) : (
          <EnrichOutput
            state={enrichState}
            leadData={submittedData}
            enrichmentResult={enrichmentResult}
          />
        )}
      </div>

      <EnrichModal isOpen={showModal} onComplete={handleModalComplete} />

      <AnimatePresence>
        {showToast && <EnrichToast />}
      </AnimatePresence>

      <AnimatePresence>
        {showError && <ErrorToast onDismiss={() => setShowError(false)} />}
      </AnimatePresence>
    </>
  );
}
