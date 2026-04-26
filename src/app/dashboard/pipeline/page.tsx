"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/lib/supabase";

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Lead {
  id: string;
  name: string;
  company: string;
  city: string;
  state: string;
  score: number;
  tier: "Hot" | "Warm" | "Cool";
  pipeline_stage: string;
}

type StageId = "new" | "contacted" | "responded" | "qualified" | "closed";

interface PipelineState {
  new: Lead[];
  contacted: Lead[];
  responded: Lead[];
  qualified: Lead[];
  closed: Lead[];
}

const EMPTY_PIPELINE: PipelineState = {
  new: [],
  contacted: [],
  responded: [],
  qualified: [],
  closed: [],
};

/* ── Constants ─────────────────────────────────────────────────────────────── */

const STAGES: { id: StageId; label: string; color: string; description: string }[] = [
  { id: "new", label: "New", color: "#7C3AED", description: "Freshly enriched leads" },
  { id: "contacted", label: "Contacted", color: "#3B82F6", description: "Outreach email sent" },
  { id: "responded", label: "Responded", color: "#F59E0B", description: "Lead replied back" },
  { id: "qualified", label: "Qualified", color: "#10B981", description: "Confirmed ICP fit" },
  { id: "closed", label: "Closed", color: "#EF4444", description: "Won or lost" },
];

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineState>(EMPTY_PIPELINE);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    localStorage.removeItem("enrichedLeads");
    localStorage.removeItem("pipelineState");
    localStorage.clear();

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || '';
      setUserId(uid);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: { 'x-user-id': uid },
      })
        .then((r) => r.json())
        .then((data) => {
          const leads: Lead[] = data.leads || [];
          const grouped: PipelineState = {
            new: leads.filter((l) => l.pipeline_stage === "new" || !l.pipeline_stage),
            contacted: leads.filter((l) => l.pipeline_stage === "contacted"),
            responded: leads.filter((l) => l.pipeline_stage === "responded"),
            qualified: leads.filter((l) => l.pipeline_stage === "qualified"),
            closed: leads.filter((l) => l.pipeline_stage === "closed"),
          };
          setPipeline(grouped);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    })();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const sourceList = [...pipeline[source.droppableId as StageId]];
    const destList = source.droppableId === destination.droppableId
      ? sourceList
      : [...(pipeline[destination.droppableId as StageId] || [])];

    const [removed] = sourceList.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceList.splice(destination.index, 0, removed);
      setPipeline((prev) => ({ ...prev, [source.droppableId]: sourceList }));
    } else {
      destList.splice(destination.index, 0, removed);
      setPipeline((prev) => ({ ...prev, [source.droppableId]: sourceList, [destination.droppableId]: destList }));

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${draggableId}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: destination.droppableId }),
        });
        console.log(`Lead ${draggableId} moved to ${destination.droppableId}`);
      } catch (err) {
        console.error("Failed to save pipeline stage:", err);
      }
    }
  };

  const totalLeads = STAGES.reduce((sum, s) => sum + (pipeline[s.id]?.length ?? 0), 0);

  if (loading) {
    return (
      <>
        <DashboardHeader title="Lead Pipeline" subtitle="Pipeline" />
        <main className="flex-1 overflow-hidden flex flex-col p-6 gap-4" style={{ background: "#F5F3FF" }}>
          <div className="flex gap-4 mt-4">
            {STAGES.map((s) => (
              <div key={s.id} className="flex-shrink-0 w-72 h-64 rounded-xl bg-white/60 animate-pulse" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Lead Pipeline" subtitle="Pipeline" />
      <main className="flex-1 overflow-hidden flex flex-col p-6 gap-4" style={{ background: "#F5F3FF" }}>

        {/* Page title + stats + CTA */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-xl font-bold text-[#1A1A2E]"
              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
            >
              Lead Pipeline
            </h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              Drag leads across stages to track your sales progress
            </p>
          </div>
          <Link
            href="/enrich"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-[0_4px_15px_rgba(124,58,237,0.35)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.5)] transition-all flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#6D28D9,#7C3AED)" }}
          >
            <PlusIcon />
            Enrich New Lead
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center gap-1.5 bg-white border border-[#EDE9FE] rounded-full px-3 py-1.5 text-xs font-medium text-[#374151]"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
              {stage.label}
              <span className="ml-1 font-bold" style={{ color: stage.color }}>
                {pipeline[stage.id]?.length ?? 0}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 bg-white border border-[#EDE9FE] rounded-full px-3 py-1.5 text-xs font-medium text-[#374151] ml-auto">
            Total: <span className="font-bold text-[#7C3AED] ml-1">{totalLeads}</span>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full pb-4" style={{ minWidth: "max-content" }}>
              {STAGES.map((stage) => (
                <Droppable droppableId={stage.id} key={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-72 rounded-xl p-4 transition-colors flex flex-col"
                      style={{
                        background: snapshot.isDraggingOver ? "#EDE9FE" : "#EEE9FF",
                        border: snapshot.isDraggingOver
                          ? "2px solid #7C3AED"
                          : "2px solid transparent",
                        height: "100%",
                        maxHeight: "calc(100vh - 240px)",
                      }}
                    >
                      {/* Column header */}
                      <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: stage.color }} />
                          <div>
                            <h3
                              className="font-semibold text-[#1A1A2E] text-sm leading-tight"
                              style={{ fontFamily: "var(--font-syne,'Syne',sans-serif)" }}
                            >
                              {stage.label}
                            </h3>
                            <p className="text-[#9CA3AF] text-[10px] leading-tight">{stage.description}</p>
                          </div>
                        </div>
                        <span className="bg-white text-[#6B7280] text-xs px-2 py-1 rounded-full border border-[#EDE9FE] font-medium">
                          {pipeline[stage.id]?.length ?? 0}
                        </span>
                      </div>

                      {/* Cards scroll area */}
                      <div className="flex-1 overflow-y-auto pr-0.5">
                        {pipeline[stage.id]?.map((lead, index) => (
                          <Draggable
                            key={lead.id.toString()}
                            draggableId={lead.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white rounded-xl p-4 mb-3 border border-[#EDE9FE] cursor-grab active:cursor-grabbing transition-all"
                                style={{
                                  ...provided.draggableProps.style,
                                  boxShadow: snapshot.isDragging
                                    ? "0 8px 30px rgba(124,58,237,0.25), 0 2px 8px rgba(0,0,0,0.1)"
                                    : "0 1px 3px rgba(124,58,237,0.08)",
                                  transform: snapshot.isDragging
                                    ? `${provided.draggableProps.style?.transform ?? ""} rotate(2deg) scale(1.03)`
                                    : provided.draggableProps.style?.transform,
                                  borderColor: snapshot.isDragging ? "#7C3AED" : "#EDE9FE",
                                }}
                              >
                                {/* Avatar + name */}
                                <div className="flex items-center gap-3 mb-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg,#6D28D9,#7C3AED)" }}
                                  >
                                    {lead.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-[#1A1A2E] text-sm truncate">{lead.name}</p>
                                    <p className="text-[#6B7280] text-xs truncate">{lead.company}</p>
                                  </div>
                                </div>

                                {/* City */}
                                <p className="text-xs text-[#6B7280] mb-3">
                                  📍 {lead.city}, {lead.state}
                                </p>

                                {/* Score + tier */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#7C3AED]">{lead.score}/100</span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      lead.tier === "Hot"
                                        ? "bg-red-50 text-red-500"
                                        : lead.tier === "Warm"
                                        ? "bg-amber-50 text-amber-500"
                                        : "bg-blue-50 text-blue-500"
                                    }`}
                                  >
                                    {lead.tier === "Hot" ? "🔥" : lead.tier === "Warm" ? "✅" : "🧊"}{" "}
                                    {lead.tier}
                                  </span>
                                </div>

                                {/* View report */}
                                <Link
                                  href={`/lead/${lead.id}`}
                                  className="mt-3 text-xs text-[#7C3AED] hover:underline block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View full report →
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Empty state */}
                        {(pipeline[stage.id]?.length ?? 0) === 0 && (
                          <div className="border-2 border-dashed border-[#DDD6FE] rounded-xl p-6 text-center text-[#9CA3AF] text-sm">
                            Drop leads here
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </main>
    </>
  );
}

/* ── Icon ──────────────────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
