"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { DashboardLoader } from "./DashboardLoader";
import { DashboardView } from "./DashboardView";

export function DashboardLayout() {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <ErrorBoundary fallback={<DashboardError />}>
        <DashboardLayoutSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

function DashboardLayoutSuspense() {
  return <DashboardView />;
}

function DashboardError() {
  return (
    <div className="container mx-auto p-6">
      <Card className="p-6 border-destructive/50 bg-destructive/5">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <h3 className="text-lg font-semibold mb-2">
            Error loading dashboard
          </h3>
          <p className="text-muted-foreground mb-4">
            There was a problem loading your dashboard data. Please try again
            later.
          </p>
        </div>
      </Card>
    </div>
  );
}
