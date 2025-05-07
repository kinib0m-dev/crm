import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  CreateCarStockSchema,
  FilterCarStockSchema,
  UpdateCarStockSchema,
} from "@/lib/validation/car-stock-schema";
import { useRouter } from "next/navigation";

/**
 * Hook for car stock listing with filtering and pagination
 */
export function useCarStockList(
  initialFilters: Partial<FilterCarStockSchema> = {}
) {
  // Default filters
  const defaultFilters: FilterCarStockSchema = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortDirection: "desc",
    ...initialFilters,
  };

  // State for filters
  const [filters, setFilters] = useState<FilterCarStockSchema>(defaultFilters);

  // Fetch car stock items with trpc
  const { data, isLoading, isError, error, refetch } =
    trpc.carStock.list.useQuery(filters, {
      staleTime: 30 * 1000, // 30 seconds
    });

  // Computed properties
  const carStockItems = data?.carStock || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  };

  // Update filters
  const updateFilters = (newFilters: Partial<FilterCarStockSchema>) => {
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
    carStockItems,
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
 * Hook for car stock creation
 */
export function useCreateCarStock() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.carStock.create.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch car stock list
      utils.carStock.list.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error creating car stock item: ${error.message}`);
    },
  });

  const createCarStock = async (carStockItem: CreateCarStockSchema) => {
    try {
      return await mutation.mutateAsync(carStockItem);
    } catch (error) {
      console.error("Error creating car stock item:", error);
      throw error;
    }
  };

  return {
    createCarStock,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for fetching a single car stock item by ID
 */
export function useCarStock(id: string) {
  const enabled = !!id;

  const { data, isLoading, isError, error, refetch } =
    trpc.carStock.getById.useQuery(
      { id },
      {
        enabled,
        staleTime: 30 * 1000, // 30 seconds
      }
    );

  return {
    carStock: data?.carStock,
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook for updating a car stock item
 */
export function useUpdateCarStock() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.carStock.update.useMutation({
    onSuccess: (data) => {
      // Invalidate queries to refetch car stock items
      utils.carStock.list.invalidate();
      utils.carStock.getById.invalidate({ id: data.carStock.id });
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error updating car stock item: ${error.message}`);
    },
  });

  const updateCarStock = async (carStockItem: UpdateCarStockSchema) => {
    try {
      return await mutation.mutateAsync(carStockItem);
    } catch (error) {
      console.error("Error updating car stock item:", error);
      throw error;
    }
  };

  return {
    updateCarStock,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for deleting a car stock item
 */
export function useDeleteCarStock() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.carStock.delete.useMutation({
    onSuccess: () => {
      utils.carStock.list.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error deleting car stock item: ${error.message}`);
    },
  });

  const deleteCarStock = async (id: string) => {
    try {
      return await mutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error deleting car stock item:", error);
      throw error;
    }
  };

  return {
    deleteCarStock,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

/**
 * Hook for hard deleting a car stock item
 */
export function useHardDeleteCarStock() {
  const utils = trpc.useUtils();
  const router = useRouter();

  const mutation = trpc.carStock.hardDelete.useMutation({
    onSuccess: () => {
      utils.carStock.list.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        `Error permanently deleting car stock item: ${error.message}`
      );
    },
  });

  const hardDeleteCarStock = async (id: string) => {
    try {
      return await mutation.mutateAsync({ id });
    } catch (error) {
      console.error("Error hard deleting car stock item:", error);
      throw error;
    }
  };

  return {
    hardDeleteCarStock,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
