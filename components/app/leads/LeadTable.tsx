"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { daysSinceLastContact } from "@/lib/leads/utils/lead-utils";
import { formatDistanceToNow } from "date-fns";
import { FilterLeadSchema } from "@/lib/validation/lead-schema";

interface LeadTableProps {
  leads: LeadWithTags[];
  isLoading: boolean;
  currentFilters: Partial<FilterLeadSchema>;
  updateFilters: (filters: Partial<FilterLeadSchema>) => void;
}

export function LeadTable({
  leads,
  isLoading,
  currentFilters,
  updateFilters,
}: LeadTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead_entrante":
        return "bg-blue-100 text-blue-800";
      case "en_conversacion":
        return "bg-indigo-100 text-indigo-800";
      case "opciones_enviadas":
        return "bg-indigo-100 text-indigo-800";
      case "vehiculo_elegido":
        return "bg-purple-100 text-purple-800";
      case "asesor":
        return "bg-violet-100 text-violet-800";
      case "venta_realizada":
        return "bg-green-100 text-green-800";
      case "sin_opcion":
        return "bg-amber-100 text-amber-800";
      case "no_cualificado":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatPriority = (priority: number | null) => {
    switch (priority) {
      case 1:
        return "Very High";
      case 2:
        return "High";
      case 3:
        return "Medium";
      case 4:
        return "Low";
      case 5:
        return "Very Low";
      default:
        return "N/A";
    }
  };

  const getPriorityColor = (priority: number | null) => {
    switch (priority) {
      case 1:
      case 2:
        return "border-red-200 text-red-800";
      case 3:
        return "border-amber-200 text-amber-800";
      case 4:
      case 5:
        return "border-gray-200 text-gray-800";
      default:
        return "";
    }
  };

  const handleSort = (column: "name" | "createdAt" | "status" | "priority") => {
    const direction =
      currentFilters.sortBy === column && currentFilters.sortDirection === "asc"
        ? "desc"
        : "asc";
    updateFilters({ sortBy: column, sortDirection: direction });
  };

  const SortIndicator = ({ column }: { column: string }) =>
    currentFilters.sortBy === column ? (
      <span className="ml-1 inline-block w-3">
        {currentFilters.sortDirection === "asc" ? "↑" : "↓"}
      </span>
    ) : null;

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No leads found</h3>
        <p className="text-muted-foreground">
          {isLoading
            ? "Loading leads..."
            : "Try adjusting your filters or add a new lead to get started."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/leads/new">Add Your First Lead</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead
              onClick={() => handleSort("name")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Name <SortIndicator column="name" />
              </div>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Campaign ID</TableHead>
            <TableHead
              onClick={() => handleSort("status")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Status <SortIndicator column="status" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("priority")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Priority <SortIndicator column="priority" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort("createdAt")}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                Created <SortIndicator column="createdAt" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell>
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium hover:underline"
                >
                  {lead.name}
                </Link>
                {lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lead.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs py-0"
                        style={{
                          borderColor: tag.color || undefined,
                          color: tag.color || undefined,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {lead.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs py-0">
                        +{lead.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  {lead.email && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </div>
                  )}
                  {!lead.email && !lead.phone && (
                    <span className="text-muted-foreground italic">
                      No contact info
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{lead.campaignId}</TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(lead.status)} border-none font-normal`}
                >
                  {formatStatus(lead.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getPriorityColor(lead.priority)}
                >
                  {formatPriority(lead.priority)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {lead.createdAt
                  ? formatDistanceToNow(new Date(lead.createdAt), {
                      addSuffix: true,
                    })
                  : "N/A"}
                <div className="text-xs">
                  {lead.lastContactedAt ? (
                    <span>
                      Last contact: {daysSinceLastContact(lead)} day(s) ago
                    </span>
                  ) : (
                    <span>Never contacted</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/leads/${lead.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/leads/${lead.id}/edit`}>Edit Lead</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/leads/${lead.id}/notes`}>Add Note</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
