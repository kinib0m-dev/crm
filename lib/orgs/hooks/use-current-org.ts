"use client";

import { useOrganization } from "../context/org-context";
import { UserOrganization } from "../types";

/**
 * Hook to get the current organization and related utilities
 */
export function useCurrentOrganization() {
  const {
    currentOrganization,
    isLoading,
    error,
    canPerformAction,
    getCurrentOrg,
  } = useOrganization();

  return {
    /**
     * Current active organization, null if none selected
     */
    organization: currentOrganization,

    /**
     * Organization ID shorthand for convenience
     */
    organizationId: currentOrganization?.id || null,

    /**
     * User's role in the current organization
     */
    userRole: currentOrganization?.role || null,

    /**
     * Whether the user is an admin of the current organization
     */
    isAdmin: currentOrganization?.role === "admin",

    /**
     * Whether the user is a member (non-admin) of the current organization
     */
    isMember: currentOrganization?.role === "member",

    /**
     * Loading state for organization data
     */
    isLoading,

    /**
     * Error state for organization operations
     */
    error,

    /**
     * Check if user can perform a specific action
     */
    canPerformAction,

    /**
     * Get current organization (same as organization, for backwards compatibility)
     */
    getCurrentOrg,

    /**
     * Whether a current organization is selected
     */
    hasOrganization: !!currentOrganization,

    /**
     * Organization display name for UI
     */
    organizationName: currentOrganization?.name || "No Organization",

    /**
     * Organization color for theming
     */
    organizationColor: currentOrganization?.color || "blue",
  };
}

/**
 * Hook to check if user has admin privileges in current organization
 * Throws error if no organization is selected
 */
export function useRequireOrganizationAdmin() {
  const { organization, isAdmin, isLoading, error } = useCurrentOrganization();

  if (isLoading) {
    return { isLoading: true, canProceed: false };
  }

  if (error) {
    throw new Error(`Organization error: ${error}`);
  }

  if (!organization) {
    throw new Error("No organization selected");
  }

  if (!isAdmin) {
    throw new Error("Admin privileges required for this action");
  }

  return {
    isLoading: false,
    canProceed: true,
    organization,
    organizationId: organization.id,
  };
}

/**
 * Hook to require any organization membership
 * Throws error if no organization is selected
 */
export function useRequireOrganization() {
  const { organization, isLoading, error } = useCurrentOrganization();

  if (isLoading) {
    return { isLoading: true, canProceed: false };
  }

  if (error) {
    throw new Error(`Organization error: ${error}`);
  }

  if (!organization) {
    throw new Error("No organization selected");
  }

  return {
    isLoading: false,
    canProceed: true,
    organization,
    organizationId: organization.id,
    userRole: organization.role,
    isAdmin: organization.role === "admin",
  };
}

/**
 * Hook for organization-specific operations that gracefully handle missing organizations
 */
export function useOrganizationContext() {
  const context = useCurrentOrganization();

  /**
   * Execute a callback only if an organization is selected
   */
  const withOrganization = <T>(
    callback: (org: UserOrganization) => T,
    fallback?: T
  ): T | undefined => {
    if (context.organization) {
      return callback(context.organization);
    }
    return fallback;
  };

  /**
   * Execute a callback only if user is admin
   */
  const withAdminAccess = <T>(
    callback: (org: UserOrganization) => T,
    fallback?: T
  ): T | undefined => {
    if (context.organization && context.isAdmin) {
      return callback(context.organization);
    }
    return fallback;
  };

  /**
   * Get organization-scoped data for tRPC calls
   */
  const getOrgScopedInput = <T extends Record<string, unknown>>(
    input: T
  ): (T & { organizationId: string }) | null => {
    if (!context.organizationId) {
      return null;
    }
    return {
      ...input,
      organizationId: context.organizationId,
    };
  };

  return {
    ...context,
    withOrganization,
    withAdminAccess,
    getOrgScopedInput,
  };
}
