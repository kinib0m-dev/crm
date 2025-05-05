"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LeadDashboardLoader } from "./LeadDashboardLoader";
import { LeadDashboardView } from "./LeadDashboardView";

export function LeadDashboardLayout() {
  return (
    <Suspense fallback={<LeadDashboardLoader />}>
      <ErrorBoundary fallback={<LeadDashboardError />}>
        <LeadDashboardSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function LeadDashboardSuspense() {
  // Fetch leads and stats
  const { data: leadsData, isLoading: isLeadsLoading } =
    trpc.lead.list.useQuery({ page: 1, limit: 10 });

  const { data: statsData, isLoading: isStatsLoading } =
    trpc.lead.getStats.useQuery();

  if (isLeadsLoading || isStatsLoading) {
    return <LeadDashboardLoader />;
  }

  return (
    <LeadDashboardView
      leads={leadsData?.leads || []}
      pagination={
        leadsData?.pagination || {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
        }
      }
      stats={statsData?.stats || null}
    />
  );
}

function LeadDashboardError() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">Error loading leads</h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading your leads. Please try again later.
        </p>
      </div>
    </div>
  );
}
