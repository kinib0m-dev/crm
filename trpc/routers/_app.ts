import { leadRouter } from "@/lib/leads/server/procedures";
import { createTRPCRouter } from "../init";
import { authRouter } from "@/lib/auth/server/procedures";
import { botDocumentRouter } from "@/lib/bot/server/procedures";
import { carStockRouter } from "@/lib/stock/server/procedures";
import { botChatRouter } from "@/lib/playground/server/procedures";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  lead: leadRouter,
  botDocument: botDocumentRouter,
  carStock: carStockRouter,
  botChat: botChatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
