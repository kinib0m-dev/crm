import { SettingsLayout } from "@/components/app/settings/SettingsLayout";
import { HydrateClient } from "@/trpc/server";

export default function SettingsPage() {
  return (
    <HydrateClient>
      <SettingsLayout />
    </HydrateClient>
  );
}
