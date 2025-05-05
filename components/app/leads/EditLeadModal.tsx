"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateLeadSchema,
  UpdateLeadInput,
} from "@/lib/validation/lead-schema";
import { useUpdateLead } from "@/hooks/use-leads";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type EditLeadModalProps = {
  lead: LeadWithTags;
  isOpen: boolean;
  onClose: () => void;
};

export function EditLeadModal({ lead, isOpen, onClose }: EditLeadModalProps) {
  const { updateLead, isLoading } = useUpdateLead();
  const [formError, setFormError] = useState<string | null>(null);

  // Helper function to convert null to undefined for priority
  const nullToUndefinedPriority = (val: number | null): number | undefined => {
    return val !== null ? val : undefined;
  };

  // Helper function to convert null to undefined for timeframe
  const nullToUndefinedTimeframe = (
    val: Timeframe | null
  ): Timeframe | undefined => {
    return val !== null ? val : undefined;
  };

  // Initialize form with lead values, converting nulls to undefineds
  const form = useForm<UpdateLeadInput>({
    resolver: zodResolver(updateLeadSchema) as any,
    defaultValues: {
      id: lead.id,
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      status: lead.status as LeadStatus,
      priority: nullToUndefinedPriority(lead.priority),
      expectedPurchaseTimeframe: nullToUndefinedTimeframe(
        lead.expectedPurchaseTimeframe
      ),
      budget: lead.budget || "",
    },
  });

  // Update form values when lead changes
  useEffect(() => {
    if (lead) {
      form.reset({
        id: lead.id,
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        status: lead.status as LeadStatus,
        priority: nullToUndefinedPriority(lead.priority),
        expectedPurchaseTimeframe: nullToUndefinedTimeframe(
          lead.expectedPurchaseTimeframe
        ),
        budget: lead.budget || "",
      });
    }
  }, [lead, form]);

  // Helper functions for handling status and timeframe changes
  const handleStatusChange = (
    value: string,
    onChange: (value: LeadStatus) => void
  ) => {
    onChange(value as LeadStatus);
  };

  const handleTimeframeChange = (
    value: string,
    onChange: (value: Timeframe | undefined) => void
  ) => {
    // Convert "not_specified" to undefined
    onChange(value === "not_specified" ? undefined : (value as Timeframe));
  };

  // Submit handler
  const onSubmit = async (data: UpdateLeadInput) => {
    try {
      setFormError(null);
      await updateLead(data);
      onClose();
    } catch (error) {
      setFormError(
        "An error occurred while updating the lead. Please try again."
      );
      console.error("Error updating lead:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden ID field */}
            <input type="hidden" {...form.register("id")} />

            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lead name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grid layout for status, priority and timeframe */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        handleStatusChange(value, field.onChange)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new_lead">New Lead</SelectItem>
                        <SelectItem value="initial_contact">
                          Initial Contact
                        </SelectItem>
                        <SelectItem value="awaiting_response">
                          Awaiting Response
                        </SelectItem>
                        <SelectItem value="engaged">Engaged</SelectItem>
                        <SelectItem value="information_gathering">
                          Information Gathering
                        </SelectItem>
                        <SelectItem value="high_interest">
                          High Interest
                        </SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="appointment_scheduled">
                          Appointment Scheduled
                        </SelectItem>
                        <SelectItem value="proposal_sent">
                          Proposal Sent
                        </SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="purchased_elsewhere">
                          Purchased Elsewhere
                        </SelectItem>
                        <SelectItem value="future_opportunity">
                          Future Opportunity
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString() || "3"} // Default to medium if undefined
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Highest</SelectItem>
                        <SelectItem value="2">2 - High</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - Low</SelectItem>
                        <SelectItem value="5">5 - Lowest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected Purchase Timeframe field */}
              <FormField
                control={form.control}
                name="expectedPurchaseTimeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        handleTimeframeChange(value, field.onChange)
                      }
                      value={field.value || "not_specified"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_specified">
                          Not specified
                        </SelectItem>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="1-3 months">1-3 Months</SelectItem>
                        <SelectItem value="3-6 months">3-6 Months</SelectItem>
                        <SelectItem value="6+ months">6+ Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget field */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter budget" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Lead"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
