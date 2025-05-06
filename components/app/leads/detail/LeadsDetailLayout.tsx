"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { LeadsNotFound } from "./LeadsNotFound";
import { LeadsDetailView } from "./LeadsDetailView";
import { LeadsDetailLoader } from "./LeadsDetailLoader";

export function LeadsDetailLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<LeadsDetailLoader />}>
      <ErrorBoundary fallback={<LeadsDetailError id={id} />}>
        <LeadsDetailLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function LeadsDetailLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.lead.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <LeadsDetailLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <LeadsNotFound />;
    }
    return <LeadsDetailError id={id} />;
  }

  if (!isLoading && !data?.lead) {
    return <LeadsNotFound />;
  }

  if (data?.lead) {
    return <LeadsDetailView lead={data.lead} />;
  }

  return null;
}

function LeadsDetailError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading lead details
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading the lead with ID: {id}. Please try again
          later.
        </p>
        <Button variant="outline" asChild>
          <Link href="/leads">Return to leads List</Link>
        </Button>
      </div>
    </div>
  );
}
