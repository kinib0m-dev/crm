import { z } from "zod";

// Organization color enum values (matching your database schema)
export const organizationColors = [
  "blue",
  "green",
  "purple",
  "red",
  "orange",
  "yellow",
  "pink",
  "teal",
  "indigo",
  "gray",
] as const;

// Organization role enum values (matching your database schema)
export const organizationRoles = ["admin", "member"] as const;

// Create organization schema
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Organization name is required" })
    .max(100, { message: "Organization name must be less than 100 characters" })
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, {
      message:
        "Organization name can only contain letters, numbers, spaces, hyphens, underscores, and periods",
    }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  color: z.enum(organizationColors).default("blue"),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

// Update organization schema
export const updateOrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, { message: "Organization name is required" })
    .max(100, { message: "Organization name must be less than 100 characters" })
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, {
      message:
        "Organization name can only contain letters, numbers, spaces, hyphens, underscores, and periods",
    }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  color: z.enum(organizationColors),
});

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;

// Organization members schemas
export const updateMembersSchema = z.object({
  membersId: z.string().uuid(),
  role: z.enum(organizationRoles),
});

export type UpdateMembersSchema = z.infer<typeof updateMembersSchema>;

// Get organization members schema
export const getOrganizationMembersSchema = z.object({
  organizationId: z.string().uuid(),
  sortBy: z.enum(["name", "email", "joinedAt", "role"]).default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export type GetOrganizationMembersSchema = z.infer<
  typeof getOrganizationMembersSchema
>;
