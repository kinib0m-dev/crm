"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
  CreateLeadInput,
} from "@/lib/validation/lead-schema";
import { useCreateLead } from "@/hooks/use-leads";
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

type CreateLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateLeadModal({ isOpen, onClose }: CreateLeadModalProps) {
  const { createLead, isLoading } = useCreateLead();
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema) as any, // Type assertion to avoid resolver type issues
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "new_lead" as LeadStatus, // Type assertion to match the enum
      priority: 3,
      expectedPurchaseTimeframe: undefined,
      budget: "",
    },
  });

  // Submit handler
  const onSubmit = async (data: CreateLeadInput) => {
    try {
      setFormError(null);
      await createLead(data);
      form.reset();
      onClose();
    } catch (error) {
      setFormError(
        "An error occurred while creating the lead. Please try again."
      );
      console.error("Error creating lead:", error);
    }
  };

  // Helper function for status change that ensures correct typing
  const handleStatusChange = (
    value: string,
    onChange: (value: LeadStatus) => void
  ) => {
    onChange(value as LeadStatus);
  };

  // Helper function for timeframe change that ensures correct typing
  const handleTimeframeChange = (
    value: string,
    onChange: (value: Timeframe | undefined) => void
  ) => {
    onChange(value ? (value as Timeframe) : undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {formError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      defaultValue={field.value}
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
                      defaultValue={field.value.toString()}
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    Creating...
                  </>
                ) : (
                  "Create Lead"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
