"use client";

import { useOrganization } from "@/lib/orgs/context/org-context";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";
import { EmptyOrganizationState } from "@/components/onboarding/EmptyOrganizationState";

export default function DashboardPage() {
  const { currentOrganization, organizations, isLoading } = useOrganization();

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen for completely new users
  if (organizations.length === 0) {
    return <WelcomeScreen />;
  }

  // Show empty state if user has organizations but none selected
  if (!currentOrganization) {
    return (
      <div>
        <EmptyOrganizationState variant="dashboard" />
      </div>
    );
  }

  // Normal dashboard content when organization is selected
  return <div>Dashboard Page</div>;
}
