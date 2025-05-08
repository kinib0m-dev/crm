"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useEmailTemplates, useSendEmails } from "@/hooks/use-send-email";

interface LeadSendEmailProps {
  leadId: string;
  leadName: string;
  leadEmail: string | null;
}

export function LeadSendEmail({
  leadId,
  leadName,
  leadEmail,
}: LeadSendEmailProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { templates, isLoading: isLoadingTemplates } = useEmailTemplates();
  const { sendEmails, isLoading: isSending } = useSendEmails();

  if (!leadEmail) {
    return (
      <Button variant="secondary" disabled className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        No Email Address
      </Button>
    );
  }

  const handleSendEmail = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select an email template");
      return;
    }

    try {
      await sendEmails({
        templateId: selectedTemplateId,
        sendToAll: false,
        specificLeadIds: [leadId],
      });

      setOpen(false);
      setSelectedTemplateId("");
      toast.success(`Email sent to ${leadName}`);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Email to {leadName}</DialogTitle>
          <DialogDescription>
            Choose an email template to send to {leadEmail}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">No email templates found.</p>
              <Button variant="link" className="mt-2" asChild>
                <a href="/emails/new" target="_blank" rel="noopener noreferrer">
                  Create a template
                </a>
              </Button>
            </div>
          ) : (
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={!selectedTemplateId || isSending || isLoadingTemplates}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
