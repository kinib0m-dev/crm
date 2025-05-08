import { DuplicateEmailTemplateLayout } from "@/components/app/emails/duplicate/DuplicateEmailTemplateLayout";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function DuplicateEmailTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await trpc.emailTemplate.getById.prefetch({ id });
  } catch (error) {
    console.error("Error prefetching template data:", error);
  }

  return (
    <HydrateClient>
      <DuplicateEmailTemplateLayout id={id} />
    </HydrateClient>
  );
}
