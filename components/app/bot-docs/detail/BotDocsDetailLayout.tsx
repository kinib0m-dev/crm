"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { BotDocumentDetailLoader } from "./BotDocsDetailLoader";
import { BotDocumentNotFound } from "./BotDocsNotFound";
import { BotDocumentDetailView } from "./BotDocsDetailView";

export function BotDocumentDetailLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<BotDocumentDetailLoader />}>
      <ErrorBoundary fallback={<BotDocumentDetailError id={id} />}>
        <BotDocumentDetailLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function BotDocumentDetailLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.botDocument.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <BotDocumentDetailLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <BotDocumentNotFound />;
    }
    return <BotDocumentDetailError id={id} />;
  }

  if (!isLoading && !data?.document) {
    return <BotDocumentNotFound />;
  }

  if (data?.document) {
    return <BotDocumentDetailView document={data.document} />;
  }

  return null;
}

function BotDocumentDetailError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading document details
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading the document with ID: {id}. Please try
          again later.
        </p>
        <Button variant="outline" asChild>
          <Link href="/bot-docs">Return to Documents List</Link>
        </Button>
      </div>
    </div>
  );
}
