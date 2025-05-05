import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum([
    "new_lead",
    "initial_contact",
    "awaiting_response",
    "engaged",
    "information_gathering",
    "high_interest",
    "qualified",
    "appointment_scheduled",
    "proposal_sent",
    "negotiation",
    "converted",
    "purchased_elsewhere",
    "future_opportunity",
    "periodic_nurture",
    "reactivated",
    "unsubscribed",
    "invalid",
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
