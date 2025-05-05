"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon,
  FolderIcon,
  Clock1Icon,
  ArrowUpCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";

type StatsCardsProps = {
  stats:
    | {
        total: number | null;
        byStatus?: Record<string, number>;
        byPriority?: Record<string, number>;
        byTimeframe?: Record<string, number>;
      }
    | LeadStats
    | null;
};

// Helper to determine if the stats object is the new LeadStats type
function isLeadStats(stats: StatsCardsProps["stats"]): stats is LeadStats {
  return (
    stats !== null &&
    "byStatus" in stats &&
    Array.isArray(stats.byStatus) &&
    "byPriority" in stats &&
    Array.isArray(stats.byPriority) &&
    "byTimeframe" in stats &&
    Array.isArray(stats.byTimeframe)
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  // If stats is null, return empty placeholders
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value="--"
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatCard
          title="New Leads"
          value="--"
          icon={<FolderIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Qualified Leads"
          value="--"
          icon={<ArrowUpCircleIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Immediate Timeframe"
          value="--"
          icon={<Clock1Icon className="h-5 w-5" />}
        />
      </div>
    );
  }

  // Handle different stat formats
  if (isLeadStats(stats)) {
    // Using the new LeadStats format

    // Find counts by status
    const getStatusCount = (statuses: LeadStatus[]): number => {
      return stats.byStatus
        .filter((stat) => statuses.includes(stat.status))
        .reduce((sum, stat) => sum + (stat.count || 0), 0);
    };

    // Find count by timeframe
    const getTimeframeCount = (timeframe: Timeframe): number => {
      return stats.byTimeframe
        .filter((stat) => stat.timeframe === timeframe)
        .reduce((sum, stat) => sum + (stat.count || 0), 0);
    };

    // Calculate status counts
    const newLeadsCount = getStatusCount(["new_lead", "initial_contact"]);
    const qualifiedLeadsCount = getStatusCount(["qualified", "high_interest"]);
    const immediateCount = getTimeframeCount("immediate");

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total?.toString() || "0"}
          description="All active leads in your system"
          icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="New Leads"
          value={newLeadsCount.toString()}
          description="Leads in initial contact phase"
          icon={<FolderIcon className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Qualified Leads"
          value={qualifiedLeadsCount.toString()}
          description="High interest and qualified leads"
          icon={<CheckCircle2Icon className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Immediate Timeframe"
          value={immediateCount.toString()}
          description="Leads ready to buy now"
          icon={<Clock1Icon className="h-5 w-5 text-red-500" />}
        />
      </div>
    );
  } else {
    // Using the original stats format
    // Helper function to count combined statuses
    const countStatuses = (statusList: string[]): number => {
      if (!stats.byStatus) return 0;
      return statusList.reduce(
        (sum, status) => sum + (stats.byStatus?.[status] || 0),
        0
      );
    };

    // Calculate status counts
    const newLeadsCount = countStatuses(["new_lead", "initial_contact"]);
    const qualifiedLeadsCount = countStatuses(["qualified", "high_interest"]);

    // Get immediate timeframe count
    const immediateCount = stats.byTimeframe?.["immediate"] || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total?.toString() || "0"}
          description="All active leads in your system"
          icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="New Leads"
          value={newLeadsCount.toString()}
          description="Leads in initial contact phase"
          icon={<FolderIcon className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Qualified Leads"
          value={qualifiedLeadsCount.toString()}
          description="High interest and qualified leads"
          icon={<CheckCircle2Icon className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Immediate Timeframe"
          value={immediateCount.toString()}
          description="Leads ready to buy now"
          icon={<Clock1Icon className="h-5 w-5 text-red-500" />}
        />
      </div>
    );
  }
}

type StatCardProps = {
  title: string;
  value: string | undefined;
  description?: string;
  icon?: React.ReactNode;
};

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full bg-muted p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
