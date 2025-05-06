"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { LeadsNotFound } from "../detail/LeadsNotFound";
import { LeadsEditLoader } from "./LeadsEditLoader";
import { LeadsEditView } from "./LeadsEditView";

export function LeadsEditLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<LeadsEditLoader />}>
      <ErrorBoundary fallback={<LeadsEditError id={id} />}>
        <LeadsEditLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function LeadsEditLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.lead.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <LeadsEditLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <LeadsNotFound />;
    }
    return <LeadsEditError id={id} />;
  }

  if (!isLoading && !data?.lead) {
    return <LeadsNotFound />;
  }

  if (data?.lead) {
    return <LeadsEditView lead={data.lead} />;
  }

  return null;
}

function LeadsEditError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">Error loading lead data</h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading the lead with ID: {id}. Please try again
          later.
        </p>
        <Button variant="outline" asChild>
          <Link href="/leads">Return to Leads List</Link>
        </Button>
      </div>
    </div>
  );
}
