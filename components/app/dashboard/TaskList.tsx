"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock, AlertCircle, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: Date | null;
  leadId: string;
  leadName: string;
};

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-2">No tasks found</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/leads">View All Tasks</Link>
        </Button>
      </div>
    );
  }
  // Helper to format due date
  const formatDueDate = (date: Date | null) => {
    if (!date) return "No due date";

    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.log(error);
      return "Invalid date";
    }
  };

  // Helper to check if a task is due soon (within 24 hours)
  const isDueSoon = (date: Date | null) => {
    if (!date) return false;

    try {
      const dueDate = new Date(date);
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 0 && diffHours < 24;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  // Helper to check if a task is overdue
  const isOverdue = (date: Date | null) => {
    if (!date) return false;

    try {
      const dueDate = new Date(date);
      return dueDate < new Date();
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  // Helper to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return (
          <Badge variant="default" className="bg-orange-500">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Helper to get status icon
  const getStatusIcon = (status: string, dueDate: Date | null) => {
    if (status === "in_progress") {
      return <Clock className="h-5 w-5 text-blue-500" />;
    } else if (isOverdue(dueDate)) {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    } else if (isDueSoon(dueDate)) {
      return <CircleAlert className="h-5 w-5 text-amber-500" />;
    } else {
      return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-md border",
            isOverdue(task.dueDate) && "border-destructive/50 bg-destructive/5",
            isDueSoon(task.dueDate) && "border-amber-500/50 bg-amber-500/5"
          )}
        >
          <div className="flex-shrink-0">
            {getStatusIcon(task.status, task.dueDate)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getPriorityBadge(task.priority)}
              <p className="text-sm font-medium truncate">{task.title}</p>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <Link
                href={`/leads/${task.leadId}`}
                className="text-xs text-muted-foreground hover:underline truncate"
              >
                {task.leadName}
              </Link>
              <div
                className={cn(
                  "text-xs",
                  isOverdue(task.dueDate)
                    ? "text-destructive"
                    : isDueSoon(task.dueDate)
                      ? "text-amber-500"
                      : "text-muted-foreground"
                )}
              >
                {formatDueDate(task.dueDate)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
