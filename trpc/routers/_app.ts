import { authRouter } from "@/lib/auth/server/procedures";
import { createTRPCRouter } from "../init";
import { orgsRouter } from "@/lib/orgs/server/procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  // Organizations
  orgs: orgsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
