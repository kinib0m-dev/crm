"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { CarStockNotFound } from "../detail/CarStockNotFound";
import { CarStockEditLoader } from "./CarStockEditLoader";
import { CarStockEditView } from "./CarStockEditView";

export function CarStockEditLayout({ id }: { id: string }) {
  return (
    <Suspense fallback={<CarStockEditLoader />}>
      <ErrorBoundary fallback={<CarStockEditError id={id} />}>
        <CarStockEditLayoutSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  );
}

function CarStockEditLayoutSuspense({ id }: { id: string }) {
  const { data, error, isLoading } = trpc.carStock.getById.useQuery(
    { id },
    {
      retry: 1, // Only retry once to avoid unnecessary retries on genuine 404s
      retryDelay: 500,
    }
  );

  if (isLoading) {
    return <CarStockEditLoader />;
  }

  if (error) {
    if (error.data?.code === "NOT_FOUND") {
      return <CarStockNotFound />;
    }
    return <CarStockEditError id={id} />;
  }

  if (!isLoading && !data?.carStock) {
    return <CarStockNotFound />;
  }

  if (data?.carStock) {
    return <CarStockEditView carStock={data.carStock} />;
  }

  return null;
}

function CarStockEditError({ id }: { id: string }) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">Error loading car data</h3>
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
