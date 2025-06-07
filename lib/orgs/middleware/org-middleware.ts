// lib/orgs/middleware/org-middleware.ts
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Context } from "@/trpc/init";

/**
 * Validates that a user has access to a specific organization
 * @param userId - The user's ID
 * @param organizationId - The organization ID to validate
 * @returns The user's membership record if valid
 * @throws TRPCError if user doesn't have access
 */
export async function validateOrganizationAccess(
  userId: string,
  organizationId: string
) {
  try {
    // Check if user is a member of the organization
    const membership = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        organizationId: organizationMembers.organizationId,
        role: organizationMembers.role,
        joinedAt: organizationMembers.joinedAt,
      })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have access to this organization",
      });
    }

    return membership[0];
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Error validating organization access:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to validate organization access",
    });
  }
}

/**
 * Validates that a user has admin privileges for a specific organization
 * @param userId - The user's ID
 * @param organizationId - The organization ID to validate
 * @returns The user's membership record if they are an admin
 * @throws TRPCError if user doesn't have admin access
 */
export async function validateOrganizationAdmin(
  userId: string,
  organizationId: string
) {
  try {
    const membership = await validateOrganizationAccess(userId, organizationId);

    if (membership.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You must be an admin to perform this action",
      });
    }

    return membership;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Error validating organization admin:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to validate organization admin privileges",
    });
  }
}

/**
 * Gets organization details with membership validation
 * @param userId - The user's ID
 * @param organizationId - The organization ID
 * @returns Organization details with user role
 * @throws TRPCError if organization not found or user has no access
 */
export async function getOrganizationWithAccess(
  userId: string,
  organizationId: string
) {
  try {
    // Validate access first
    const membership = await validateOrganizationAccess(userId, organizationId);

    // Get organization details
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }

    return {
      organization,
      userRole: membership.role,
      membership,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Error getting organization with access:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get organization details",
    });
  }
}

/**
 * Extended context type that includes organization information
 */
export interface OrganizationContext extends Context {
  userId: string; // Make required since we validate it exists
  organizationId: string;
  userRole: "admin" | "member";
  membership: {
    id: string;
    userId: string;
    organizationId: string;
    role: "admin" | "member";
    joinedAt: Date;
  };
}

/**
 * Creates an organization-scoped context for tRPC procedures
 * This function should be used in procedures that require organization context
 */
export function createOrganizationContext(
  ctx: Context,
  organizationId: string
): Promise<OrganizationContext> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }

      const { userRole, membership } = await getOrganizationWithAccess(
        ctx.userId,
        organizationId
      );

      resolve({
        ...ctx,
        userId: ctx.userId, // Explicitly ensure userId is string
        organizationId,
        userRole,
        membership,
      } as OrganizationContext);
    } catch (error) {
      reject(error);
    }
  });
}
