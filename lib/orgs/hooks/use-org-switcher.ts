"use client";

import { useCallback, useState } from "react";
import { useOrganization } from "../context/org-context";
import { UserOrganization } from "../types";

/**
 * Hook for organization switching functionality
 */
export function useOrganizationSwitcher() {
  const {
    currentOrganization,
    organizations,
    switchOrganization,
    isLoading,
    error,
    refreshOrganizations,
  } = useOrganization();

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  /**
   * Switch to a different organization with error handling
   */
  const handleSwitchOrganization = useCallback(
    async (organizationId: string) => {
      if (organizationId === currentOrganization?.id) {
        return; // Already on this organization
      }

      setIsSwitching(true);
      setSwitchError(null);

      try {
        await switchOrganization(organizationId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to switch organization";
        setSwitchError(errorMessage);
        throw err; // Re-throw for component handling
      } finally {
        setIsSwitching(false);
      }
    },
    [currentOrganization?.id, switchOrganization]
  );

  /**
   * Get organizations with additional metadata for UI
   */
  const getOrganizationsWithMetadata = useCallback(() => {
    return organizations.map((org) => ({
      ...org,
      isActive: org.id === currentOrganization?.id,
      canSwitch: org.id !== currentOrganization?.id,
      displayName: org.name,
      roleLabel: org.role === "admin" ? "Admin" : "Member",
    }));
  }, [organizations, currentOrganization?.id]);

  /**
   * Get available organizations (excludes current)
   */
  const getAvailableOrganizations = useCallback(() => {
    return organizations.filter((org) => org.id !== currentOrganization?.id);
  }, [organizations, currentOrganization?.id]);

  /**
   * Get organizations grouped by role
   */
  const getOrganizationsByRole = useCallback(() => {
    const adminOrgs = organizations.filter((org) => org.role === "admin");
    const memberOrgs = organizations.filter((org) => org.role === "member");

    return {
      admin: adminOrgs,
      member: memberOrgs,
      hasAdminOrgs: adminOrgs.length > 0,
      hasMemberOrgs: memberOrgs.length > 0,
    };
  }, [organizations]);

  /**
   * Search organizations by name
   */
  const searchOrganizations = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase().trim();

      if (!lowercaseQuery) {
        return organizations;
      }

      return organizations.filter(
        (org) =>
          org.name.toLowerCase().includes(lowercaseQuery) ||
          org.description?.toLowerCase().includes(lowercaseQuery)
      );
    },
    [organizations]
  );

  /**
   * Get recent organizations (based on joinedAt)
   */
  const getRecentOrganizations = useCallback(
    (limit = 5) => {
      return [...organizations]
        .sort(
          (a, b) =>
            new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        )
        .slice(0, limit);
    },
    [organizations]
  );

  /**
   * Clear switch error
   */
  const clearSwitchError = useCallback(() => {
    setSwitchError(null);
  }, []);

  /**
   * Refresh organizations list
   */
  const handleRefreshOrganizations = useCallback(() => {
    setSwitchError(null);
    refreshOrganizations();
  }, [refreshOrganizations]);

  return {
    // Core state
    currentOrganization,
    organizations,
    isLoading,
    error,

    // Switching state
    isSwitching,
    switchError,

    // Actions
    switchOrganization: handleSwitchOrganization,
    refreshOrganizations: handleRefreshOrganizations,
    clearSwitchError,

    // Utility functions
    getOrganizationsWithMetadata,
    getAvailableOrganizations,
    getOrganizationsByRole,
    searchOrganizations,
    getRecentOrganizations,

    // Computed values
    hasOrganizations: organizations.length > 0,
    hasMultipleOrganizations: organizations.length > 1,
    canSwitchOrganizations: organizations.length > 1 && !isSwitching,
    organizationCount: organizations.length,
  };
}

/**
 * Hook for organization filtering and sorting
 */
export function useOrganizationFilters() {
  const { organizations } = useOrganization();

  /**
   * Filter organizations by role
   */
  const filterByRole = useCallback(
    (role: "admin" | "member" | "all" = "all") => {
      if (role === "all") return organizations;
      return organizations.filter((org) => org.role === role);
    },
    [organizations]
  );

  /**
   * Filter organizations by color
   */
  const filterByColor = useCallback(
    (color: string) => {
      return organizations.filter((org) => org.color === color);
    },
    [organizations]
  );

  /**
   * Sort organizations by various criteria
   */
  const sortOrganizations = useCallback(
    (
      orgs: UserOrganization[],
      sortBy: "name" | "joinedAt" | "createdAt" | "role" = "name",
      direction: "asc" | "desc" = "asc"
    ) => {
      const sorted = [...orgs].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "joinedAt":
            comparison =
              new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "role":
            // Admin first, then member
            if (a.role === "admin" && b.role === "member") comparison = -1;
            else if (a.role === "member" && b.role === "admin") comparison = 1;
            else comparison = 0;
            break;
        }

        return direction === "desc" ? -comparison : comparison;
      });

      return sorted;
    },
    []
  );

  return {
    filterByRole,
    filterByColor,
    sortOrganizations,
  };
}
