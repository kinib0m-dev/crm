import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { createOrganizationSchema } from "../validation/orgs-schema";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { generateUniqueSlug } from "../utils/org-utils";
import { and, eq } from "drizzle-orm";

export const orgsRouter = createTRPCRouter({
  // Create a new bot document
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        const slug = await generateUniqueSlug(input.name);

        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: input.name,
            description: input.description,
            slug: slug,
            color: input.color,
          })
          .returning();

        await db.insert(organizationMembers).values({
          userId,
          organizationId: newOrg.id,
          role: "admin",
        });

        return {
          sucess: true,
        };
      } catch (error) {
        console.error("Error creating organization:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create an organization",
        });
      }
    }),

  // Get a bot document by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        const [org] = await db
          .select()
          .from(organizations)
          .where(and(eq(organizations.id, input.id)))
          .limit(1);

        return {
          success: true,
          org: org,
        };
      } catch (error) {
        console.error("Error fetching organisation:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organisation",
        });
      }
    }),
});
