"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BentoStats } from "@/components/dashboard/BentoStats";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Dashboard" subtitle="Overview" />

      <main className="flex-1 overflow-y-auto p-8 space-y-5">
        <BentoStats />
        <RecentLeadsTable />
      </main>
    </>
  );
}
