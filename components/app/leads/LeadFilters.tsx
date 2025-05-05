"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { LeadFilterInput } from "@/lib/validation/lead-schema";

type LeadFiltersProps = {
  filters: LeadFilterInput;
  updateFilters: (filters: Partial<LeadFilterInput>) => void;
  resetFilters: () => void;
};

// Define sortBy and sortDirection types explicitly
type SortByOption = "status" | "priority" | "name" | "createdAt";
type SortDirectionOption = "asc" | "desc";

export function LeadFilters({
  filters,
  updateFilters,
  resetFilters,
}: LeadFiltersProps) {
  // Local state for filter inputs before applying them
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Apply search filter when user presses Enter or clicks search button
  const handleSearch = () => {
    updateFilters({ search: searchInput, page: 1 });
  };

  // Handle key press event for search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchInput("");
    resetFilters();
  };

  // Helper function to cast string to LeadStatus
  const handleStatusChange = (value: string) => {
    // Cast to LeadStatus or undefined
    const status = value ? (value as LeadStatus) : undefined;
    updateFilters({ status, page: 1 });
  };

  // Helper function to cast string to Timeframe
  const handleTimeframeChange = (value: string) => {
    // Cast to Timeframe or undefined
    const timeframe = value ? (value as Timeframe) : undefined;
    updateFilters({ timeframe, page: 1 });
  };

  // Helper function to handle sort option changes
  const handleSortChange = (value: string) => {
    const [sortByValue, sortDirectionValue] = value.split(":") as [
      string,
      string,
    ];

    // Cast to appropriate types
    const sortBy = sortByValue as SortByOption;
    const sortDirection = sortDirectionValue as SortDirectionOption;

    updateFilters({ sortBy, sortDirection, page: 1 });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search leads..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Status filter */}
          <Select
            value={filters.status || "all_statuses"}
            onValueChange={(value) =>
              handleStatusChange(value === "all_statuses" ? "" : value)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All Statuses</SelectItem>
              <SelectItem value="new_lead">New Lead</SelectItem>
              <SelectItem value="initial_contact">Initial Contact</SelectItem>
              <SelectItem value="awaiting_response">
                Awaiting Response
              </SelectItem>
              <SelectItem value="engaged">Engaged</SelectItem>
              <SelectItem value="information_gathering">
                Information Gathering
              </SelectItem>
              <SelectItem value="high_interest">High Interest</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="appointment_scheduled">
                Appointment Scheduled
              </SelectItem>
              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={filters.priority?.toString() || "all_priorities"}
            onValueChange={(value) =>
              updateFilters({
                priority:
                  value !== "all_priorities" ? parseInt(value) : undefined,
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_priorities">All Priorities</SelectItem>
              <SelectItem value="1">1 - Highest</SelectItem>
              <SelectItem value="2">2 - High</SelectItem>
              <SelectItem value="3">3 - Medium</SelectItem>
              <SelectItem value="4">4 - Low</SelectItem>
              <SelectItem value="5">5 - Lowest</SelectItem>
            </SelectContent>
          </Select>

          {/* Timeframe filter */}
          <Select
            value={filters.timeframe || "all_timeframes"}
            onValueChange={(value) =>
              handleTimeframeChange(value === "all_timeframes" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_timeframes">All Timeframes</SelectItem>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="1-3 months">1-3 Months</SelectItem>
              <SelectItem value="3-6 months">3-6 Months</SelectItem>
              <SelectItem value="6+ months">6+ Months</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort filter */}
          <Select
            value={`${filters.sortBy || "createdAt"}:${filters.sortDirection || "desc"}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest first</SelectItem>
              <SelectItem value="createdAt:asc">Oldest first</SelectItem>
              <SelectItem value="name:asc">Name A-Z</SelectItem>
              <SelectItem value="name:desc">Name Z-A</SelectItem>
              <SelectItem value="priority:asc">
                Priority (High to Low)
              </SelectItem>
              <SelectItem value="priority:desc">
                Priority (Low to High)
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
