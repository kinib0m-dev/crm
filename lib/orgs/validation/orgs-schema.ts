import { z } from "zod";

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
  color: z.enum([
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
  ]),
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
  color: z.enum([
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
  ]),
});

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;
