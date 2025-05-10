import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { leads, leadTags, tags } from "@/db/schema";
import {
  createLeadSchema,
  filterLeadSchema,
  updateLeadSchema,
} from "@/lib/validation/lead-schema";
import { TRPCError } from "@trpc/server";
import { eq, and, or, ilike, sql, asc, desc, inArray } from "drizzle-orm";

export const leadRouter = createTRPCRouter({
  // Create a new lead
  create: protectedProcedure
    .input(createLeadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if a lead with the same email already exists (if email provided)
        if (input.email) {
          const existingByEmail = await db
            .select()
            .from(leads)
            .where(
              and(
                eq(leads.userId, userId),
                eq(leads.email, input.email),
                eq(leads.isDeleted, false)
              )
            )
            .limit(1);

          if (existingByEmail.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this email already exists",
            });
          }
        }

        // Check if a lead with the same phone already exists (if phone provided)
        if (input.phone) {
          const existingByPhone = await db
            .select()
            .from(leads)
            .where(
              and(
                eq(leads.userId, userId),
                eq(leads.phone, input.phone),
                eq(leads.isDeleted, false)
              )
            )
            .limit(1);

          if (existingByPhone.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this phone number already exists",
            });
          }
        }

        const leadData = {
          userId,
          ...input,
        };

        // Insert the new lead
        const [newLead] = await db.insert(leads).values(leadData).returning();

        return {
          success: true,
          lead: newLead,
        };
      } catch (error) {
        console.error("Error creating lead:", error);

        // Check for unique constraint violation
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle database-level unique violations
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          if (error.message.toLowerCase().includes("email")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this email already exists",
            });
          } else if (error.message.toLowerCase().includes("phone")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this phone number already exists",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create lead",
        });
      }
    }),

  // Get a lead by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Get the lead - using select instead of query builder
        const leadResult = await db
          .select()
          .from(leads)
          .where(and(eq(leads.id, input.id), eq(leads.userId, userId)))
          .limit(1);

        const lead = leadResult[0];

        if (!lead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          });
        }

        // Get associated tags in a separate query
        const leadTagsList = await db
          .select({
            tag: tags,
          })
          .from(leadTags)
          .innerJoin(tags, eq(leadTags.tagId, tags.id))
          .where(eq(leadTags.leadId, lead.id));

        // Format the lead with tags
        const leadWithTags = {
          ...lead,
          tags: leadTagsList.map((item) => item.tag),
        };

        return {
          success: true,
          lead: leadWithTags,
        };
      } catch (error) {
        console.error("Error fetching lead:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch lead",
        });
      }
    }),

  // Update a lead
  update: protectedProcedure
    .input(updateLeadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;
        const { id, ...updateData } = input;

        // Check if lead exists and belongs to the user
        const existingLeadResult = await db
          .select()
          .from(leads)
          .where(and(eq(leads.id, id), eq(leads.userId, userId)))
          .limit(1);

        const existingLead = existingLeadResult[0];

        if (!existingLead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          });
        }

        // Check for duplicate email (if changing email)
        if (updateData.email && updateData.email !== existingLead.email) {
          const existingByEmail = await db
            .select()
            .from(leads)
            .where(
              and(
                eq(leads.userId, userId),
                eq(leads.email, updateData.email),
                eq(leads.isDeleted, false),
                sql`${leads.id} != ${id}` // Exclude current lead
              )
            )
            .limit(1);

          if (existingByEmail.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this email already exists",
            });
          }
        }

        // Check for duplicate phone (if changing phone)
        if (updateData.phone && updateData.phone !== existingLead.phone) {
          const existingByPhone = await db
            .select()
            .from(leads)
            .where(
              and(
                eq(leads.userId, userId),
                eq(leads.phone, updateData.phone),
                eq(leads.isDeleted, false),
                sql`${leads.id} != ${id}` // Exclude current lead
              )
            )
            .limit(1);

          if (existingByPhone.length > 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this phone number already exists",
            });
          }
        }

        // Update the lead
        const [updatedLead] = await db
          .update(leads)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(and(eq(leads.id, id), eq(leads.userId, userId)))
          .returning();

        return {
          success: true,
          lead: updatedLead,
        };
      } catch (error) {
        console.error("Error updating lead:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle database-level unique violations
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          if (error.message.toLowerCase().includes("email")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this email already exists",
            });
          } else if (error.message.toLowerCase().includes("phone")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A lead with this phone number already exists",
            });
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update lead",
        });
      }
    }),

  // Delete a lead (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if lead exists and belongs to the user
        const existingLeadResult = await db
          .select()
          .from(leads)
          .where(and(eq(leads.id, input.id), eq(leads.userId, userId)))
          .limit(1);

        const existingLead = existingLeadResult[0];

        if (!existingLead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          });
        }

        // Soft delete by setting isDeleted to true
        await db
          .update(leads)
          .set({
            isDeleted: true,
            updatedAt: new Date(),
          })
          .where(and(eq(leads.id, input.id), eq(leads.userId, userId)));

        return {
          success: true,
          message: "Lead deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting lead:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete lead",
        });
      }
    }),

  // List leads with filters, pagination, and sorting
  list: protectedProcedure
    .input(filterLeadSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;
        const {
          status,
          priority,
          sourceId,
          search,
          timeframe,
          page,
          limit,
          sortBy,
          sortDirection,
        } = input;

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Start building the base query conditions
        let queryConditions = and(
          eq(leads.userId, userId),
          eq(leads.isDeleted, false)
        );

        // Apply additional filters by adding to the conditions
        if (status) {
          queryConditions = and(queryConditions, eq(leads.status, status));
        }

        if (priority) {
          queryConditions = and(queryConditions, eq(leads.priority, priority));
        }

        if (sourceId) {
          queryConditions = and(queryConditions, eq(leads.sourceId, sourceId));
        }

        if (timeframe) {
          queryConditions = and(
            queryConditions,
            eq(leads.expectedPurchaseTimeframe, timeframe)
          );
        }

        // Apply search filter if provided
        if (search) {
          const likePattern = `%${search}%`;
          queryConditions = and(
            queryConditions,
            or(
              ilike(leads.name, likePattern),
              ilike(leads.email || "", likePattern),
              ilike(leads.phone || "", likePattern)
            )
          );
        }

        // Count total matching leads (for pagination)
        const totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(leads)
          .where(queryConditions);

        const totalCount = Number(totalCountResult[0]?.count) || 0;

        // Apply sorting
        let orderByClause;
        switch (sortBy) {
          case "name":
            orderByClause =
              sortDirection === "asc" ? asc(leads.name) : desc(leads.name);
            break;
          case "status":
            orderByClause =
              sortDirection === "asc" ? asc(leads.status) : desc(leads.status);
            break;
          case "priority":
            orderByClause =
              sortDirection === "asc"
                ? asc(leads.priority)
                : desc(leads.priority);
            break;
          case "createdAt":
          default:
            orderByClause =
              sortDirection === "asc"
                ? asc(leads.createdAt)
                : desc(leads.createdAt);
            break;
        }

        // Get the leads with sorting and pagination
        const leadsList = await db
          .select()
          .from(leads)
          .where(queryConditions)
          .orderBy(orderByClause)
          .limit(limit)
          .offset(offset);

        // Fetch tags for all retrieved leads if there are any leads
        const leadIds = leadsList.map((lead) => lead.id);

        // Type for tags
        type TagType = {
          id: string;
          name: string;
          color: string;
          description: string | null;
          createdAt: Date;
        };

        // Map to store tags by lead ID
        const leadTagsMap: Record<string, TagType[]> = {};

        if (leadIds.length > 0) {
          // Instead of manually creating placeholders, use a better approach with Drizzle
          const leadTagsJoin = await db
            .select({
              leadId: leadTags.leadId,
              tagId: tags.id,
              tagName: tags.name,
              tagColor: tags.color,
              tagDescription: tags.description,
              tagCreatedAt: tags.createdAt,
            })
            .from(leadTags)
            .innerJoin(tags, eq(leadTags.tagId, tags.id))
            .where(inArray(leadTags.leadId, leadIds));

          // Parse the results and organize by lead ID
          for (const row of leadTagsJoin) {
            const leadId = row.leadId;

            if (!leadTagsMap[leadId]) {
              leadTagsMap[leadId] = [];
            }

            // Create a tag object from the row
            const tag: TagType = {
              id: row.tagId,
              name: row.tagName,
              color: row.tagColor as string,
              description: row.tagDescription,
              createdAt: row.tagCreatedAt,
            };

            leadTagsMap[leadId].push(tag);
          }
        }

        // Combine leads with their tags
        const leadsWithTags = leadsList.map((lead) => ({
          ...lead,
          tags: leadTagsMap[lead.id] || [],
        }));

        return {
          success: true,
          leads: leadsWithTags,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        };
      } catch (error) {
        console.error("Error listing leads:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list leads",
        });
      }
    }),
});
