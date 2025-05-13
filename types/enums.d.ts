type LeadStatus =
  | "lead_entrante"
  | "en_conversacion"
  | "opciones_enviadas"
  | "vehiculo_elegido"
  | "sin_opcion"
  | "asesor"
  | "venta_realizada"
  | "no_cualificado";

type InteractionType =
  | "email"
  | "whatsapp"
  | "call"
  | "meeting"
  | "note"
  | "task"
  | "other";

type InteractionDirection = "inbound" | "outbound";

type InteractionChannel = "manual" | "automated" | "scheduled";

type MessageDirection = "inbound" | "outbound";

type MessageType = "text" | "media" | "template" | "interactive";

type MessageStatus = "sent" | "delivered" | "read" | "failed";

type ConversationState = "active" | "inactive" | "paused" | "complete";

type EmailCategory = "welcome" | "follow_up" | "nurture" | "notification";

type EmailStatus = "sent" | "delivered" | "opened" | "clicked" | "bounced";

type TaskPriority = "low" | "medium" | "high" | "urgent";

type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

type SequenceStepType = "email" | "whatsapp" | "task" | "notification";

type SequenceStatus = "active" | "paused" | "completed" | "cancelled";

type FacebookLeadStatus = "new" | "processed" | "invalid";

type WebhookStatus = "received" | "processed" | "failed";

type Timeframe = "immediate" | "1-3 months" | "3-6 months" | "6+ months";

type LeadSourceType = "online" | "offline" | "referral" | "other";

type ActivityType =
  | "status_change"
  | "source_added"
  | "tag_added"
  | "tag_removed"
  | "interaction_added"
  | "task_created"
  | "task_completed";

type DocCategory =
  | "other"
  | "company_profile"
  | "pricing"
  | "financing"
  | "faq"
  | "service"
  | "maintenance"
  | "legal"
  | "product_info";

type CarTypes =
  | "sedan"
  | "suv"
  | "hatchback"
  | "coupe"
  | "convertible"
  | "wagon"
  | "minivan"
  | "pickup"
  | "electric"
  | "hybrid"
  | "luxury"
  | "sports"
  | "other";

type LeadTaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

type LeadTaskPriority = "low" | "medium" | "high" | "urgent";
