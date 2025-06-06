import {
  useOrganizationStore,
  useInitializeOrganizationStore,
} from "@/lib/stores/organization-store";
import { useOrganizations, useUserRole } from "./use-org";

// Enhanced hook that combines Zustand store with tRPC data
export function useCurrentOrganization() {
  const { data: organizationsData, isLoading: isLoadingOrgs } =
    useOrganizations();
  const {
    currentOrganizationId,
    setCurrentOrganization,
    clearCurrentOrganization,
    getCurrentOrganization,
  } = useOrganizationStore();

  // Initialize store with tRPC data
  useInitializeOrganizationStore(organizationsData?.organizations);

  const currentOrganization = getCurrentOrganization(
    organizationsData?.organizations
  );

  return {
    // Data
    currentOrganization,
    organizations: organizationsData?.organizations || [],
    isLoading: isLoadingOrgs,
    hasOrganizations: !!organizationsData?.organizations?.length,

    // Actions
    setCurrentOrganization,
    clearCurrentOrganization,

    // Computed
    currentOrganizationId,
  };
}

// Hook to get current user's role in the selected organization
export function useCurrentUserRole() {
  const { currentOrganization } = useCurrentOrganization();

  return useUserRole(currentOrganization?.id);
}

// Hook with permission checks for the current organization
export function useOrganizationPermissions() {
  const { data: roleData, isLoading: isLoadingRole } = useCurrentUserRole();
  const { currentOrganization, isLoading: isLoadingOrg } =
    useCurrentOrganization();

  const userRole = roleData?.role;
  const isAdmin = userRole === "admin";
  const isMember = userRole === "member";

  return {
    // Role data
    userRole,
    isAdmin,
    isMember,

    // Permissions
    canManageMembers: isAdmin,
    canUpdateOrganization: isAdmin,
    canDeleteOrganization: isAdmin,
    canInviteMembers: isAdmin,

    // Organization data
    currentOrganization,

    // Loading states
    isLoading: isLoadingOrg || (isLoadingRole && !!currentOrganization),
  };
}
