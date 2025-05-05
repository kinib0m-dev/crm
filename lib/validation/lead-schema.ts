import { z } from "zod";
import { leadStatusEnum, timeframeEnum } from "@/db/schema";

// Create a type-safe lead status array from the enum
const leadStatusArray = leadStatusEnum.enumValues;
type LeadStatus = (typeof leadStatusArray)[number];

// Create a type-safe timeframe array from the enum
const timeframeArray = timeframeEnum.enumValues;
type Timeframe = (typeof timeframeArray)[number];

// Base schema with common fields for both create and update operations
const leadBaseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  phone: z.string().optional(),
  status: z
    .enum(leadStatusArray as [LeadStatus, ...LeadStatus[]])
    .default("new_lead"),
  sourceId: z.string().uuid().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  expectedPurchaseTimeframe: z
    .enum(timeframeArray as [Timeframe, ...Timeframe[]])
    .optional(),
  budget: z.string().optional(),
});

// Schema for creating a new lead
export const createLeadSchema = leadBaseSchema;

// Schema for updating an existing lead
export const updateLeadSchema = leadBaseSchema.partial().extend({
  id: z.string().uuid(),
});

// Schema for filtering leads
export const leadFilterSchema = z.object({
  status: z.enum(leadStatusArray as [LeadStatus, ...LeadStatus[]]).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  sourceId: z.string().uuid().optional(),
  search: z.string().optional(),
  timeframe: z.enum(timeframeArray as [Timeframe, ...Timeframe[]]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["name", "createdAt", "status", "priority"])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

// Types for our schemas
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;
