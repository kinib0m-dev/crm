import { ProfileLayout } from "@/components/app/profile/ProfileLayout";
import { HydrateClient } from "@/trpc/server";

export default function ProfilePage() {
  return (
    <HydrateClient>
      <ProfileLayout />
    </HydrateClient>
  );
}
