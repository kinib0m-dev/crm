"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmailsLoader } from "./EmailsLoader";
import { EmailsView } from "./EmailsView";

export function EmailsLayout() {
  return (
    <Suspense fallback={<EmailsLoader />}>
      <ErrorBoundary fallback={<EmailsError />}>
        <EmailsLayoutSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function EmailsLayoutSuspense() {
  // Fetch email templates
  const { data, isLoading } = trpc.emailTemplate.list.useQuery({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return <EmailsLoader />;
  }

  return (
    <EmailsView
      templates={data?.templates || []}
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

function EmailsError() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading email templates
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading your email templates. Please try again
          later.
        </p>
      </div>
    </div>
  );
}
