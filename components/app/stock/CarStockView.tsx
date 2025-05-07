"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { LeadPagination } from "../leads/LeadPagination";
import { useCarStockList } from "@/hooks/use-car-stock";
import { CarStockTable } from "./CarStockTable";
import { CarStockFilters } from "./CarStockFilter";

type CarStockItemType = {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
  url: string | null;
  notes: string | null;
  embedding: number[] | null;
  isDeleted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type CarStockViewProps = {
  carStockItems: CarStockItemType[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

export function CarStockView({
  carStockItems: initialItems,
  pagination: initialPagination,
}: CarStockViewProps) {
  // Use the custom hooks to manage data and filters
  const {
    carStockItems,
    filters,
    pagination,
    isLoading,
    updateFilters,
    resetFilters,
    goToPage,
  } = useCarStockList();

  // Use the real data from the hooks if available, otherwise use the initial data
  const displayItems = isLoading ? initialItems : carStockItems;
  const displayPagination = isLoading ? initialPagination : pagination;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with create button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Car Stock Management</h1>
        <Button asChild>
          <Link href="/car-stock/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Car
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <CarStockFilters
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />

      {/* Car stock table */}
      <CarStockTable
        carStockItems={displayItems}
        isLoading={isLoading}
        currentFilters={filters}
        updateFilters={updateFilters}
      />

      {/* Pagination */}
      <LeadPagination pagination={displayPagination} goToPage={goToPage} />
    </div>
  );
}
