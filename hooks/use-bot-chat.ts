import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useBotConversations() {
  const { data, isLoading, error, refetch } =
    trpc.botChat.listConversations.useQuery();

  return {
    conversations: data?.conversations || [],
    isLoading,
    error,
    refetch,
  };
}

export function useConversation(id: string) {
  const { data, isLoading, error, refetch } =
    trpc.botChat.getConversation.useQuery(
      { id },
      {
        enabled: !!id,
        refetchInterval: false,
      }
    );

  return {
    conversation: data?.conversation,
    messages: data?.messages || [],
    isLoading,
    error,
    refetch,
  };
}

export function useCreateConversation() {
  const utils = trpc.useUtils();
  const mutation = trpc.botChat.createConversation.useMutation({
    onSuccess: () => {
      utils.botChat.listConversations.invalidate();
    },
    onError: (error) => {
      toast.error(`Error creating conversation: ${error.message}`);
    },
  });

  const createConversation = async (name: string) => {
    try {
      return await mutation.mutateAsync({ name });
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  return {
    createConversation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useSendMessage() {
  const utils = trpc.useUtils();
  const mutation = trpc.botChat.sendMessage.useMutation({
    onSuccess: (_, variables) => {
      utils.botChat.getConversation.invalidate({
        id: variables.conversationId,
      });
    },
    onError: (error) => {
      toast.error(`Error sending message: ${error.message}`);
    },
  });

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      return await mutation.mutateAsync({ conversationId, content });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return {
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteConversation() {
  const utils = trpc.useUtils();
  const mutation = trpc.botChat.deleteConversation.useMutation({
    onSuccess: () => {
      utils.botChat.listConversations.invalidate();
    },
    onError: (error) => {
      toast.error(`Error deleting conversation: ${error.message}`);
    },
  });

  const deleteConversation = async (id: string) => {
    try {
      return await mutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  };

  return {
    deleteConversation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
