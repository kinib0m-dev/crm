"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UpdateLeadSchema,
  updateLeadSchema,
} from "@/lib/validation/lead-schema";
import { useUpdateLead } from "@/hooks/use-leads";
import { leadStatusEnum, timeframeEnum } from "@/db/schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

type LeadsEditViewProps = {
  lead: LeadWithTags;
};

export function LeadsEditView({ lead }: LeadsEditViewProps) {
  const router = useRouter();
  const { updateLead, isLoading } = useUpdateLead();
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with lead data
  const form = useForm<UpdateLeadSchema>({
    resolver: zodResolver(updateLeadSchema),
    defaultValues: {
      id: lead.id,
      name: lead.name,
      email: lead.email || undefined,
      phone: lead.phone || undefined,
      status: lead.status,
      sourceId: lead.sourceId || undefined,
      priority: lead.priority || 3,
      qualificationScore: lead.qualificationScore || 0,
      lastContactedAt: lead.lastContactedAt || undefined,
      nextFollowUpDate: lead.nextFollowUpDate || undefined,
      expectedPurchaseTimeframe: lead.expectedPurchaseTimeframe || undefined,
      budget: lead.budget || undefined,
      isDeleted: lead.isDeleted || false,
    },
  });

  const onSubmit = async (data: UpdateLeadSchema) => {
    try {
      setSubmitting(true);

      const formattedData = {
        ...data,
        expectedPurchaseTimeframe:
          data.expectedPurchaseTimeframe === undefined
            ? undefined
            : data.expectedPurchaseTimeframe,
      };

      await updateLead(formattedData);
      toast.success("Lead updated successfully");
      router.push(`/leads/${lead.id}`);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setSubmitting(false);
    }
  };

  function formatStatus(status: string) {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatTimeframe(timeframe: string) {
    return timeframe
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/leads/${lead.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to lead details</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Lead</h1>
        </div>
      </div>

      {/* Edit Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{lead.name}</CardTitle>
          <CardDescription>Update lead information and details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                {/* Name Field */}
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

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Lead Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Lead Details</h3>

                {/* Status Field */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leadStatusEnum.enumValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {formatStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority Field */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value?.toString() ?? "3"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Very High</SelectItem>
                          <SelectItem value="2">2 - High</SelectItem>
                          <SelectItem value="3">3 - Medium</SelectItem>
                          <SelectItem value="4">4 - Low</SelectItem>
                          <SelectItem value="5">5 - Very Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Budget Field */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 10000"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timeframe Field */}
                <FormField
                  control={form.control}
                  name="expectedPurchaseTimeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Purchase Timeframe</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "unspecified"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unspecified">
                            Not specified
                          </SelectItem>
                          {timeframeEnum.enumValues.map((timeframe) => (
                            <SelectItem key={timeframe} value={timeframe}>
                              {formatTimeframe(timeframe)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Next Follow-up Date */}
                <FormField
                  control={form.control}
                  name="nextFollowUpDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Follow-up Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || isLoading}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || isLoading}>
                  {submitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
