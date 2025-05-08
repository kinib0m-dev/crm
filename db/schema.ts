import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  boolean,
  pgEnum,
  customType,
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

// ------------------------------------ LEADS ------------------------------------
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

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: leadStatusEnum("status").default("new_lead").notNull(),
  sourceId: uuid("source_id").references(() => leadSources.id),
  priority: integer("priority").default(3),
  qualificationScore: integer("qualification_score").default(0),
  lastContactedAt: timestamp("last_contacted_at", { mode: "date" }),
  nextFollowUpDate: timestamp("next_follow_up_date", { mode: "date" }),
  expectedPurchaseTimeframe: timeframeEnum("expected_purchase_timeframe"),
  budget: text("budget"),
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

// -------------------------------------- BOT DOCS --------------------------------------
export const documentCategoryEnum = pgEnum("document_category", [
  "company_profile",
  "pricing",
  "financing",
  "faq",
  "service",
  "maintenance",
  "legal",
  "product_info",
  "other",
]);
const vector = (dimensions: number) =>
  customType<{
    data: number[];
    driverData: string;
  }>({
    dataType() {
      return `vector(${dimensions})`;
    },
    toDriver(value) {
      // Format as Postgres array string for pgvector: e.g. '[0.1, 0.2, ...]'
      return `[${value.join(",")}]`;
    },
    fromDriver(value) {
      // Convert PG string back to array
      return value.slice(1, -1).split(",").map(Number);
    },
  });

// Bot Documents table for storing text content for embedding
export const botDocuments = pgTable("bot_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: documentCategoryEnum("category").default("other").notNull(),
  content: text("content").notNull(),
  fileName: text("file_name"),
  embedding: vector(768)("vector"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -------------------------------------- STOCK --------------------------------------
export const carTypeEnum = pgEnum("car_type", [
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
]);

// Stock items table for cars
export const carStock = pgTable("car_stock", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: carTypeEnum("type").default("sedan").notNull(),
  description: text("description"),
  price: text("price"),
  imageUrl: text("image_url").array(),
  url: text("url"),
  notes: text("notes"),
  embedding: vector(768)("vector"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
