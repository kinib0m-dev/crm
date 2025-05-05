// Lead table
interface Lead {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  status: LeadStatus;
  sourceId?: string;
  priority: number;
  qualificationScore: number;
  lastContactedAt?: Date;
  nextFollowUpDate?: Date;
  expectedPurchaseTimeframe?: Timeframe;
  budget?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Lead Source table
interface LeadSource {
  id: string;
  name: string;
  type: LeadSourceType;
  isActive: boolean;
  description?: string;
  createdAt: Date;
}

// Tag table
interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
}

// Lead Tag Table
interface LeadTag {
  leadId: string;
  tagId: string;
  createdAt: Date;
}

// Interaction table
interface InteractionMetadata {
  platform?: string;
  durationSeconds?: number;
  recordingUrl?: string;
  [key: string]: unknown;
}

interface Interaction {
  id: string;
  leadId: string;
  userId: string;
  type: InteractionType;
  direction: InteractionDirection;
  channel: InteractionChannel;
  subject?: string;
  content?: string;
  metadata?: InteractionMetadata;
  sentAt?: Date;
  receivedAt?: Date;
  isRead: boolean;
  createdAt: Date;
}

// Message table
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  direction: MessageDirection;
  content?: string;
  mediaUrl?: string;
  status: MessageStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

// Conversation table
interface Conversation {
  id: string;
  leadId: string;
  assignedUserId: string;
  state: ConversationState;
  startedAt: Date;
  lastMessageAt?: Date;
  closedAt?: Date;
  createdAt: Date;
}

// Email table
interface Email {
  id: string;
  leadId: string;
  senderId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  category: EmailCategory;
  status: EmailStatus;
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  createdAt: Date;
}

// Task table
interface Task {
  id: string;
  leadId: string;
  assignedUserId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// Sequences
interface Sequence {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

interface SequenceStepMetadata {
  subject?: string;
  templateId?: string;
  attachments?: string[];
  [key: string]: unknown;
}

interface SequenceStep {
  id: string;
  sequenceId: string;
  stepType: SequenceStepType;
  delayInDays: number;
  content?: string;
  metadata?: SequenceStepMetadata;
  createdAt: Date;
}

interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  leadId: string;
  status: SequenceStatus;
  enrolledAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}
