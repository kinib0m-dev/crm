"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BotDocsLoader } from "./BotDocsLoader";
import { BotDocsView } from "./BotDocsView";

export function BotDocsLayout() {
  return (
    <Suspense fallback={<BotDocsLoader />}>
      <ErrorBoundary fallback={<BotDocsError />}>
        <BotDocsLayoutSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function BotDocsLayoutSuspense() {
  // Fetch documents
  const { data: docsData, isLoading: isDocsLoading } =
    trpc.botDocument.list.useQuery({ page: 1, limit: 10 });

  if (isDocsLoading) {
    return <BotDocsLoader />;
  }

  return (
    <BotDocsView
      documents={docsData?.documents || []}
      pagination={
        docsData?.pagination || {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
        }
      }
    />
  );
}

function BotDocsError() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">Error loading documents</h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading your bot documents. Please try again
          later.
        </p>
      </div>
    </div>
  );
}
