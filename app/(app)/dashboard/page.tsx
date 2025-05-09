import { DashboardLayout } from "@/components/app/dashboard/DashboardLayout";
import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CRM",
  description: "Overview of your CRM data and activities",
};

export default async function DashboardPage() {
  // Pre-fetch dashboard data
  await trpc.dashboard.getSummary.prefetch();

  return (
    <HydrateClient>
      <DashboardLayout />
    </HydrateClient>
  );
}
