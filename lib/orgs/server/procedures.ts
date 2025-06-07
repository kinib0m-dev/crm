import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validation/orgs-schema";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { generateUniqueSlug } from "../utils/server-org-utils";
import { and, eq, desc } from "drizzle-orm";

export const orgsRouter = createTRPCRouter({
  // Create a new organization
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;
        const slug = await generateUniqueSlug(input.name);

        // Add fallback for color to ensure it's never undefined
        const color = input.color || "blue";

        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: input.name,
            description: input.description,
            slug: slug,
            color: color, // Use the fallback
          })
          .returning();

        // Add creator as admin
        await db.insert(organizationMembers).values({
          userId,
          organizationId: newOrg.id,
          role: "admin",
        });

        return {
          success: true,
          organization: newOrg,
        };
      } catch (error) {
        console.error("Error creating organization:", error);

        // Log more details about the error
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }
    }),

  // Get all organizations for current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.userId as string;

      const userOrganizations = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          description: organizations.description,
          color: organizations.color,
          role: organizationMembers.role,
          joinedAt: organizationMembers.joinedAt,
          createdAt: organizations.createdAt,
        })
        .from(organizations)
        .innerJoin(
          organizationMembers,
          eq(organizations.id, organizationMembers.organizationId)
        )
        .where(eq(organizationMembers.userId, userId))
        .orderBy(desc(organizationMembers.joinedAt));

      return {
        success: true,
        organizations: userOrganizations,
      };
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organizations",
      });
    }
  }),

  // Get organization by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if user is member of this organization
        const membership = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, input.id),
              eq(organizationMembers.userId, userId)
            )
          )
          .limit(1);

        if (membership.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this organization",
          });
        }

        const [org] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.id))
          .limit(1);

        if (!org) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        return {
          success: true,
          organization: org,
          userRole: membership[0].role,
        };
      } catch (error) {
        console.error("Error fetching organization:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organization",
        });
      }
    }),

  // Update organization (admin only)
  update: protectedProcedure
    .input(updateOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if user is admin of this organization
        const membership = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, input.id),
              eq(organizationMembers.userId, userId),
              eq(organizationMembers.role, "admin")
            )
          )
          .limit(1);

        if (membership.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update organizations",
          });
        }

        // Generate new slug if name changed
        const currentOrg = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.id))
          .limit(1);

        if (currentOrg.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        let slug = currentOrg[0].slug;
        if (currentOrg[0].name !== input.name) {
          slug = await generateUniqueSlug(input.name, input.id);
        }

        const [updatedOrg] = await db
          .update(organizations)
          .set({
            name: input.name,
            description: input.description,
            color: input.color,
            slug: slug,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, input.id))
          .returning();

        return {
          success: true,
          organization: updatedOrg,
        };
      } catch (error) {
        console.error("Error updating organization:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update organization",
        });
      }
    }),

  // Delete organization (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if user is admin of this organization
        const membership = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, input.id),
              eq(organizationMembers.userId, userId),
              eq(organizationMembers.role, "admin")
            )
          )
          .limit(1);

        if (membership.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can delete organizations",
          });
        }

        // Delete organization (members will be cascade deleted)
        await db.delete(organizations).where(eq(organizations.id, input.id));

        return {
          success: true,
          message: "Organization deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting organization:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
        });
      }
    }),
});
