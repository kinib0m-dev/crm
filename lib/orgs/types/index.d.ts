export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: OrganizationColor;
  createdAt: Date;
}

export interface UserOrganization extends Organization {
  role: "admin" | "member";
  joinedAt: Date;
}

export type OrganizationColor =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "orange"
  | "yellow"
  | "pink"
  | "teal"
  | "indigo"
  | "gray";

export interface OrganizationContextType {
  currentOrganization: UserOrganization | null;
  organizations: UserOrganization[];
  isLoading: boolean;
  error: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  getCurrentOrg: () => UserOrganization | null;
  canPerformAction: (action: OrganizationAction) => boolean;
  refreshOrganizations: () => void;
}

export type OrganizationAction =
  | "update"
  | "delete"
  | "manage_members"
  | "view_settings";

export interface OrganizationStorageData {
  organizationId: string;
  timestamp: number;
}
