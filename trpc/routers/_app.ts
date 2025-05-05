import { creditsRouter } from "@/lib/auth/server/credits";
import { createTRPCRouter } from "../init";
import { jobsRouter } from "@/lib/jobs/server/procedures";
import { interviewsRouter } from "@/lib/interviews/server/pocedures";
import { analyticsRouter } from "@/lib/analytics/server/procedures";
import { dashboardRouter } from "@/lib/dashboard/server/procedures";
import { resourcesRouter } from "@/lib/resources/server/procedures";
import { authRouter } from "@/lib/auth/server/procedures";
import { billingRouter } from "@/lib/billing/server/procedures";

export const appRouter = createTRPCRouter({
  credits: creditsRouter,
  jobs: jobsRouter,
  interviews: interviewsRouter,
  analytics: analyticsRouter,
  dashboard: dashboardRouter,
  resources: resourcesRouter,
  auth: authRouter,
  billing: billingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
