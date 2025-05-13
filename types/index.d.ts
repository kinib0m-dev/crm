// Existing interface definitions
interface FormWrapperProps {
  children: React.ReactNode;
  label: string;
  showSocials?: boolean;
  buttonLabel: string;
  buttonHref: string;
}

interface SubmitButtonProps {
  text: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  className?: string;
  isPending: boolean;
}

// User related types
interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isTwoFactorEnabled: boolean;
}

interface LoginActivityRecord {
  id: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: Date;
}

interface ActivityResponse {
  success: boolean;
  activities?: LoginActivityRecord[];
  message?: string;
}

interface TypedAuthError extends AuthError {
  type: ErrorType;
}

// ------------------------------------------- LEAD.LIST PROCEDURE -------------------------------------------

type TagEntity = {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: Date;
};

// Type for a lead with its associated tags
type LeadWithTags = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  campaignId: string | null;
  priority: number | null;
  lastContactedAt: Date | null;
  nextFollowUpDate: Date | null;
  expectedPurchaseTimeframe: Timeframe | null;
  budget: string | null;
  isDeleted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  tags: TagEntity[];
};

// Type for pagination information
type PaginationInfo = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

// Type for the complete response from lead.list
type LeadListResponse = {
  success: boolean;
  leads: LeadWithTags[];
  pagination: PaginationInfo;
};

// ------------------------------------------- LEAD.GETSTATS PROCEDURE -------------------------------------------
// Type for status statistics
type StatusStat = {
  status: LeadStatus;
  count: number | null;
};

// Type for priority statistics
type PriorityStat = {
  priority: number | null;
  count: number | null;
};

// Type for timeframe statistics
type TimeframeStat = {
  timeframe: Timeframe | null;
  count: number | null;
};

// Type for the comprehensive lead statistics
type LeadStats = {
  total: number | null;
  byStatus: StatusStat[];
  byPriority: PriorityStat[];
  byTimeframe: TimeframeStat[];
};

// -------------------------------------------  -------------------------------------------

type LeadNotes = {
  id: string;
  leadId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type LeadTasks = {
  id: string;
  leadId: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description?: string | undefined;
  dueDate?: string | undefined;
};

type ExtendedLeadTasks = {
  id: string;
  leadId: string;
  userId: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ExtendedLeadTasksString = {
  id: string;
  leadId: string;
  userId: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
