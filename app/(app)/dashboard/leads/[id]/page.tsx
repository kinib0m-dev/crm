import { LeadDetailLayout } from "@/components/app/leads/view/LeadDetailLayout";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Prefetch the lead data
  const { id } = await params;
  await trpc.lead.getById.prefetch({ id });

  return (
    <HydrateClient>
      <LeadDetailLayout id={id} />
    </HydrateClient>
  );
}
