import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { leads } from "@/db/schema";
import { eq } from "drizzle-orm";

export const leadsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
        source: z.string().default("manual"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const [lead] = await db
        .insert(leads)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          source: input.source,
          notes: input.notes,
          status: "new_lead",
          userId: session.user.id,
        })
        .returning();

      return lead;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.id))
        .where(eq(leads.userId, session.user.id));

      return lead;
    }),

  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { limit, cursor } = input;

      const items = await db
        .select()
        .from(leads)
        .where(eq(leads.userId, session.user.id))
        .limit(limit + 1)
        .offset(cursor ? 1 : 0);

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
