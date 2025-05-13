import { BotPlaygroundLayout } from "@/components/app/playground/BotPlaygroundLayout";
import { HydrateClient } from "@/trpc/server";
import { trpc } from "@/trpc/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bot Playground",
  description: "Test your bot and simulate customer interactions",
};

export default async function PlaygroundPage() {
  // Pre-fetch initial conversations
  await trpc.botChat.listConversations.prefetch();

  return (
    <HydrateClient>
      <BotPlaygroundLayout />
    </HydrateClient>
  );
}
