// lib/validation/lead-task-schema.ts
import { z } from "zod";

// Helper function to handle dates from string inputs
const dateStringToDate = (val: string | undefined) => {
  if (!val) return undefined;
  const date = new Date(val);
  return isNaN(date.getTime()) ? undefined : date;
};

export const createLeadTaskSchema = z.object({
  leadId: z.string().uuid(),
  title: z.string().min(1, { message: "Task title is required" }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .default("pending"),
  dueDate: z.union([
    z.string().transform((str) => dateStringToDate(str)),
    z.date().optional(),
    z.undefined(),
  ]),
});

export type CreateLeadTaskSchema = z.infer<typeof createLeadTaskSchema>;

export const updateLeadTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, { message: "Task title is required" }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  dueDate: z.union([
    z.string().transform((str) => dateStringToDate(str)),
    z.date().optional(),
    z.undefined(),
  ]),
});

export type UpdateLeadTaskSchema = z.infer<typeof updateLeadTaskSchema>;

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
});

export type UpdateTaskStatusSchema = z.infer<typeof updateTaskStatusSchema>;

export const getLeadTasksSchema = z.object({
  leadId: z.string().uuid(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
});

export type GetLeadTasksSchema = z.infer<typeof getLeadTasksSchema>;
