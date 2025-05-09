import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import {
  leads,
  leadTasks,
  emailHistory,
  botConversations,
  botMessages,
  carStock,
} from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export const dashboardRouter = createTRPCRouter({
  // Get dashboard summary data
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.userId as string;

      // Get lead counts by status
      const leadCounts = await db
        .select({
          status: leads.status,
          count: count(),
        })
        .from(leads)
        .where(and(eq(leads.userId, userId), eq(leads.isDeleted, false)))
        .groupBy(leads.status);

      // Get upcoming tasks
      const upcomingTasks = await db
        .select({
          id: leadTasks.id,
          title: leadTasks.title,
          priority: leadTasks.priority,
          status: leadTasks.status,
          dueDate: leadTasks.dueDate,
          leadId: leadTasks.leadId,
          leadName: leads.name,
        })
        .from(leadTasks)
        .innerJoin(leads, eq(leadTasks.leadId, leads.id))
        .where(
          and(
            eq(leadTasks.userId, userId),
            sql`${leadTasks.status} != 'completed'`,
            sql`${leadTasks.status} != 'cancelled'`
          )
        )
        .orderBy(
          sql`CASE 
            WHEN ${leadTasks.priority} = 'urgent' THEN 1 
            WHEN ${leadTasks.priority} = 'high' THEN 2
            WHEN ${leadTasks.priority} = 'medium' THEN 3
            WHEN ${leadTasks.priority} = 'low' THEN 4
            ELSE 5 
          END`,
          sql`CASE 
            WHEN ${leadTasks.dueDate} IS NULL THEN 1 
            ELSE 0 
          END`,
          leadTasks.dueDate
        )
        .limit(5);

      // Get recent email campaigns
      const recentEmails = await db
        .select({
          id: emailHistory.id,
          subject: emailHistory.subject,
          sentAt: emailHistory.sentAt,
          sentCount: emailHistory.sentCount,
        })
        .from(emailHistory)
        .where(eq(emailHistory.userId, userId))
        .orderBy(desc(emailHistory.sentAt))
        .limit(5);

      // Get recent bot conversations
      const recentConversations = await db
        .select({
          id: botConversations.id,
          name: botConversations.name,
          updatedAt: botConversations.updatedAt,
          messageCount: sql<number>`(
            SELECT COUNT(*) FROM ${botMessages} 
            WHERE ${botMessages.conversationId} = ${botConversations.id}
          )`,
        })
        .from(botConversations)
        .where(eq(botConversations.userId, userId))
        .orderBy(desc(botConversations.updatedAt))
        .limit(5);

      // Get inventory count
      const carStockCount = await db
        .select({ count: count() })
        .from(carStock)
        .where(and(eq(carStock.userId, userId), eq(carStock.isDeleted, false)));

      return {
        success: true,
        leadCounts,
        upcomingTasks,
        recentEmails,
        recentConversations,
        carStockCount: carStockCount[0]?.count || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      throw new Error("Failed to fetch dashboard summary");
    }
  }),
});
