import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { generateSlug } from "./org-utils";

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
