"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { CarStockLoader } from "./CarStockLoader";
import { CarStockView } from "./CarStockView";

export function CarStockLayout() {
  return (
    <Suspense fallback={<CarStockLoader />}>
      <ErrorBoundary fallback={<CarStockError />}>
        <CarStockLayoutSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function CarStockLayoutSuspense() {
  // Fetch car stock items
  const { data, isLoading } = trpc.carStock.list.useQuery({
    page: 1,
    limit: 10,
  });

  if (isLoading) {
    return <CarStockLoader />;
  }

  return (
    <CarStockView
      carStockItems={data?.carStock || []}
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

function CarStockError() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-destructive/20 bg-destructive/5">
        <h3 className="text-lg font-semibold mb-2">Error loading car stock</h3>
        <p className="text-muted-foreground mb-4">
          There was a problem loading your car stock items. Please try again
          later.
        </p>
      </div>
    </div>
  );
}
