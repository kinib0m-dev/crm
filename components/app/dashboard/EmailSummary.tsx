"use client";

import { formatDistanceToNow } from "date-fns";
import { Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Email = {
  id: string;
  subject: string;
  sentAt: Date;
  sentCount: number;
};

interface EmailSummaryProps {
  emails: Email[];
}

export function EmailSummary({ emails }: EmailSummaryProps) {
  // Helper to format sent time
  const formatSentTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.log(error);
      return "Unknown date";
    }
  };

  if (!emails || emails.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-2">No emails sent yet</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/emails">Create Email Templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <Link
          key={email.id}
          href={`/emails/history/${email.id}`}
          className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm truncate">
              {email.subject}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              <span>{email.sentCount} recipients</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatSentTime(email.sentAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
