"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, MessageCircle, Trash2, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  useCreateConversation,
  useConversation,
  useSendMessage,
  useDeleteConversation,
} from "@/hooks/use-bot-chat";
import { ChatMessage } from "./ChatMessage";

type BotConversation = {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

interface BotPlaygroundViewProps {
  conversations: BotConversation[];
}

export function BotPlaygroundView({ conversations }: BotPlaygroundViewProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversations.length > 0 ? conversations[0].id : null);
  const [newConversationDialog, setNewConversationDialog] = useState(false);
  const [newConversationName, setNewConversationName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<string | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);
  const [customerType, setCustomerType] = useState("default");

  // Ref for messages scroll area
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { createConversation, isLoading: isCreating } = useCreateConversation();
  const { deleteConversation, isLoading: isDeleting } = useDeleteConversation();
  const { conversation, messages, refetch } = useConversation(
    selectedConversationId || ""
  );
  const { sendMessage, isLoading: isSending } = useSendMessage();

  // Auto-scroll to bottom when messages change or when typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateConversation = async () => {
    if (!newConversationName.trim()) return;

    try {
      const result = await createConversation(newConversationName);
      if (result?.success && result.conversation) {
        setSelectedConversationId(result.conversation.id);
        setNewConversationDialog(false);
        setNewConversationName("");
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      if (selectedConversationId === id) {
        setSelectedConversationId(
          conversations.length > 1
            ? conversations.find((c) => c.id !== id)?.id || null
            : null
        );
      }
      setDeleteConfirmDialog(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      setIsTyping(true);
      setNewMessage(""); // Clear input right away

      // Send message with customer type context
      let messageToSend = newMessage;
      if (customerType !== "default") {
        // We'll silently add context for the bot in the first message only
        if (messages.filter((m) => m.role === "user").length === 0) {
          messageToSend = `[Context: I'm a ${customerType} customer, but respond normally as if you don't know this] ${messageToSend}`;
        }
      }

      await sendMessage(selectedConversationId, messageToSend);

      // Wait a bit before refreshing to allow the "typing" indicator to show
      setTimeout(() => {
        refetch();
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Funnel Playground</h1>
        <Dialog
          open={newConversationDialog}
          onOpenChange={setNewConversationDialog}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Test Conversation</DialogTitle>
              <DialogDescription>
                Create a new conversation to test your automated sales funnel.
                Give it a name that describes the test scenario.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="E.g., Budget Buyer, Luxury Shopper, Financing Inquiry"
                value={newConversationName}
                onChange={(e) => setNewConversationName(e.target.value)}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setNewConversationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={isCreating || !newConversationName.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Conversations sidebar - fixed height with scroll */}
        <div className="space-y-4 flex flex-col h-[calc(100vh-200px)]">
          <div className="font-medium text-lg">Conversations</div>
          {conversations.length === 0 ? (
            <div className="text-muted-foreground text-center p-4 border rounded-md">
              No conversations yet. Start a new one!
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`relative group flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversationId === conv.id
                        ? "bg-muted border-primary/50"
                        : ""
                    }`}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div className="truncate">
                        <div className="font-medium truncate">{conv.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(conv.updatedAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmDialog(conv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>

                    {/* Delete confirmation dialog */}
                    <Dialog
                      open={deleteConfirmDialog === conv.id}
                      onOpenChange={(open) =>
                        setDeleteConfirmDialog(open ? conv.id : null)
                      }
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Conversation</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this conversation?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmDialog(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteConversation(conv.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Chat area */}
        {selectedConversationId ? (
          <Card className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
            {/* Fixed header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-medium">
                    {conversation?.name || "Loading..."}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Testing with Pedro (Sales Rep)
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Flag for Follow-up
                  </Button>
                  <Button variant="outline" size="sm">
                    Escalate to Manager
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable message area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary/60" />
                  </div>
                  <h3 className="text-xl font-medium">
                    Sales Representative Playground
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    This is where you can test how your automated lead funnel
                    works. Send a message to start the conversation with
                    &quot;Pedro.&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages
                    .sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                    .map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-2 md:gap-4 justify-start">
                      <div className="max-w-[80%] flex flex-col gap-1">
                        <div className="bg-muted rounded-lg p-3 rounded-tl-none">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"></div>
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce delay-75"></div>
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invisible div for scrolling to bottom */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Fixed input area */}
            <div className="border-t p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Simulate customer type:
                    </span>
                    <select
                      className="text-xs bg-muted p-1 rounded border"
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                    >
                      <option value="default">Default</option>
                      <option value="interested">Highly Interested</option>
                      <option value="price-sensitive">Price Sensitive</option>
                      <option value="urgent">Urgent Buyer</option>
                      <option value="skeptical">Skeptical</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending || isTyping}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || isTyping || !newMessage.trim()}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-xl font-medium">No Conversation Selected</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-center">
              Select an existing conversation from the sidebar or start a new
              one with our sales representative.
            </p>
            <Button
              className="mt-4"
              onClick={() => setNewConversationDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
