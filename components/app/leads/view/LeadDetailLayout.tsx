"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import LeadDetailLoader from "./LeadDetailLoader";
import { LeadDetailView } from "./LeadDetailView";

export function LeadDetailLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<LeadDetailLoader />}>
      <ErrorBoundary fallback={<LeadDetailError />}>
        <LeadDetailSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function LeadDetailSuspense({ id }: { id: string }) {
  // Fetch leads and stats
  const { data: leadsData, isLoading: isLeadsLoading } =
    trpc.lead.getById.useQuery({ id: id });

  if (isLeadsLoading) {
    return <LeadDetailLoader />;
  }

  return <LeadDetailView lead={leadsData?.lead} />;
}

function LeadDetailError() {
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
