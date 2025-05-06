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
import { FilterLeadSchema } from "@/lib/validation/lead-schema";
import { leadStatusEnum, timeframeEnum } from "@/db/schema";

type LeadFiltersProps = {
  filters: Partial<FilterLeadSchema>;
  updateFilters: (filters: Partial<FilterLeadSchema>) => void;
  resetFilters: () => void;
};

export function LeadFilters({
  filters,
  updateFilters,
  resetFilters,
}: LeadFiltersProps) {
  // Local state for filter inputs before applying them
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // Apply search filter when user presses Enter or clicks search button
  const handleSearch = () => {
    updateFilters({ search: searchInput || undefined, page: 1 });
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

  // Handle status change
  const handleStatusChange = (value: string) => {
    if (value === "all_statuses") {
      updateFilters({ status: undefined, page: 1 });
    } else {
      updateFilters({
        status: value as LeadStatus,
        page: 1,
      });
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    if (value === "all_timeframes") {
      updateFilters({ timeframe: undefined, page: 1 });
    } else {
      updateFilters({
        timeframe: value as Timeframe,
        page: 1,
      });
    }
  };

  // Handle sort option changes
  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split(":") as [
      "name" | "createdAt" | "status" | "priority",
      "asc" | "desc",
    ];

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
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Status filter */}
          <Select
            value={filters.status || "all_statuses"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">All Statuses</SelectItem>
              {leadStatusEnum.enumValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </SelectItem>
              ))}
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
              <SelectItem value="1">1 - Very High</SelectItem>
              <SelectItem value="2">2 - High</SelectItem>
              <SelectItem value="3">3 - Medium</SelectItem>
              <SelectItem value="4">4 - Low</SelectItem>
              <SelectItem value="5">5 - Very Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Timeframe filter */}
          <Select
            value={filters.timeframe || "all_timeframes"}
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_timeframes">All Timeframes</SelectItem>
              {timeframeEnum.enumValues.map((timeframe) => (
                <SelectItem key={timeframe} value={timeframe}>
                  {timeframe
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </SelectItem>
              ))}
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
              <SelectItem value="status:asc">Status A-Z</SelectItem>
              <SelectItem value="status:desc">Status Z-A</SelectItem>
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
