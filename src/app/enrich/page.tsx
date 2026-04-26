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
import { fetchWithAuth } from "@/lib/apiClient";

/* ── Error toast ──────────────────────────────────────────────────────────── */

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm max-w-md"
    >
      <span className="text-red-400 text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="text-red-400/60 hover:text-red-400 text-xs ml-1 flex-shrink-0">
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
  const [errorMessage, setErrorMessage] = useState("Enrichment failed — check the server and try again.");
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
  const [csvLeadStatuses, setCsvLeadStatuses] = useState<Array<"enriched" | "updated" | "failed" | "pending">>([]);

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
      const result = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/enrich`, {
        method: "POST",
        body: JSON.stringify({
          name: data.fullName,
          company: data.companyName,
          city: data.city,
          state: data.state,
          email: data.email,
        }),
      });
      if (!result) return; // session expired, already redirecting
      pendingResult.current = result as ApiResult;
      apiDone.current = true;
      tryFinalize();
    } catch (err: any) {
      console.error("Enrich error:", err);
      setShowModal(false);
      setEnrichState("idle");
      setErrorMessage(err?.message ?? "Enrichment failed — check the server and try again.");
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
        // Column validation
        const fields = (results.meta.fields ?? []) as string[];
        const missingCols: string[] = [];
        if (!fields.includes("name") && !fields.includes("full_name")) missingCols.push("name");
        if (!fields.includes("city")) missingCols.push("city");
        if (!fields.includes("state")) missingCols.push("state");

        if (missingCols.length > 0) {
          setErrorMessage(`Missing required columns: ${missingCols.join(", ")}. Expected: name, email, company, address, city, state`);
          setShowError(true);
          return;
        }

        if (results.data.length === 0) {
          setErrorMessage("No valid leads found in CSV");
          setShowError(true);
          return;
        }

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
          setErrorMessage("No valid leads found in CSV. Each row needs at least name, city, and state.");
          setShowError(true);
          return;
        }

        setCsvLeads(leads);
        setCsvMode("preview");
      },
      error: () => {
        setErrorMessage("Failed to parse CSV — check the file format and try again.");
        setShowError(true);
      },
    });
  }

  async function handleCsvEnrich() {
    setCsvMode("enriching");
    setCsvProgress(0);
    let successes = 0;
    let failures = 0;

    const statuses: Array<"enriched" | "updated" | "failed" | "pending"> =
      new Array(csvLeads.length).fill("pending");
    setCsvLeadStatuses([...statuses]);

    for (let i = 0; i < csvLeads.length; i++) {
      setCsvProgress(i + 1);
      const lead = csvLeads[i];

      try {
        const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/enrich`, {
          method: "POST",
          body: JSON.stringify({
            name: lead.name,
            email: lead.email,
            company: lead.company,
            address: lead.address,
            city: lead.city,
            state: lead.state,
          }),
        });
        if (!data) {
          // session expired, already redirecting
          statuses[i] = "failed";
          failures++;
        } else {
          successes++;
          statuses[i] = data.isUpdate ? "updated" : "enriched";
        }
      } catch (err) {
        failures++;
        statuses[i] = "failed";
        console.error(`Error enriching ${lead.name}:`, err);
      }

      setCsvLeadStatuses([...statuses]);

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
            leadStatuses={csvLeadStatuses}
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
        {showError && <ErrorToast message={errorMessage} onDismiss={() => setShowError(false)} />}
      </AnimatePresence>
    </>
  );
}
