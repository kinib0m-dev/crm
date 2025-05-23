// This hook is to fetch the user in client components

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const session = useSession();

  return session.data?.user;
}
