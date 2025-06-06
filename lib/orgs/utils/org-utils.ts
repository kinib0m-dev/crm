import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq, ne } from "drizzle-orm";

/**
 * Generates a URL-friendly slug from organization name
 */
export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[\s\-_\.]+/g, "-")
      // Remove any characters that aren't alphanumeric or hyphens
      .replace(/[^a-z0-9\-]/g, "")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "") ||
    // Ensure it's not empty
    "organization"
  );
}

/**
 * Validates if a slug is available for an organization
 */
export async function isSlugAvailable(
  slug: string,
  excludeOrgId?: string
): Promise<boolean> {
  try {
    const conditions = excludeOrgId
      ? [eq(organizations.slug, slug), ne(organizations.id, excludeOrgId)]
      : [eq(organizations.slug, slug)];

    const existingOrg = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        conditions.length > 1
          ? // If we have multiple conditions, we need to use AND
            eq(organizations.slug, slug)
          : eq(organizations.slug, slug)
      )
      .limit(1);

    // If excludeOrgId is provided, we need a more complex query
    if (excludeOrgId) {
      const existingOrgWithExclusion = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1);

      const foundOrg = existingOrgWithExclusion[0];
      return !foundOrg || foundOrg.id === excludeOrgId;
    }

    return existingOrg.length === 0;
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return false;
  }
}

/**
 * Generates a unique slug for an organization
 */
export async function generateUniqueSlug(
  name: string,
  excludeOrgId?: string
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Keep trying until we find an available slug
  while (!(await isSlugAvailable(slug, excludeOrgId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Prevent infinite loops
    if (counter > 1000) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

/**
 * Permission utility functions
 */
export function canInviteMembers(userRole: "admin" | "member"): boolean {
  return userRole === "admin";
}

export function canManageMembers(userRole: "admin" | "member"): boolean {
  return userRole === "admin";
}

export function canUpdateOrganization(userRole: "admin" | "member"): boolean {
  return userRole === "admin";
}

export function canDeleteOrganization(userRole: "admin" | "member"): boolean {
  return userRole === "admin";
}

/**
 * Color utility functions
 */
export const organizationColorMap = {
  blue: {
    name: "Blue",
    hex: "#3B82F6",
    rgb: "59, 130, 246",
    tailwind: "blue-500",
  },
  green: {
    name: "Green",
    hex: "#10B981",
    rgb: "16, 185, 129",
    tailwind: "emerald-500",
  },
  purple: {
    name: "Purple",
    hex: "#8B5CF6",
    rgb: "139, 92, 246",
    tailwind: "violet-500",
  },
  red: {
    name: "Red",
    hex: "#EF4444",
    rgb: "239, 68, 68",
    tailwind: "red-500",
  },
  orange: {
    name: "Orange",
    hex: "#F97316",
    rgb: "249, 115, 22",
    tailwind: "orange-500",
  },
  yellow: {
    name: "Yellow",
    hex: "#EAB308",
    rgb: "234, 179, 8",
    tailwind: "yellow-500",
  },
  pink: {
    name: "Pink",
    hex: "#EC4899",
    rgb: "236, 72, 153",
    tailwind: "pink-500",
  },
  teal: {
    name: "Teal",
    hex: "#14B8A6",
    rgb: "20, 184, 166",
    tailwind: "teal-500",
  },
  indigo: {
    name: "Indigo",
    hex: "#6366F1",
    rgb: "99, 102, 241",
    tailwind: "indigo-500",
  },
  gray: {
    name: "Gray",
    hex: "#6B7280",
    rgb: "107, 114, 128",
    tailwind: "gray-500",
  },
} as const;

export type OrganizationColor = keyof typeof organizationColorMap;

/**
 * Get color information for an organization
 */
export function getOrganizationColor(color: OrganizationColor) {
  return organizationColorMap[color] || organizationColorMap.blue;
}

/**
 * Validation helpers
 */
export function isValidOrganizationName(name: string): boolean {
  return /^[a-zA-Z0-9\s\-_\.]+$/.test(name) && name.trim().length > 0;
}
