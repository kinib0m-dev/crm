"use client";

// lib/orgs/context/org-provider.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { trpc } from "@/trpc/client";
import { OrganizationContext } from "./org-context";
import {
  UserOrganization,
  OrganizationAction,
  OrganizationStorageData,
} from "../types";

const STORAGE_KEY = "crm_current_organization";
const STORAGE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] =
    useState<UserOrganization | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's organizations
  const {
    data: organizationsData,
    isLoading,
    refetch: refreshOrganizations,
  } = trpc.orgs.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const organizations = useMemo(
    () => organizationsData?.organizations || [],
    [organizationsData?.organizations]
  );

  // Load organization from localStorage
  const loadStoredOrganization = useCallback(() => {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data: OrganizationStorageData = JSON.parse(stored);

      // Check if stored data is expired
      if (Date.now() - data.timestamp > STORAGE_EXPIRY) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data.organizationId;
    } catch (error) {
      console.error("Error loading stored organization:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  // Save organization to localStorage
  const saveOrganizationToStorage = useCallback((organizationId: string) => {
    if (typeof window === "undefined") return;

    try {
      const data: OrganizationStorageData = {
        organizationId,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving organization to storage:", error);
    }
  }, []);

  // Switch to a different organization
  const switchOrganization = useCallback(
    async (organizationId: string) => {
      try {
        setError(null);

        // Find the organization in the user's list
        const targetOrg = organizations.find(
          (org) => org.id === organizationId
        );

        if (!targetOrg) {
          throw new Error("Organization not found or access denied");
        }

        // Set as current organization
        setCurrentOrganization(targetOrg);

        // Save to localStorage
        saveOrganizationToStorage(organizationId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to switch organization";
        setError(message);
        console.error("Error switching organization:", err);
      }
    },
    [organizations, saveOrganizationToStorage]
  );

  // Get current organization
  const getCurrentOrg = useCallback(() => {
    return currentOrganization;
  }, [currentOrganization]);

  // Check if user can perform an action on current organization
  const canPerformAction = useCallback(
    (action: OrganizationAction): boolean => {
      if (!currentOrganization) return false;

      switch (action) {
        case "update":
        case "delete":
        case "manage_members":
        case "view_settings":
          return currentOrganization.role === "admin";
        default:
          return false;
      }
    },
    [currentOrganization]
  );

  // Initialize current organization when organizations are loaded
  useEffect(() => {
    if (!organizations.length || currentOrganization) return;

    const storedOrgId = loadStoredOrganization();

    if (storedOrgId) {
      // Try to set the stored organization
      const storedOrg = organizations.find((org) => org.id === storedOrgId);
      if (storedOrg) {
        setCurrentOrganization(storedOrg);
        return;
      }
    }

    // Fallback to first organization if no stored org or stored org not found
    if (organizations.length > 0) {
      const firstOrg = organizations[0];
      setCurrentOrganization(firstOrg);
      saveOrganizationToStorage(firstOrg.id);
    }
  }, [
    organizations,
    currentOrganization,
    loadStoredOrganization,
    saveOrganizationToStorage,
  ]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      currentOrganization,
      organizations,
      isLoading,
      error,
      switchOrganization,
      getCurrentOrg,
      canPerformAction,
      refreshOrganizations: () => refreshOrganizations(),
    }),
    [
      currentOrganization,
      organizations,
      isLoading,
      error,
      switchOrganization,
      getCurrentOrg,
      canPerformAction,
      refreshOrganizations,
    ]
  );

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}
