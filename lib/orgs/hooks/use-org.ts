"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentOrganization } from "./use-current-org";

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const { organization } = useCurrentOrganization();

  return trpc.orgs.create.useMutation({
    onSuccess: (data) => {
      toast.success("Organization created successfully!");

      // Invalidate organizations list
      utils.orgs.getAll.invalidate();

      // Auto-switch to the new organization if no current org
      if (!organization && data.organization) {
        // The context will automatically handle switching to the new org
        // since it will be included in the refreshed list
      }

      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });
}

/**
 * Hook to update an organization (requires organization context)
 */
export function useUpdateOrganization() {
  const utils = trpc.useUtils();
  const { organizationId } = useCurrentOrganization();

  return trpc.orgs.update.useMutation({
    onSuccess: () => {
      toast.success("Organization updated successfully!");

      // Invalidate related queries
      utils.orgs.getAll.invalidate();

      if (organizationId) {
        utils.orgs.getById.invalidate({ organizationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update organization");
    },
  });
}

/**
 * Hook to delete an organization (requires organization context)
 */
export function useDeleteOrganization() {
  const utils = trpc.useUtils();
  const router = useRouter();

  return trpc.orgs.delete.useMutation({
    onSuccess: () => {
      toast.success("Organization deleted successfully!");

      // Invalidate organizations list
      utils.orgs.getAll.invalidate();

      // Redirect to organizations list or dashboard
      router.refresh();
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
 * Hook to get a single organization by ID (uses organization context)
 */
export function useOrganization(organizationId?: string) {
  const { organizationId: currentOrgId } = useCurrentOrganization();
  const targetOrgId = organizationId || currentOrgId;

  return trpc.orgs.getById.useQuery(
    { organizationId: targetOrgId! },
    {
      enabled: !!targetOrgId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
    }
  );
}

/**
 * Hook to get organization members (requires organization context)
 */
export function useOrganizationMembers(
  options: {
    limit?: number;
    offset?: number;
    organizationId?: string;
  } = {}
) {
  const { organizationId: currentOrgId } = useCurrentOrganization();
  const targetOrgId = options.organizationId || currentOrgId;

  return trpc.orgs.getMembers.useQuery(
    {
      organizationId: targetOrgId!,
      limit: options.limit || 50,
      offset: options.offset || 0,
    },
    {
      enabled: !!targetOrgId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
    }
  );
}

/**
 * Hook to update member role (admin only)
 */
export function useUpdateMemberRole() {
  const utils = trpc.useUtils();
  const { organizationId } = useCurrentOrganization();

  return trpc.orgs.updateMemberRole.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Member role updated successfully!");

      // Invalidate member queries
      if (organizationId) {
        utils.orgs.getMembers.invalidate({ organizationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member role");
    },
  });
}

/**
 * Hook to remove a member from organization (admin only)
 */
export function useRemoveMember() {
  const utils = trpc.useUtils();
  const { organizationId } = useCurrentOrganization();

  return trpc.orgs.removeMember.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Member removed successfully!");

      // Invalidate member queries
      if (organizationId) {
        utils.orgs.getMembers.invalidate({ organizationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });
}

/**
 * Hook to leave an organization
 */
export function useLeaveOrganization() {
  const utils = trpc.useUtils();
  const router = useRouter();

  return trpc.orgs.leaveOrganization.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "You have left the organization");

      // Invalidate organizations list to refresh available orgs
      utils.orgs.getAll.invalidate();

      // The context will automatically switch to another org or show no org state
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave organization");
    },
  });
}
