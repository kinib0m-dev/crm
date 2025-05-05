"use client";

import { useLeadList, useLeadStats } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { StatsCards } from "./StatsCards";
import { LeadFilters } from "./LeadFilters";
import { LeadTable } from "./LeadTable";
import { LeadPagination } from "./LeadPagination";
import { CreateLeadModal } from "./CreateLeadModal";

type LeadDashboardViewProps = {
  leads: LeadWithTags[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: LeadStats | null;
};

export function LeadDashboardView({
  leads: initialLeads,
  pagination: initialPagination,
  stats: initialStats,
}: LeadDashboardViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Stats are handled separately
  const { stats } = useLeadStats();
  const displayStats = stats || initialStats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with create button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Stats overview */}
      <StatsCards stats={displayStats} />

      {/* Filters */}
      <LeadFilters
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
      />

      {/* Leads table */}
      <LeadTable leads={displayLeads} isLoading={isLoading} />

      {/* Pagination */}
      <LeadPagination pagination={displayPagination} goToPage={goToPage} />

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
