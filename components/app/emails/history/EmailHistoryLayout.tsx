"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmailHistoryLoader } from "./EmailHistoryLoader";
import { EmailHistoryView } from "./EmailHistoryView";

export function EmailHistoryLayout() {
  return (
    <Suspense fallback={<EmailHistoryLoader />}>
      <ErrorBoundary fallback={<EmailHistoryError />}>
        <EmailHistoryLayoutSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function EmailHistoryLayoutSuspense() {
  // Fetch email history
  const { data, isLoading } = trpc.emailTemplate.getEmailHistory.useQuery({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return <EmailHistoryLoader />;
  }

  return (
    <EmailHistoryView
      history={data?.history || []}
      pagination={
        data?.pagination || {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
        }
      }
    />
  );
}

function EmailHistoryError() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading email history
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading your email history. Please try again
          later.
        </p>
      </div>
    </div>
  );
}
