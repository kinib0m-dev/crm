"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LeadsLoader } from "./LeadsLoader";
import { LeadsView } from "./LeadsView";

export function LeadsLayout() {
  return (
    <Suspense fallback={<LeadsLoader />}>
      <ErrorBoundary fallback={<LeadsError />}>
        <LeadsLayoutSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function LeadsLayoutSuspense() {
  // Fetch leads and stats
  const { data: leadsData, isLoading: isLeadsLoading } =
    trpc.lead.list.useQuery({ page: 1, limit: 10 });

  if (isLeadsLoading) {
    return <LeadsLoader />;
  }

  return (
    <LeadsView
      leads={leadsData?.leads || []}
      pagination={
        leadsData?.pagination || {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
        }
      }
    />
  );
}

function LeadsError() {
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
