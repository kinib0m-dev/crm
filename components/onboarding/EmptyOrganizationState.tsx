"use client";

import { useState } from "react";
import { Building2, Plus, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateOrganizationDialog } from "../app/org/OrganizationDialog";

interface EmptyOrganizationStateProps {
  variant?: "dashboard" | "sidebar" | "minimal";
  onCreateOrganization?: () => void;
}

export function EmptyOrganizationState({
  variant = "dashboard",
  onCreateOrganization,
}: EmptyOrganizationStateProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateClick = () => {
    setShowCreateDialog(true);
    onCreateOrganization?.();
  };

  // Minimal variant for sidebar or compact spaces
  if (variant === "minimal") {
    return (
      <>
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-lg mb-3">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No organizations yet
          </p>
          <Button size="sm" onClick={handleCreateClick} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>

        <CreateOrganizationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </>
    );
  }

  // Sidebar variant for navigation areas
  if (variant === "sidebar") {
    return (
      <>
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="text-center">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No Organization
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Create one to get started
            </p>
            <Button size="sm" onClick={handleCreateClick} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </div>

        <CreateOrganizationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </>
    );
  }

  // Full dashboard variant
  return (
    <>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>

          {/* Main Message */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Create Your First Organization
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Organizations help you manage different projects, teams, and
            workflows. Get started by creating your first one.
          </p>

          {/* Action Button */}
          <Button size="lg" onClick={handleCreateClick} className="mb-8">
            <Plus className="w-5 h-5 mr-2" />
            Create Organization
          </Button>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <Card className="border-0 bg-gray-50/50">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  Team Collaboration
                </h3>
                <p className="text-xs text-gray-600">
                  Invite members and work together
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gray-50/50">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-sm text-gray-900 mb-1">
                  Quick Setup
                </h3>
                <p className="text-xs text-gray-600">
                  Get up and running in minutes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            Need help?{" "}
            <button className="text-primary hover:underline">
              Read our getting started guide
            </button>
          </p>
        </div>
      </div>

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
