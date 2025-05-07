"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { BotDocumentEditLoader } from "./BotDocsEditLoader";
import { BotDocumentNotFound } from "../detail/BotDocsNotFound";
import { BotDocumentEditView } from "./BotDocsEditView";

export function BotDocumentEditLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<BotDocumentEditLoader />}>
      <ErrorBoundary fallback={<BotDocumentEditError id={id} />}>
        <BotDocumentEditLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function BotDocumentEditLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.botDocument.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <BotDocumentEditLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <BotDocumentNotFound />;
    }
    return <BotDocumentEditError id={id} />;
  }

  if (!isLoading && !data?.document) {
    return <BotDocumentNotFound />;
  }

  if (data?.document) {
    return <BotDocumentEditView document={data.document} />;
  }

  return null;
}

function BotDocumentEditError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading document data
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
