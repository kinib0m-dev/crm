import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  CreateEmailTemplateSchema,
  FilterEmailTemplateSchema,
  UpdateEmailTemplateSchema,
  SendEmailSchema,
} from "@/lib/validation/email-templates-schema";
import { useRouter } from "next/navigation";

/**
 * Hook for email template listing with filtering and pagination
 */
export function useEmailTemplateList(
  initialFilters: Partial<FilterEmailTemplateSchema> = {}
) {
  // Default filters
  const defaultFilters: FilterEmailTemplateSchema = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortDirection: "desc",
    ...initialFilters,
  };

  // State for filters
  const [filters, setFilters] =
    useState<FilterEmailTemplateSchema>(defaultFilters);

  // Fetch templates with trpc
  const { data, isLoading, isError, error, refetch } =
    trpc.emailTemplate.list.useQuery(filters, {
      staleTime: 30 * 1000, // 30 seconds
    });

  // Computed properties
  const templates = data?.templates || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  };

  // Update filters
  const updateFilters = (newFilters: Partial<FilterEmailTemplateSchema>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      // Reset to page 1 when filters change (unless page is explicitly specified)
      page: newFilters.page || 1,
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    updateFilters({ page });
  };

  return {
    templates,
    filters,
    pagination,
    isLoading,
    isError,
    error,
    updateFilters,
    resetFilters,
    refetch,
    goToPage,
  };
}

/**
 * Hook for creating a new email template
 */
export function useCreateEmailTemplate() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.emailTemplate.create.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch email template list
      utils.emailTemplate.list.invalidate();
      router.refresh();
      toast.success("Email template created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating email template: ${error.message}`);
    },
  });

  const createTemplate = async (template: CreateEmailTemplateSchema) => {
    try {
      return await mutation.mutateAsync(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      throw error;
    }
  };

  return {
    createTemplate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for fetching a single email template by ID
 */
export function useEmailTemplate(id: string) {
  const enabled = !!id;

  const { data, isLoading, isError, error, refetch } =
    trpc.emailTemplate.getById.useQuery(
      { id },
      {
        enabled,
        staleTime: 30 * 1000, // 30 seconds
      }
    );

  return {
    template: data?.template,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for updating an email template
 */
export function useUpdateEmailTemplate() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.emailTemplate.update.useMutation({
    onSuccess: (data) => {
      // Invalidate queries to refetch templates
      utils.emailTemplate.list.invalidate();
      utils.emailTemplate.getById.invalidate({ id: data.template.id });
      router.refresh();
      toast.success("Email template updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating email template: ${error.message}`);
    },
  });

  const updateTemplate = async (template: UpdateEmailTemplateSchema) => {
    try {
      return await mutation.mutateAsync(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      throw error;
    }
  };

  return {
    updateTemplate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for deleting an email template
 */
export function useDeleteEmailTemplate() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.emailTemplate.delete.useMutation({
    onSuccess: () => {
      utils.emailTemplate.list.invalidate();
      router.push("/emails");
      router.refresh();
      toast.success("Email template deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting email template: ${error.message}`);
    },
  });

  const deleteTemplate = async (id: string) => {
    try {
      return await mutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error deleting email template:", error);
      throw error;
    }
  };

  return {
    deleteTemplate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for counting target leads
 */
export function useCountTargetLeads(id: string) {
  const enabled = !!id;

  const { data, isLoading, isError, error, refetch } =
    trpc.emailTemplate.countTargetLeads.useQuery(
      { id },
      {
        enabled,
        staleTime: 10 * 1000, // 10 seconds
      }
    );

  return {
    count: data?.count || 0,
    targetStatuses: data?.targetStatuses || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for sending emails
 */
export function useSendEmails() {
  const utils = trpc.useUtils();

  const mutation = trpc.emailTemplate.sendEmails.useMutation({
    onSuccess: (data) => {
      // Invalidate history queries
      utils.emailTemplate.getEmailHistory.invalidate();
      toast.success(`Successfully sent emails to ${data.sentCount} lead(s)`);
    },
    onError: (error) => {
      toast.error(`Error sending emails: ${error.message}`);
    },
  });

  const sendEmails = async (params: SendEmailSchema) => {
    try {
      return await mutation.mutateAsync(params);
    } catch (error) {
      console.error("Error sending emails:", error);
      throw error;
    }
  };

  return {
    sendEmails,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for fetching email history
 */
export function useEmailHistory(page = 1, limit = 10) {
  const { data, isLoading, isError, error, refetch } =
    trpc.emailTemplate.getEmailHistory.useQuery(
      { page, limit },
      {
        staleTime: 30 * 1000, // 30 seconds
      }
    );

  return {
    history: data?.history || [],
    pagination: data?.pagination || {
      page,
      limit,
      totalCount: 0,
      totalPages: 0,
    },
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for fetching email history details
 */
export function useEmailHistoryDetails(id: string) {
  const enabled = !!id;

  const { data, isLoading, isError, error, refetch } =
    trpc.emailTemplate.getEmailHistoryDetails.useQuery(
      { id },
      {
        enabled,
        staleTime: 30 * 1000, // 30 seconds
      }
    );

  return {
    historyDetails: data?.history,
    recipients: data?.recipients || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for fetching email history for a specific lead
 */
export function useLeadEmailHistory(leadId: string, limit = 5) {
  const enabled = !!leadId;

  const { data, isLoading, isError, error, refetch } =
    trpc.emailTemplate.getEmailHistoryByLeadId.useQuery(
      { leadId, limit },
      {
        enabled,
        staleTime: 30 * 1000, // 30 seconds
      }
    );

  return {
    history: data?.history || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
