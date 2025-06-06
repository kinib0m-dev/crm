import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";

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
    const existingOrg = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        excludeOrgId
          ? and(
              eq(organizations.slug, slug),
              ne(organizations.id, excludeOrgId)
            )
          : eq(organizations.slug, slug)
      )
      .limit(1);

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
 * Color utility functions
 */
export const organizationColorMap = {
  blue: {
    name: "Blue",
    hex: "#3B82F6",
    bg: "bg-blue-500",
    text: "text-blue-500",
  },
  green: {
    name: "Green",
    hex: "#10B981",
    bg: "bg-emerald-500",
    text: "text-emerald-500",
  },
  purple: {
    name: "Purple",
    hex: "#8B5CF6",
    bg: "bg-violet-500",
    text: "text-violet-500",
  },
  red: {
    name: "Red",
    hex: "#EF4444",
    bg: "bg-red-500",
    text: "text-red-500",
  },
  orange: {
    name: "Orange",
    hex: "#F97316",
    bg: "bg-orange-500",
    text: "text-orange-500",
  },
  yellow: {
    name: "Yellow",
    hex: "#EAB308",
    bg: "bg-yellow-500",
    text: "text-yellow-500",
  },
  pink: {
    name: "Pink",
    hex: "#EC4899",
    bg: "bg-pink-500",
    text: "text-pink-500",
  },
  teal: {
    name: "Teal",
    hex: "#14B8A6",
    bg: "bg-teal-500",
    text: "text-teal-500",
  },
  indigo: {
    name: "Indigo",
    hex: "#6366F1",
    bg: "bg-indigo-500",
    text: "text-indigo-500",
  },
  gray: {
    name: "Gray",
    hex: "#6B7280",
    bg: "bg-gray-500",
    text: "text-gray-500",
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
 * Get all available colors for selection
 */
export function getAvailableColors() {
  return Object.entries(organizationColorMap).map(([key, value]) => ({
    value: key as OrganizationColor,
    label: value.name,
    ...value,
  }));
}
