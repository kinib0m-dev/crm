import { LeadDashboardLayout } from "@/components/app/leads/LeadDashboardLayout";
import { HydrateClient, trpc } from "@/trpc/server";

export default function DashboardPage() {
  void trpc.lead.list.prefetch({ page: 1, limit: 10 });
  void trpc.lead.getStats.prefetch();

  return (
    <HydrateClient>
      <LeadDashboardLayout />
    </HydrateClient>
  );
}
