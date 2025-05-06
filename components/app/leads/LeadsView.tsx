"use client";

import { useLeadList } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { LeadTable } from "./LeadTable";
import { LeadFilters } from "./LeadFilters";
import { LeadPagination } from "./LeadPagination";

type LeadsViewProps = {
  leads: LeadWithTags[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

export function LeadsView({
  leads: initialLeads,
  pagination: initialPagination,
}: LeadsViewProps) {
  // Use the custom hooks to manage data and filters
  const {
    leads,
    filters,
    pagination,
    isLoading,
    updateFilters,
    resetFilters,
    goToPage,
  } = useLeadList();

  // Use the real data from the hooks if available, otherwise use the initial data
  const displayLeads = isLoading ? initialLeads : leads;
  const displayPagination = isLoading ? initialPagination : pagination;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with create button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <Button asChild>
          <Link href="/leads/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Lead
          </Link>
        </Button>
      </div>
      {/* Filters */}
      <LeadFilters
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />

      {/* Leads table */}
      <LeadTable
        leads={displayLeads}
        isLoading={isLoading}
        currentFilters={filters}
        updateFilters={updateFilters}
      />

      {/* Pagination */}
      <LeadPagination pagination={displayPagination} goToPage={goToPage} />
    </div>
  );
}
