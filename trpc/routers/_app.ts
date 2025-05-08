import { leadRouter } from "@/lib/leads/server/procedures";
import { createTRPCRouter } from "../init";
import { authRouter } from "@/lib/auth/server/procedures";
import { botDocumentRouter } from "@/lib/bot/server/procedures";
import { carStockRouter } from "@/lib/stock/server/procedures";
import { botChatRouter } from "@/lib/playground/server/procedures";
import { leadNoteRouter } from "@/lib/leads/server/notes-procedures";
import { leadTaskRouter } from "@/lib/leads/server/task-procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  lead: leadRouter,
  leadNote: leadNoteRouter,
  leadTask: leadTaskRouter,
  botDocument: botDocumentRouter,
  carStock: carStockRouter,
  botChat: botChatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
