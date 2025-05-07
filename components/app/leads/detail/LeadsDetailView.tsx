"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDeleteLead } from "@/hooks/use-leads";
import {
  daysSinceLastContact,
  daysUntilNextFollowUp,
  getLeadStatusIndicator,
} from "@/lib/leads/utils/lead-utils";

import {
  ArrowLeft,
  Mail,
  Phone,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Tag,
  CalendarClock,
  DollarSign,
  FileText,
  MessageSquare,
  PlusCircle,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LeadsDetailViewProps {
  lead: LeadWithTags;
}

export function LeadsDetailView({ lead }: LeadsDetailViewProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteLead, isLoading: isDeleting } = useDeleteLead();

  // Extract lead status and timing information
  const statusInfo = getLeadStatusIndicator(lead);
  const lastContactDays = daysSinceLastContact(lead);
  const nextFollowUpDays = daysUntilNextFollowUp(lead);

  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    return format(new Date(date), "PPP");
  };

  const formatRelativeTime = (days: number | null) => {
    if (days === null) return "Not available";
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const formatUpcomingTime = (days: number | null) => {
    if (days === null) return "Not scheduled";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  const formatTimeframe = (timeframe: string | null | undefined) => {
    if (!timeframe) return "Not specified";
    return timeframe
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get status badge color
  const getStatusColor = (category: string) => {
    switch (category) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "qualified":
        return "bg-purple-100 text-purple-800";
      case "converting":
        return "bg-amber-100 text-amber-800";
      case "converted":
        return "bg-green-100 text-green-800";
      case "dormant":
        return "bg-gray-100 text-gray-800";
      case "reactivated":
        return "bg-indigo-100 text-indigo-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority label and color
  const getPriorityInfo = (priority: number | null) => {
    if (priority === null || priority === undefined)
      return { label: "Not set", color: "bg-gray-100 text-gray-800" };

    switch (priority) {
      case 1:
        return { label: "Very High", color: "bg-red-100 text-red-800" };
      case 2:
        return { label: "High", color: "bg-orange-100 text-orange-800" };
      case 3:
        return { label: "Medium", color: "bg-yellow-100 text-yellow-800" };
      case 4:
        return { label: "Low", color: "bg-blue-100 text-blue-800" };
      case 5:
        return { label: "Very Low", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: "Not set", color: "bg-gray-100 text-gray-800" };
    }
  };

  const priorityInfo = getPriorityInfo(lead.priority);

  const handleDelete = async () => {
    try {
      await deleteLead(lead.id);
      toast.success("Lead deleted successfully");
      router.push("/leads");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to leads</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Lead Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/leads/${lead.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Lead</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this lead? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-semibold">
                    This will permanently delete &quot;{lead.name}&quot;
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Lead"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lead Overview Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>{lead.name}</span>
            <Badge
              variant="outline"
              className={getStatusColor(statusInfo.category)}
            >
              {formatStatus(lead.status)}
            </Badge>
          </CardTitle>
          <CardDescription>
            Added on {formatDate(lead.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Information
              </h3>

              <div className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{lead.email}</div>
                    </div>
                  </div>
                )}

                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{lead.phone}</div>
                    </div>
                  </div>
                )}

                {!lead.email && !lead.phone && (
                  <div className="text-sm text-muted-foreground italic">
                    No contact information provided
                  </div>
                )}
              </div>
            </div>

            {/* Lead Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Lead Status
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Last Contact
                    </div>
                    <div className="font-medium">
                      {lead.lastContactedAt
                        ? formatRelativeTime(lastContactDays)
                        : "Never contacted"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Next Follow-up
                    </div>
                    <div className="font-medium">
                      {lead.nextFollowUpDate
                        ? formatUpcomingTime(nextFollowUpDays)
                        : "Not scheduled"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Priority
                    </div>
                    <div className="font-medium flex items-center gap-2">
                      {priorityInfo.label}
                      <Badge variant="outline" className={priorityInfo.color}>
                        {lead.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Additional Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Expected Purchase
                    </div>
                    <div className="font-medium">
                      {formatTimeframe(lead.expectedPurchaseTimeframe)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Budget</div>
                    <div className="font-medium">
                      {lead.budget || "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Tags</div>
                    <div className="font-medium">
                      {lead.tags && lead.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {lead.tags.map((tag) => (
                            <div
                              key={tag.id}
                              className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                              style={{
                                backgroundColor: tag.color
                                  ? `${tag.color}20`
                                  : "#e5e7eb",
                                borderColor: tag.color ? tag.color : "#d1d5db",
                              }}
                            >
                              <span>{tag.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">
                          No tags
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="interactions" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-8">
          <TabsTrigger value="interactions">
            <MessageSquare className="h-4 w-4 mr-2" />
            Interactions
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="emails">
            <Mail className="h-4 w-4 mr-2" />
            Emails
          </TabsTrigger>
        </TabsList>

        {/* Interactions Tab */}
        <TabsContent value="interactions">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Interactions</h3>
            <Button asChild>
              <Link
                href={`/leads/${lead.id}/interactions`}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Interaction
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No interactions yet
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Track your meetings, calls, and messages with this lead to
                  keep everything organized.
                </p>
                <Button className="mt-4" asChild>
                  <Link
                    href={`/leads/${lead.id}/interactions`}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Record First Interaction
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <Button asChild>
              <Link
                href={`/leads/${lead.id}/tasks`}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tasks assigned</h3>
                <p className="text-muted-foreground max-w-md">
                  Create tasks to track follow-ups, deadlines, and actions
                  needed for this lead.
                </p>
                <Button className="mt-4" asChild>
                  <Link
                    href={`/leads/${lead.id}/tasks`}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create First Task
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Notes</h3>
            <Button asChild>
              <Link
                href={`/leads/${lead.id}/notes`}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Note
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes recorded</h3>
                <p className="text-muted-foreground max-w-md">
                  Keep important information and context about this lead by
                  adding notes.
                </p>
                <Button className="mt-4" asChild>
                  <Link
                    href={`/leads/${lead.id}/notes`}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Note
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Emails</h3>
            <Button asChild>
              <Link
                href={`/leads/${lead.id}/emails`}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Send Email
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No emails sent</h3>
                <p className="text-muted-foreground max-w-md">
                  Send and track emails to communicate with this lead directly
                  from the CRM.
                </p>
                <Button className="mt-4" asChild>
                  <Link
                    href={`/leads/${lead.id}/emails`}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Compose Email
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
