"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { CarStockDetailLoader } from "./CarStockDetailLoader";
import { CarStockNotFound } from "./CarStockNotFound";
import { CarStockDetailView } from "./CarStockDetailView";

export function CarStockDetailLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<CarStockDetailLoader />}>
      <ErrorBoundary fallback={<CarStockDetailError id={id} />}>
        <CarStockDetailLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function CarStockDetailLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.carStock.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <CarStockDetailLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <CarStockNotFound />;
    }
    return <CarStockDetailError id={id} />;
  }

  if (!isLoading && !data?.carStock) {
    return <CarStockNotFound />;
  }

  if (data?.carStock) {
    return <CarStockDetailView carStock={data.carStock} />;
  }

  return null;
}

function CarStockDetailError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">
          Error loading car details
        </h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading the car with ID: {id}. Please try again
          later.
        </p>
        <Button variant="outline" asChild>
          <Link href="/car-stock">Return to Car Stock</Link>
        </Button>
      </div>
    </div>
  );
}
