"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { EmailTemplateEditLoader } from "./EmailTemplateEditLoader";
import { EmailTemplateNotFound } from "../detail/EmailTemplateNotFound";
import { EmailTemplateEditView } from "./EmailTemplateEditView";

export function EmailTemplateEditLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<EmailTemplateEditLoader />}>
      <ErrorBoundary fallback={<EmailTemplateEditError id={id} />}>
        <EmailTemplateEditLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function EmailTemplateEditLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.emailTemplate.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <EmailTemplateEditLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <EmailTemplateNotFound />;
    }
    return <EmailTemplateEditError id={id} />;
  }

  if (!isLoading && !data?.template) {
    return <EmailTemplateNotFound />;
  }

  if (data?.template) {
    return <EmailTemplateEditView template={data.template} />;
  }

  return null;
}

function EmailTemplateEditError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading template data
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading the template with ID: {id}. Please try
          again later.
        </p>
        <Button variant="outline" asChild>
          <Link href="/emails">Return to Email Templates</Link>
        </Button>
      </div>
    </div>
  );
}
