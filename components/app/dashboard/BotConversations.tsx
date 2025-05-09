"use client";

import { formatDistanceToNow } from "date-fns";
import { Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Conversation = {
  id: string;
  name: string;
  updatedAt: Date;
  messageCount: number;
};

interface BotConversationsProps {
  conversations: Conversation[];
}

export function BotConversations({ conversations }: BotConversationsProps) {
  // Helper to format last activity time
  const formatLastActivity = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.log(error);
      return "Unknown date";
    }
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-2">No bot conversations yet</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/playground">Start Testing Bot</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/playground?id=${conversation.id}`}
          className="block p-3 rounded-md border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm truncate">
              {conversation.name}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageCircle className="h-3 w-3 mr-1" />
              <span>{conversation.messageCount} messages</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatLastActivity(conversation.updatedAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
