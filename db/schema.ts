import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  boolean,
  pgEnum,
  decimal,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ------------------------------------ AUTH ------------------------------------
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),

  // Account lockout fields
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lastFailedLoginAttempt: timestamp("last_failed_login_attempt", {
    mode: "date",
  }),
  lockedUntil: timestamp("locked_until", { mode: "date" }),

  // Session revocation field
  securityVersion: integer("security_version").default(1),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const verificationTokens = pgTable(
  "verification_token",
  {
    id: uuid("id").notNull().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.id, verificationToken.token],
      }),
    },
  ]
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").notNull().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (passwordResetTokens) => [
    {
      compositePk: primaryKey({
        columns: [passwordResetTokens.id, passwordResetTokens.token],
      }),
    },
  ]
);

export const twoFactorTokens = pgTable(
  "two_factor_tokens",
  {
    id: uuid("id").notNull().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (twoFactorTokens) => [
    {
      compositePk: primaryKey({
        columns: [twoFactorTokens.id, twoFactorTokens.token],
      }),
    },
  ]
);

export const twoFactorConfirmation = pgTable(
  "two_factor_confirmation",
  {
    id: uuid("id").notNull().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (twoFactorConfirmation) => [
    {
      compositePk: primaryKey({
        columns: [twoFactorConfirmation.userId],
      }),
    },
  ]
);

// Login activity tracking table
export const loginActivities = pgTable("login_activities", {
  id: uuid("id").notNull().defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------------------------ CRM ------------------------------------
export const leadStatusEnum = pgEnum("lead_status", [
  // Initial Engagement Phase
  "new_lead",
  "initial_contact",
  "awaiting_response",
  // Qualification Phase
  "engaged",
  "information_gathering",
  "high_interest",
  "qualified",
  // Conversion Phase
  "appointment_scheduled",
  "proposal_sent",
  "negotiation",
  // Outcome Phase
  "converted",
  "purchased_elsewhere",
  // Nurture Phase
  "future_opportunity",
  "periodic_nurture",
  // Re-engagement Phase
  "reactivated",
  // Administrative Statuses
  "unsubscribed",
  "invalid",
]);

export const interactionTypeEnum = pgEnum("interaction_type", [
  "email",
  "whatsapp",
  "call",
  "meeting",
  "note",
  "task",
  "other",
]);

export const interactionDirectionEnum = pgEnum("interaction_direction", [
  "inbound",
  "outbound",
]);

export const interactionChannelEnum = pgEnum("interaction_channel", [
  "manual",
  "automated",
  "scheduled",
]);

export const messageDirectionEnum = pgEnum("message_direction", [
  "inbound",
  "outbound",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "media",
  "template",
  "interactive",
]);

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const conversationStateEnum = pgEnum("conversation_state", [
  "active",
  "inactive",
  "paused",
  "complete",
]);

export const emailCategoryEnum = pgEnum("email_category", [
  "welcome",
  "follow_up",
  "nurture",
  "notification",
]);

export const emailStatusEnum = pgEnum("email_status", [
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const sequenceStepTypeEnum = pgEnum("sequence_step_type", [
  "email",
  "whatsapp",
  "task",
  "notification",
]);

export const sequenceStatusEnum = pgEnum("sequence_status", [
  "active",
  "paused",
  "completed",
  "cancelled",
]);

export const facebookLeadStatusEnum = pgEnum("facebook_lead_status", [
  "new",
  "processed",
  "invalid",
]);

export const webhookStatusEnum = pgEnum("webhook_status", [
  "received",
  "processed",
  "failed",
]);

export const timeframeEnum = pgEnum("timeframe_enum", [
  "immediate",
  "1-3 months",
  "3-6 months",
  "6+ months",
]);

export const leadSourceTypeEnum = pgEnum("lead_source_type", [
  "online",
  "offline",
  "referral",
  "other",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "status_change",
  "source_added",
  "tag_added",
  "tag_removed",
  "interaction_added",
  "task_created",
  "task_completed",
]);

// Tables
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number"),
  status: leadStatusEnum("status").default("new_lead").notNull(),
  sourceId: uuid("source_id").references(() => leadSources.id),
  priority: integer("priority").default(3),
  qualificationScore: integer("qualification_score").default(0),
  lastContactedAt: timestamp("last_contacted_at", { mode: "date" }),
  nextFollowUpDate: timestamp("next_follow_up_date", { mode: "date" }),
  expectedPurchaseTimeframe: timeframeEnum("expected_purchase_timeframe"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadSources = pgTable("lead_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: leadSourceTypeEnum("type").default("online").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").default("#cccccc"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadTags = pgTable(
  "lead_tags",
  {
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.leadId, t.tagId] }),
  })
);

export const interactions = pgTable("interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: interactionTypeEnum("type").notNull(),
  direction: interactionDirectionEnum("direction").notNull(),
  channel: interactionChannelEnum("channel").notNull(),
  subject: text("subject"),
  content: text("content"),
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  receivedAt: timestamp("received_at", { mode: "date" }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappConversations = pgTable("whatsapp_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  phoneNumber: text("phone_number").notNull(),
  lastMessageAt: timestamp("last_message_at", { mode: "date" }),
  state: conversationStateEnum("state").default("active").notNull(),
  currentStep: text("current_step"),
  conversationData: jsonb("conversation_data"),
  isOptedOut: boolean("is_opted_out").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => whatsappConversations.id, { onDelete: "cascade" }),
  direction: messageDirectionEnum("direction").notNull(),
  messageType: messageTypeEnum("message_type").default("text").notNull(),
  status: messageStatusEnum("status").default("sent").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  templateName: text("template_name"),
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at", { mode: "date" }),
  deliveredAt: timestamp("delivered_at", { mode: "date" }),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  variables: text("variables").array(),
  category: emailCategoryEnum("category").default("follow_up").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailsSent = pgTable("emails_sent", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => emailTemplates.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at", { mode: "date" }).notNull(),
  sentByUserId: text("sent_by_user_id")
    .notNull()
    .references(() => users.id),
  isOpened: boolean("is_opened").default(false),
  openedAt: timestamp("opened_at", { mode: "date" }),
  clickedLinks: jsonb("clicked_links"),
  status: emailStatusEnum("status").default("sent").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  status: taskStatusEnum("status").default("pending").notNull(),
  reminderAt: timestamp("reminder_at", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const followUpSequences = pgTable("follow_up_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  triggerCondition: jsonb("trigger_condition"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sequenceSteps = pgTable("sequence_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => followUpSequences.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  type: sequenceStepTypeEnum("type").notNull(),
  delayDays: integer("delay_days").default(0).notNull(),
  templateId: uuid("template_id").references(() => emailTemplates.id),
  whatsappTemplateId: text("whatsapp_template_id"),
  taskTitle: text("task_title"),
  taskDescription: text("task_description"),
  condition: jsonb("condition"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadSequences = pgTable("lead_sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  sequenceId: uuid("sequence_id")
    .notNull()
    .references(() => followUpSequences.id, { onDelete: "cascade" }),
  currentStep: integer("current_step").default(0).notNull(),
  nextStepDate: timestamp("next_step_date", { mode: "date" }),
  status: sequenceStatusEnum("status").default("active").notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  pausedAt: timestamp("paused_at", { mode: "date" }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const facebookLeads = pgTable("facebook_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id),
  formId: text("form_id").notNull(),
  formName: text("form_name"),
  pageId: text("page_id").notNull(),
  adId: text("ad_id"),
  adsetId: text("adset_id"),
  campaignId: text("campaign_id"),
  rawData: jsonb("raw_data").notNull(),
  processedAt: timestamp("processed_at", { mode: "date" }),
  status: facebookLeadStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { mode: "date" }),
  status: webhookStatusEnum("status").default("received").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadActivity = pgTable("lead_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  activityType: activityTypeEnum("activity_type").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  performedByUserId: text("performed_by_user_id").references(() => users.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const metrics = pgTable("metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  metric: text("metric").notNull(),
  value: integer("value").notNull(),
  sourceId: uuid("source_id").references(() => leadSources.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
