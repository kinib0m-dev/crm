import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationMembersSchema,
  updateMembersSchema,
} from "../validation/orgs-schema";
import { db } from "@/db";
import { organizationMembers, organizations, users } from "@/db/schema";
import { generateUniqueSlug } from "../utils/org-utils";
import { and, eq, desc, asc } from "drizzle-orm";

export const orgsRouter = createTRPCRouter({
  // Create a new organization
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

  // Get organization members
  getMembers: protectedProcedure
    .input(getOrganizationMembersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if user is member of this organization
        const membership = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, input.organizationId),
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

        // Get all members with user details
        const orderBy = input.sortDirection === "desc" ? desc : asc;
        let orderColumn;

        switch (input.sortBy) {
          case "name":
            orderColumn = users.name;
            break;
          case "email":
            orderColumn = users.email;
            break;
          case "joinedAt":
            orderColumn = organizationMembers.joinedAt;
            break;
          case "role":
            orderColumn = organizationMembers.role;
            break;
          default:
            orderColumn = users.name;
        }

        const members = await db
          .select({
            id: organizationMembers.id,
            userId: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
            role: organizationMembers.role,
            joinedAt: organizationMembers.joinedAt,
          })
          .from(organizationMembers)
          .innerJoin(users, eq(organizationMembers.userId, users.id))
          .where(eq(organizationMembers.organizationId, input.organizationId))
          .orderBy(orderBy(orderColumn));

        return {
          success: true,
          members,
          userRole: membership[0].role,
        };
      } catch (error) {
        console.error("Error fetching organization members:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organization members",
        });
      }
    }),

  // Update member role (admin only)
  updateMemberRole: protectedProcedure
    .input(updateMembersSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Get the member's organization ID
        const memberInfo = await db
          .select({
            organizationId: organizationMembers.organizationId,
            currentRole: organizationMembers.role,
            targetUserId: organizationMembers.userId,
          })
          .from(organizationMembers)
          .where(eq(organizationMembers.id, input.membersId))
          .limit(1);

        if (memberInfo.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Member not found",
          });
        }

        const { organizationId, targetUserId } = memberInfo[0];

        // Check if current user is admin of this organization
        const adminMembership = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userId, userId),
              eq(organizationMembers.role, "admin")
            )
          )
          .limit(1);

        if (adminMembership.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can update member roles",
          });
        }

        // Prevent self-demotion if user is the only admin
        if (targetUserId === userId && input.role === "member") {
          const adminCount = await db
            .select()
            .from(organizationMembers)
            .where(
              and(
                eq(organizationMembers.organizationId, organizationId),
                eq(organizationMembers.role, "admin")
              )
            );

          if (adminCount.length === 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot demote the last admin of the organization",
            });
          }
        }

        // Update member role
        const [updatedMember] = await db
          .update(organizationMembers)
          .set({
            role: input.role,
            updatedAt: new Date(),
          })
          .where(eq(organizationMembers.id, input.membersId))
          .returning();

        return {
          success: true,
          member: updatedMember,
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
  removeMember: protectedProcedure
    .input(z.object({ membersId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Get the member's organization ID and user ID
        const memberInfo = await db
          .select({
            organizationId: organizationMembers.organizationId,
            targetUserId: organizationMembers.userId,
            role: organizationMembers.role,
          })
          .from(organizationMembers)
          .where(eq(organizationMembers.id, input.membersId))
          .limit(1);

        if (memberInfo.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Member not found",
          });
        }

        const { organizationId, role } = memberInfo[0];

        // Check if current user is admin of this organization
        const adminMembership = await db
          .select()
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, organizationId),
              eq(organizationMembers.userId, userId),
              eq(organizationMembers.role, "admin")
            )
          )
          .limit(1);

        if (adminMembership.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can remove members",
          });
        }

        // Prevent removing the last admin
        if (role === "admin") {
          const adminCount = await db
            .select()
            .from(organizationMembers)
            .where(
              and(
                eq(organizationMembers.organizationId, organizationId),
                eq(organizationMembers.role, "admin")
              )
            );

          if (adminCount.length === 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot remove the last admin of the organization",
            });
          }
        }

        // Remove member
        await db
          .delete(organizationMembers)
          .where(eq(organizationMembers.id, input.membersId));

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

  // Get user's role in organization
  getUserRole: protectedProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        const membership = await db
          .select({
            role: organizationMembers.role,
            joinedAt: organizationMembers.joinedAt,
          })
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organizationId, input.organizationId),
              eq(organizationMembers.userId, userId)
            )
          )
          .limit(1);

        if (membership.length === 0) {
          return {
            success: false,
            role: null,
            isMember: false,
          };
        }

        return {
          success: true,
          role: membership[0].role,
          joinedAt: membership[0].joinedAt,
          isMember: true,
        };
      } catch (error) {
        console.error("Error fetching user role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user role",
        });
      }
    }),
});
