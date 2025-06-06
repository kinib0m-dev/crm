"use client";

import { trpc } from "@/trpc/client";
import { GetOrganizationMembersSchema } from "../validation/orgs-schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ================================ ORGANIZATION HOOKS ================================

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const utils = trpc.useUtils();
  const router = useRouter();

  return trpc.orgs.create.useMutation({
    onSuccess: (data) => {
      toast.success("Organization created successfully!");

      // Invalidate organizations list
      utils.orgs.getAll.invalidate();

      // Redirect to the new organization
      if (data.organization) {
        router.push(`/organizations/${data.organization.slug}`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });
}

/**
 * Hook to update an organization
 */
export function useUpdateOrganization() {
  const utils = trpc.useUtils();

  return trpc.orgs.update.useMutation({
    onSuccess: (data) => {
      toast.success("Organization updated successfully!");

      // Invalidate related queries
      utils.orgs.getAll.invalidate();
      utils.orgs.getById.invalidate({ id: data.organization.id });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update organization");
    },
  });
}

/**
 * Hook to delete an organization
 */
export function useDeleteOrganization() {
  const utils = trpc.useUtils();
  const router = useRouter();

  return trpc.orgs.delete.useMutation({
    onSuccess: () => {
      toast.success("Organization deleted successfully!");

      // Invalidate organizations list
      utils.orgs.getAll.invalidate();

      // Redirect to organizations list
      router.push("/organizations");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete organization");
    },
  });
}

/**
 * Hook to get all organizations for the current user
 */
export function useOrganizations() {
  return trpc.orgs.getAll.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to get a single organization by ID
 */
export function useOrganization(id: string | undefined) {
  return trpc.orgs.getById.useQuery(
    { id: id! },
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
    }
  );
}

// ================================ MEMBERSHIP HOOKS ================================

/**
 * Hook to get organization members
 */
export function useOrganizationMembers(params: GetOrganizationMembersSchema) {
  return trpc.orgs.getMembers.useQuery(params, {
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to update a member's role
 */
export function useUpdateMemberRole() {
  const utils = trpc.useUtils();

  return trpc.orgs.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Member role updated successfully!");

      // Invalidate members query
      utils.orgs.getMembers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member role");
    },
  });
}

/**
 * Hook to remove a member from organization
 */
export function useRemoveMember() {
  const utils = trpc.useUtils();

  return trpc.orgs.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully!");

      // Invalidate members list
      utils.orgs.getMembers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });
}

// ================================ UTILITY HOOKS ================================

/**
 * Hook to get current user's role in an organization
 */
export function useUserRole(organizationId: string | undefined) {
  return trpc.orgs.getUserRole.useQuery(
    { organizationId: organizationId! },
    {
      enabled: !!organizationId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
    }
  );
}

// ================================ CUSTOM ORGANIZATION HOOKS ================================

/**
 * Hook to manage current active organization
 * Uses localStorage to persist the current organization
 */
export function useCurrentOrganization() {
  const { data: organizations } = useOrganizations();
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentOrganizationId");
      setCurrentOrgId(stored);
    }
  }, []);

  const currentOrg = organizations?.organizations?.find(
    (org) => org.id === currentOrgId
  );

  // If stored org doesn't exist in user's organizations, clear it
  useEffect(() => {
    if (currentOrgId && organizations?.organizations && !currentOrg) {
      setCurrentOrgId(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentOrganizationId");
      }
    }
  }, [currentOrgId, organizations, currentOrg]);

  // If no current org is set but user has organizations, set the first one
  useEffect(() => {
    if (!currentOrgId && organizations?.organizations?.length) {
      const firstOrg = organizations.organizations[0];
      setCurrentOrgId(firstOrg.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("currentOrganizationId", firstOrg.id);
      }
    }
  }, [currentOrgId, organizations]);

  const setCurrentOrganization = (org: { id: string }) => {
    setCurrentOrgId(org.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("currentOrganizationId", org.id);
    }
  };

  const clearCurrentOrganization = () => {
    setCurrentOrgId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentOrganizationId");
    }
  };

  return {
    currentOrganization: currentOrg || organizations?.organizations?.[0],
    setCurrentOrganization,
    clearCurrentOrganization,
    isLoading: !organizations,
    hasOrganizations: !!organizations?.organizations?.length,
  };
}

/**
 * Hook to get user's role in the current organization
 */
export function useCurrentUserRole() {
  const { currentOrganization } = useCurrentOrganization();

  return useUserRole(currentOrganization?.id);
}

/**
 * Hook with permission checks for the current organization
 */
export function useOrganizationPermissions() {
  const { data: roleData } = useCurrentUserRole();
  const { currentOrganization } = useCurrentOrganization();

  const userRole = roleData?.role;
  const isAdmin = userRole === "admin";
  const isMember = userRole === "member";

  return {
    userRole,
    isAdmin,
    isMember,
    canManageMembers: isAdmin,
    canUpdateOrganization: isAdmin,
    canDeleteOrganization: isAdmin,
    currentOrganization,
    isLoading: !roleData && !!currentOrganization,
  };
}
