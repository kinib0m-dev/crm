"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  MessageCircle,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { EditLeadModal } from "../EditLeadModal";
import { DeleteLeadDialog } from "../DeleteLeadDialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define a helper function to get lead status indicator
const getLeadStatusIndicatorFixed = (status: LeadStatus) => {
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

export function LeadDetailView({ lead }: { lead: LeadWithTags | undefined }) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!lead) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Lead not found</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Last contact days
  const lastContactDays = getLastContactDays(lead);

  // Next follow-up days
  const nextFollowUpDays = getNextFollowUpDays(lead);

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header with navigation and actions */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Leads
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" size="sm" onClick={handleEditClick}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Lead Detail Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Header section with avatar and name */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {lead.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{lead.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}
                >
                  {formattedStatus}
                </Badge>
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 md:mt-0 md:ml-2">
                    {lead.tags.map((tag: TagEntity) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        style={{
                          borderColor: tag.color ?? "#ccc",
                          color: tag.color ?? "#ccc",
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Contact information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{lead.phone}</span>
                  </div>
                )}
                {!lead.email && !lead.phone && (
                  <div className="text-muted-foreground italic">
                    No contact information provided
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lead details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
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
                    <Clock className="h-5 w-5 text-muted-foreground" />
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
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{lead.budget}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{formattedCreatedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.lastContactedAt ? (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Contact:</span>
                    <span className="font-medium">
                      {new Date(lead.lastContactedAt).toLocaleDateString()}
                      {lastContactDays !== null &&
                        ` (${lastContactDays} days ago)`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Contact:</span>
                    <span className="text-muted-foreground italic">
                      Not contacted yet
                    </span>
                  </div>
                )}
                {lead.nextFollowUpDate ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
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
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Next Follow-up:
                    </span>
                    <span className="text-muted-foreground italic">
                      Not scheduled
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Qualification Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Qualification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Qualification Score:
                  </span>
                  <span className="font-medium">
                    {lead.qualificationScore !== null
                      ? lead.qualificationScore
                      : "Not scored"}
                  </span>
                </div>

                {/* This would be a good place to add qualification criteria checks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    {lead.budget ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                    <span
                      className={
                        lead.budget ? "text-green-700" : "text-slate-600"
                      }
                    >
                      Budget identified
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.expectedPurchaseTimeframe ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                    <span
                      className={
                        lead.expectedPurchaseTimeframe
                          ? "text-green-700"
                          : "text-slate-600"
                      }
                    >
                      Timeframe established
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.priority !== null && lead.priority <= 3 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                    <span
                      className={
                        lead.priority !== null && lead.priority <= 3
                          ? "text-green-700"
                          : "text-slate-600"
                      }
                    >
                      High/Medium priority
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.lastContactedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300" />
                    )}
                    <span
                      className={
                        lead.lastContactedAt
                          ? "text-green-700"
                          : "text-slate-600"
                      }
                    >
                      Initial contact made
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            </CardHeader>
            <CardContent>
              {/* Placeholder for activities - to be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No activities recorded yet</p>
                <p className="text-sm">
                  Activities will be tracked when you log interactions with this
                  lead
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Notes</CardTitle>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {/* Placeholder for notes - to be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notes added yet</p>
                <p className="text-sm">
                  Add notes to keep track of important information about this
                  lead
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Lead Modal */}
      {isEditModalOpen && (
        <EditLeadModal
          lead={lead}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Lead Dialog */}
      {isDeleteDialogOpen && (
        <DeleteLeadDialog
          lead={lead}
          isOpen={isDeleteDialogOpen}
          onClose={(deleted = false) => {
            setIsDeleteDialogOpen(false);
            // Navigate back to leads list if the lead was deleted
            if (deleted) {
              router.push("/dashboard");
            }
          }}
        />
      )}
    </div>
  );
}
