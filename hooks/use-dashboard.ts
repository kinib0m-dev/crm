import { trpc } from "@/trpc/client";

export function useDashboardSummary() {
  const { data, isLoading, isError, error, refetch } =
    trpc.dashboard.getSummary.useQuery(undefined, {
      staleTime: 30 * 1000, // 30 seconds
    });

  return {
    summary: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
