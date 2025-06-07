import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  organizationProcedure,
  organizationAdminProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "../validation/orgs-schema";
import { db } from "@/db";
import { organizationMembers, organizations, users } from "@/db/schema";
import { generateUniqueSlug } from "../utils/server-org-utils";
import { and, eq, desc, count } from "drizzle-orm";

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

  // Get organization by ID with organization context
  getById: organizationProcedure.query(async ({ ctx }) => {
    try {
      const { organizationId, userRole, membership } = ctx;

      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
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
        userRole,
        membership,
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
  update: organizationAdminProcedure
    .input(updateOrganizationSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { organizationId } = ctx;

        // Get current organization for slug generation
        const currentOrg = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .limit(1);

        if (currentOrg.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        // Generate new slug if name changed
        let slug = currentOrg[0].slug;
        if (currentOrg[0].name !== input.name) {
          slug = await generateUniqueSlug(input.name, organizationId);
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
          .where(eq(organizations.id, organizationId))
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
  delete: organizationAdminProcedure.mutation(async ({ ctx }) => {
    try {
      const { organizationId } = ctx;

      // Delete organization (members will be cascade deleted)
      await db
        .delete(organizations)
        .where(eq(organizations.id, organizationId));

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

  // Get organization members (organization-scoped)
  getMembers: organizationProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { organizationId } = ctx;

        // Get members with user details
        const members = await db
          .select({
            id: organizationMembers.id,
            userId: organizationMembers.userId,
            role: organizationMembers.role,
            joinedAt: organizationMembers.joinedAt,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
          })
          .from(organizationMembers)
          .innerJoin(users, eq(organizationMembers.userId, users.id))
          .where(eq(organizationMembers.organizationId, organizationId))
          .orderBy(desc(organizationMembers.joinedAt))
          .limit(input.limit)
          .offset(input.offset);

        // Get total count
        const [{ total }] = await db
          .select({ total: count() })
          .from(organizationMembers)
          .where(eq(organizationMembers.organizationId, organizationId));

        return {
          success: true,
          members,
          pagination: {
            total,
            limit: input.limit,
            offset: input.offset,
            hasMore: input.offset + input.limit < total,
          },
        };
      } catch (error) {
        console.error("Error fetching organization members:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organization members",
        });
      }
    }),

  // Update member role (admin only)
  updateMemberRole: organizationAdminProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        userId: z.string().uuid(),
        role: z.enum(["admin", "member"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { organizationId } = ctx;

        // Check if target user is a member of the organization
        const targetMember = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userId, input.userId)
            )
          )
          .limit(1);

        if (targetMember.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User is not a member of this organization",
          });
        }

        // Update the member's role
        const [updatedMember] = await db
          .update(organizationMembers)
          .set({
            role: input.role,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userId, input.userId)
            )
          )
          .returning();

        return {
          success: true,
          member: updatedMember,
          message: `Member role updated to ${input.role}`,
        };
      } catch (error) {
        console.error("Error updating member role:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update member role",
        });
      }
    }),

  // Remove member from organization (admin only)
  removeMember: organizationAdminProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        userId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { organizationId, userId: currentUserId } = ctx;

        // Prevent self-removal
        if (input.userId === currentUserId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot remove yourself from the organization",
          });
        }

        // Check if target user is a member of the organization
        const targetMember = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userId, input.userId)
            )
          )
          .limit(1);

        if (targetMember.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User is not a member of this organization",
          });
        }

        // Remove the member
        await db
          .delete(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userId, input.userId)
            )
          );

        return {
          success: true,
          message: "Member removed successfully",
        };
      } catch (error) {
        console.error("Error removing member:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove member",
        });
      }
    }),

  // Leave organization (member can leave, but not if they're the only admin)
  leaveOrganization: organizationProcedure.mutation(async ({ ctx }) => {
    try {
      const { organizationId, userId, userRole } = ctx;

      // If user is admin, check if they're the only admin
      if (userRole === "admin") {
        const adminCount = await db
          .select({ count: count() })
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.role, "admin")
            )
          );

        if (adminCount[0].count <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "You cannot leave as the only admin. Transfer admin rights to another member first.",
          });
        }
      }

      // Remove the user from the organization
      await db
        .delete(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, userId)
          )
        );

      return {
        success: true,
        message: "You have left the organization",
      };
    } catch (error) {
      console.error("Error leaving organization:", error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to leave organization",
      });
    }
  }),
});
