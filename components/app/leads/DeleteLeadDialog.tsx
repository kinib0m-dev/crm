"use client";

import { useState } from "react";
import { useDeleteLead } from "@/hooks/use-leads";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangleIcon } from "lucide-react";

type DeleteLeadDialogProps = {
  lead: LeadWithTags;
  isOpen: boolean;
  onClose: () => void;
};

export function DeleteLeadDialog({
  lead,
  isOpen,
  onClose,
}: DeleteLeadDialogProps) {
  const { deleteLead, isLoading } = useDeleteLead();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteLead(lead.id);
      onClose();
    } catch (error) {
      setError("An error occurred while deleting the lead. Please try again.");
      console.error("Error deleting lead:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangleIcon className="h-5 w-5" />
            <DialogTitle>Delete Lead</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this lead? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-md">
          <p className="font-medium">{lead.name}</p>
          <p className="text-sm text-muted-foreground">
            {lead.email || lead.phone || "No contact information"}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Lead"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
