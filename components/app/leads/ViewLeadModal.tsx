"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  MessageCircle,
  FileText,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { EditLeadModal } from "./EditLeadModal";

// Define a helper function to get lead status indicator that works with LeadWithTags
interface StatusIndicator {
  category: string;
  color: string;
}

const getLeadStatusIndicatorFixed = (status: LeadStatus): StatusIndicator => {
  // Map statuses to their categories and colors
  switch (status) {
    case "new_lead":
    case "initial_contact":
      return { category: "new", color: "blue" };

    case "awaiting_response":
    case "engaged":
    case "information_gathering":
    case "high_interest":
      return { category: "engaged", color: "yellow" };

    case "qualified":
    case "appointment_scheduled":
      return { category: "qualified", color: "green" };

    case "proposal_sent":
    case "negotiation":
      return { category: "converting", color: "purple" };

    case "converted":
      return { category: "converted", color: "green" };

    case "purchased_elsewhere":
    case "future_opportunity":
    case "periodic_nurture":
      return { category: "nurture", color: "orange" };

    case "reactivated":
      return { category: "reactivated", color: "purple" };

    case "unsubscribed":
    case "invalid":
      return { category: "closed", color: "gray" };

    default:
      return { category: "other", color: "gray" };
  }
};

type ViewLeadModalProps = {
  lead: LeadWithTags;
  isOpen: boolean;
  onClose: () => void;
};

export function ViewLeadModal({ lead, isOpen, onClose }: ViewLeadModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Format the created date
  const formattedCreatedDate = new Date(lead.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Get status indicator using our fixed function
  const { color: statusColor } = getLeadStatusIndicatorFixed(lead.status);

  // Format the status text
  const formattedStatus = lead.status
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Create fixed versions of utility functions to work with LeadWithTags
  const getLastContactDays = (lead: LeadWithTags): number | null => {
    if (!lead.lastContactedAt) return null;

    const today = new Date();
    const lastContact = new Date(lead.lastContactedAt);
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getNextFollowUpDays = (lead: LeadWithTags): number | null => {
    if (!lead.nextFollowUpDate) return null;

    const today = new Date();
    const followUpDate = new Date(lead.nextFollowUpDate);
    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Last contact days
  const lastContactDays = getLastContactDays(lead);

  // Next follow-up days
  const nextFollowUpDays = getNextFollowUpDays(lead);

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl">Lead Details</DialogTitle>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              {/* Header section with avatar and name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {lead.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{lead.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}
                    >
                      {formattedStatus}
                    </Badge>
                    {lead.tags && lead.tags.length > 0 && (
                      <div className="flex gap-1 ml-2">
                        {lead.tags.map((tag: TagEntity) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Lead details */}
              <div className="space-y-3">
                <h3 className="font-semibold">Lead Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="font-medium">
                      {lead.priority !== null ? (
                        <>
                          {lead.priority} -{" "}
                          {lead.priority === 1
                            ? "Highest"
                            : lead.priority === 2
                              ? "High"
                              : lead.priority === 3
                                ? "Medium"
                                : lead.priority === 4
                                  ? "Low"
                                  : lead.priority === 5
                                    ? "Lowest"
                                    : "Unknown"}
                        </>
                      ) : (
                        "Not set"
                      )}
                    </span>
                  </div>
                  {lead.expectedPurchaseTimeframe && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Purchase Timeframe:
                      </span>
                      <span className="font-medium">
                        {lead.expectedPurchaseTimeframe}
                      </span>
                    </div>
                  )}
                  {lead.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{lead.budget}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{formattedCreatedDate}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Follow-up information */}
              <div className="space-y-3">
                <h3 className="font-semibold">Follow-up Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lead.lastContactedAt ? (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Last Contact:
                      </span>
                      <span className="font-medium">
                        {new Date(lead.lastContactedAt).toLocaleDateString()}
                        {lastContactDays !== null &&
                          ` (${lastContactDays} days ago)`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Last Contact:
                      </span>
                      <span className="text-muted-foreground italic">
                        Not contacted yet
                      </span>
                    </div>
                  )}
                  {lead.nextFollowUpDate ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Next Follow-up:
                      </span>
                      <span className="font-medium">
                        {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                        {nextFollowUpDays !== null &&
                          ` (in ${nextFollowUpDays} days)`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Next Follow-up:
                      </span>
                      <span className="text-muted-foreground italic">
                        Not scheduled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Recent Activities</h3>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Log Interaction
                </Button>
              </div>

              {/* Placeholder for activities - to be implemented in phase 4 */}
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No activities recorded yet</p>
                <p className="text-sm">
                  Activities will be tracked when you log interactions with this
                  lead
                </p>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Notes</h3>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {/* Placeholder for notes - to be implemented in phase 4 */}
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notes added yet</p>
                <p className="text-sm">
                  Add notes to keep track of important information about this
                  lead
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">ID: {lead.id}</p>
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Modal */}
      {isEditModalOpen && (
        <EditLeadModal
          lead={lead}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
}
