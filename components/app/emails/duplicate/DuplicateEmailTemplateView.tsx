"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateEmailTemplateSchema,
  createEmailTemplateSchema,
} from "@/lib/validation/email-templates-schema";
import { useCreateEmailTemplate } from "@/hooks/use-email-templates";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Copy, Info } from "lucide-react";
import { leadStatusEnum } from "@/db/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EmailTemplate = {
  id: string;
  userId: string;
  name: string;
  subject: string;
  content: string;
  description: string | null;
  targetStatuses: string[];
  createdAt: Date;
  updatedAt: Date;
};

interface DuplicateEmailTemplateViewProps {
  template: EmailTemplate;
}

export function DuplicateEmailTemplateView({
  template,
}: DuplicateEmailTemplateViewProps) {
  const router = useRouter();
  const { createTemplate, isLoading } = useCreateEmailTemplate();
  const [submitting, setSubmitting] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    template.targetStatuses
  );
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<CreateEmailTemplateSchema>({
    resolver: zodResolver(createEmailTemplateSchema),
    defaultValues: {
      name: `${template.name} (Copy)`,
      subject: template.subject,
      content: template.content,
      targetStatuses: template.targetStatuses,
      description: template.description || undefined,
    },
  });

  const onSubmit = async (data: CreateEmailTemplateSchema) => {
    try {
      setSubmitting(true);
      await createTemplate(data);
      router.push("/emails");
    } catch (error) {
      console.error("Error creating email template:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Update selected statuses in the form when they change
  const handleStatusSelect = (selectedStatus: string) => {
    const updatedStatuses = selectedStatuses.includes(selectedStatus)
      ? selectedStatuses.filter((status) => status !== selectedStatus)
      : [...selectedStatuses, selectedStatus];

    setSelectedStatuses(updatedStatuses);
    form.setValue("targetStatuses", updatedStatuses, { shouldValidate: true });
  };

  // Get preview of email content with variables replaced
  const getContentPreview = (content: string) => {
    return content
      .replace(/{{name}}/g, "John Doe")
      .replace(/{{first_name}}/g, "John")
      .replace(/{{email}}/g, "john.doe@example.com")
      .replace(/{{lead_id}}/g, "12345");
  };

  const previewFormValues = {
    subject: form.watch("subject"),
    content: form.watch("content"),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/emails/${template.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to template details</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Duplicate Email Template</h1>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create a Copy of "{template.name}"</CardTitle>
          <CardDescription>
            Duplicate this template and customize it as needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Template Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Template Information</h3>

                {/* Template Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Template Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional description of this template"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Statuses */}
                <FormField
                  control={form.control}
                  name="targetStatuses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Lead Statuses*</FormLabel>
                      <FormDescription>
                        Select which lead statuses this email template will
                        target
                      </FormDescription>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-between",
                                  !selectedStatuses.length &&
                                    "text-muted-foreground"
                                )}
                              >
                                {selectedStatuses.length > 0 ? (
                                  <>
                                    {selectedStatuses.length} status
                                    {selectedStatuses.length !== 1
                                      ? "es"
                                      : ""}{" "}
                                    selected
                                  </>
                                ) : (
                                  "Select statuses"
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search statuses..." />
                              <CommandList>
                                <CommandEmpty>No statuses found.</CommandEmpty>
                                <CommandGroup>
                                  {leadStatusEnum.enumValues.map((status) => {
                                    const isSelected =
                                      selectedStatuses.includes(status);
                                    return (
                                      <CommandItem
                                        key={status}
                                        value={status}
                                        onSelect={() =>
                                          handleStatusSelect(status)
                                        }
                                      >
                                        <div
                                          className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                              ? "bg-primary text-primary-foreground"
                                              : "opacity-50 [&_svg]:invisible"
                                          )}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="16"
                                            height="16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={cn(
                                              isSelected
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          >
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        </div>
                                        <span>{formatStatus(status)}</span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {selectedStatuses.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedStatuses.map((status) => (
                            <Badge key={status} variant="secondary">
                              {formatStatus(status)}
                              <button
                                type="button"
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={() => handleStatusSelect(status)}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                <span className="sr-only">
                                  Remove {formatStatus(status)}
                                </span>
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Content */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Email Content</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4 mr-2" />
                          Available Variables
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <p className="font-semibold mb-1">
                          You can use these variables in your template:
                        </p>
                        <ul className="text-sm">
                          <li>
                            <code>{"{{name}}"}</code> - Full name of the lead
                          </li>
                          <li>
                            <code>{"{{first_name}}"}</code> - First name of the
                            lead
                          </li>
                          <li>
                            <code>{"{{email}}"}</code> - Email address of the
                            lead
                          </li>
                          <li>
                            <code>{"{{lead_id}}"}</code> - Unique ID of the lead
                          </li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger
                      value="edit"
                      onClick={() => setPreviewMode(false)}
                    >
                      Edit
                    </TabsTrigger>
                    <TabsTrigger
                      value="preview"
                      onClick={() => setPreviewMode(true)}
                    >
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4 mt-4">
                    {/* Email Subject */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email subject"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Content */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Content*</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter email content here..."
                              className="min-h-[300px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can use HTML formatting in your email content.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4 mt-4">
                    <div className="space-y-4 border rounded-md p-6">
                      <div className="pb-2 border-b">
                        <div className="text-sm text-muted-foreground mb-1">
                          Subject:
                        </div>
                        <div className="font-medium">
                          {previewFormValues.subject ? (
                            getContentPreview(previewFormValues.subject)
                          ) : (
                            <span className="text-muted-foreground italic">
                              No subject
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Content:
                        </div>
                        {previewFormValues.content ? (
                          <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: getContentPreview(
                                previewFormValues.content
                              ),
                            }}
                          />
                        ) : (
                          <div className="text-muted-foreground italic">
                            No content
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting || isLoading}
                  onClick={() => router.push(`/emails/${template.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || isLoading}>
                  {submitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Copy...
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Create Copy
                    </>
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

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
