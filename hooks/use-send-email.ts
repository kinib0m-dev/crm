import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { SendEmailSchema } from "@/lib/validation/email-templates-schema";

/**
 * Hook for fetching email templates
 */
export function useEmailTemplates() {
  const { data, isLoading, isError, error } = trpc.emailTemplate.list.useQuery(
    {
      page: 1,
      limit: 100, // Get all templates since we'll display them in a select
      sortBy: "name",
      sortDirection: "asc",
    },
    {
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  return {
    templates: data?.templates || [],
    isLoading,
    isError,
    error,
  };
}

/**
 * Hook for sending emails
 */
export function useSendEmails() {
  const utils = trpc.useUtils();

  const mutation = trpc.emailTemplate.sendEmails.useMutation({
    onSuccess: () => {
      // Invalidate history queries
      utils.emailTemplate.getEmailHistory.invalidate();
    },
    onError: (error) => {
      toast.error(`Error sending email: ${error.message}`);
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
