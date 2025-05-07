import { BotDocumentDetailLayout } from "@/components/app/bot-docs/detail/BotDocsDetailLayout";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function BotDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void trpc.botDocument.getById.prefetch({ id });
  return (
    <HydrateClient>
      <BotDocumentDetailLayout id={id} />
    </HydrateClient>
  );
}
