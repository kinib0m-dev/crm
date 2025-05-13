import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum([
    "lead_entrante",
    "en_conversacion",
    "opciones_enviadas",
    "vehiculo_elegido",
    "sin_opcion",
    "asesor",
    "venta_realizada",
    "no_cualificado",
  ]),
  sourceId: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  qualificationScore: z.number().int().optional(),
  lastContactedAt: z.coerce.date().optional(),
  nextFollowUpDate: z.coerce.date().optional(),
  expectedPurchaseTimeframe: z
    .enum(["immediate", "1-3 months", "3-6 months", "6+ months"])
    .optional(),
  budget: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export type CreateLeadSchema = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum([
    "lead_entrante",
    "en_conversacion",
    "opciones_enviadas",
    "vehiculo_elegido",
    "sin_opcion",
    "asesor",
    "venta_realizada",
    "no_cualificado",
  ]),
  sourceId: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  qualificationScore: z.number().int().optional(),
  lastContactedAt: z.coerce.date().optional(),
  nextFollowUpDate: z.coerce.date().optional(),
  expectedPurchaseTimeframe: z
    .enum(["immediate", "1-3 months", "3-6 months", "6+ months"])
    .optional(),
  budget: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateLeadSchema = z.infer<typeof updateLeadSchema>;

export const filterLeadSchema = z.object({
  status: z
    .enum([
      "lead_entrante",
      "en_conversacion",
      "opciones_enviadas",
      "vehiculo_elegido",
      "sin_opcion",
      "asesor",
      "venta_realizada",
      "no_cualificado",
    ])
    .optional(),
  priority: z.number().int().min(1).max(5).optional(),
  sourceId: z.string().uuid().optional(),
  search: z.string().optional(),
  timeframe: z
    .enum(["immediate", "1-3 months", "3-6 months", "6+ months"])
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["name", "createdAt", "status", "priority"])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type FilterLeadSchema = z.infer<typeof filterLeadSchema>;
