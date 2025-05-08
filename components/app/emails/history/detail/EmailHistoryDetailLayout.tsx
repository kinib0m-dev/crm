"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { EmailHistoryDetailsLoader } from "./EmailHistoryDetailLoader";
import { EmailHistoryNotFound } from "./EmailHistoryNotFound";
import { EmailHistoryDetailsView } from "./EmailHistoryDetailView";

export function EmailHistoryDetailsLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<EmailHistoryDetailsLoader />}>
      <ErrorBoundary fallback={<EmailHistoryDetailsError id={id} />}>
        <EmailHistoryDetailsLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function EmailHistoryDetailsLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } =
    trpc.emailTemplate.getEmailHistoryDetails.useQuery(
      { id },
      {
        retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
        retryDelay: 500,
      }
    );

  if (isLoading) {
    return <EmailHistoryDetailsLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <EmailHistoryNotFound />;
    }
    return <EmailHistoryDetailsError id={id} />;
  }

  if (!isLoading && !data?.history) {
    return <EmailHistoryNotFound />;
  }

  if (data?.history && data?.recipients) {
    return (
      <EmailHistoryDetailsView
        history={data.history}
        recipients={data.recipients}
      />
    );
  }

  return null;
}

function EmailHistoryDetailsError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading email history details
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading the email history with ID: {id}. Please
          try again later.
        </p>
        <Button variant="outline" asChild>
          <Link href="/emails/history">Return to Email History</Link>
        </Button>
      </div>
    </div>
  );
}
