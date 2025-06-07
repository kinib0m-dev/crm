"use client";

import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Hook to create a new organization
 */
export function useCreateOrganization() {
  const utils = trpc.useUtils();
  const router = useRouter();

  return trpc.orgs.create.useMutation({
    onSuccess: () => {
      toast.success("Organization created successfully!");

      // Invalidate organizations list
      utils.orgs.getAll.invalidate();
      router.refresh();
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
