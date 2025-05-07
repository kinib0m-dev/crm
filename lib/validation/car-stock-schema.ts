import { z } from "zod";

export const createCarStockSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum([
    "sedan",
    "suv",
    "hatchback",
    "coupe",
    "convertible",
    "wagon",
    "minivan",
    "pickup",
    "electric",
    "hybrid",
    "luxury",
    "sports",
    "other",
  ]),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrls: z.array(z.string()),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCarStockSchema = z.infer<typeof createCarStockSchema>;

export const updateCarStockSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum([
    "sedan",
    "suv",
    "hatchback",
    "coupe",
    "convertible",
    "wagon",
    "minivan",
    "pickup",
    "electric",
    "hybrid",
    "luxury",
    "sports",
    "other",
  ]),
  description: z.string().optional(),
  price: z.string().optional(),
  imageUrls: z.array(z.string()),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateCarStockSchema = z.infer<typeof updateCarStockSchema>;

export const filterCarStockSchema = z.object({
  type: z
    .enum([
      "sedan",
      "suv",
      "hatchback",
      "coupe",
      "convertible",
      "wagon",
      "minivan",
      "pickup",
      "electric",
      "hybrid",
      "luxury",
      "sports",
      "other",
    ])
    .optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "type", "price", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type FilterCarStockSchema = z.infer<typeof filterCarStockSchema>;
