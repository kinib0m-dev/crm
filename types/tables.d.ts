// Lead table
interface Lead {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
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
