"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { getLeadStatusIndicator } from "@/lib/leads/utils/lead-utils";
import { ViewLeadModal } from "./ViewLeadModal";
import { EditLeadModal } from "./EditLeadModal";
import { DeleteLeadDialog } from "./DeleteLeadDialog";

// Create a type for contact info to handle email and phone
type ContactInfo = {
  type: "email" | "phone";
  value: string;
};

// Define the formatLeadContact function with appropriate types
const formatLeadContactFixed = (lead: LeadWithTags): ContactInfo[] => {
  const contacts: ContactInfo[] = [];

  if (lead.email) {
    contacts.push({ type: "email", value: lead.email });
  }

  if (lead.phone) {
    contacts.push({ type: "phone", value: lead.phone });
  }

  return contacts;
};

type LeadTableProps = {
  leads: LeadWithTags[];
  isLoading: boolean;
};

export function LeadTable({ leads, isLoading }: LeadTableProps) {
  // State for managing modals
  const [selectedLead, setSelectedLead] = useState<LeadWithTags | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Function to open the view modal
  const handleView = (lead: LeadWithTags) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  // Function to open the edit modal
  const handleEdit = (lead: LeadWithTags) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  // Function to open the delete dialog
  const handleDelete = (lead: LeadWithTags) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-md">
              <thead className="bg-muted text-left text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Timeframe</th>
                  <th className="px-4 py-3.5">Tags</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted">
                {leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      {isLoading
                        ? "Loading leads..."
                        : "No leads found. Try different filters or add a new lead."}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3.5 text-sm">
                        <div className="font-medium">{lead.name}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        {/* Fixed contact info display */}
                        <div className="space-y-1">
                          {formatLeadContactFixed(lead).map((contact, i) => (
                            <div key={i} className="text-muted-foreground">
                              {contact.value}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <LeadStatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <PriorityIndicator priority={lead.priority} />
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        {lead.expectedPurchaseTimeframe || "Not specified"}
                      </td>
                      <td className="px-4 py-3.5 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {(lead.tags || [])
                            .slice(0, 2)
                            .map((tag: TagEntity) => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                style={{
                                  borderColor: tag.color,
                                  color: tag.color,
                                }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          {(lead.tags || []).length > 2 && (
                            <Badge variant="outline">
                              +{lead.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(lead)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(lead)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(lead)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Lead Modal */}
      {selectedLead && (
        <ViewLeadModal
          lead={selectedLead}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {/* Edit Lead Modal */}
      {selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Lead Dialog */}
      {selectedLead && (
        <DeleteLeadDialog
          lead={selectedLead}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
}

// Helper components for status and priority indicators
function LeadStatusBadge({ status }: { status: LeadStatus }) {
  // Get status indicator based on the lead status
  const { category, color } = getLeadStatusIndicator({ status } as any);

  // Define variant and text based on category
  let variant: "default" | "secondary" | "outline" = "outline";

  switch (category) {
    case "new":
      variant = "secondary";
      break;
    case "qualified":
    case "converting":
    case "converted":
      variant = "default";
      break;
    default:
      variant = "outline";
  }

  // Format the status text for display
  const formattedStatus = status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Badge
      variant={variant}
      className={`bg-${color}-100 text-${color}-800 border-${color}-200`}
    >
      {formattedStatus}
    </Badge>
  );
}

function PriorityIndicator({ priority }: { priority: number | null }) {
  const getPriorityColor = (priority: number | null) => {
    switch (priority) {
      case 1:
        return "text-red-500";
      case 2:
        return "text-orange-500";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-green-500";
      case 5:
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 1:
        return "Highest";
      case 2:
        return "High";
      case 3:
        return "Medium";
      case 4:
        return "Low";
      case 5:
        return "Lowest";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex items-center">
      <span className={`font-medium ${getPriorityColor(priority)}`}>
        {priority ? `${priority} - ${getPriorityLabel(priority)}` : "Not set"}
      </span>
    </div>
  );
}
