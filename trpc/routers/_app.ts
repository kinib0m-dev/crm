import { leadRouter } from "@/lib/leads/server/procedures";
import { createTRPCRouter } from "../init";
import { authRouter } from "@/lib/auth/server/procedures";
import { botDocumentRouter } from "@/lib/bot/server/procedures";
import { carStockRouter } from "@/lib/stock/server/procedures";
import { botChatRouter } from "@/lib/playground/server/procedures";
import { leadNoteRouter } from "@/lib/leads/server/notes-procedures";
import { leadTaskRouter } from "@/lib/leads/server/task-procedures";
import { emailTemplateRouter } from "@/lib/emails/server/procedures";
import { dashboardRouter } from "@/lib/dashboard/server/procedures";
import { leadTagsRouter } from "@/lib/leads/server/tags-procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  lead: leadRouter,
  leadNote: leadNoteRouter,
  leadTask: leadTaskRouter,
  leadTags: leadTagsRouter,
  botDocument: botDocumentRouter,
  carStock: carStockRouter,
  botChat: botChatRouter,
  emailTemplate: emailTemplateRouter,
  dashboard: dashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
