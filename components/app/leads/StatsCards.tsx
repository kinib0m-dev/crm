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

function isLeadStats(stats: StatsCardsProps["stats"]): stats is LeadStats {
  return (
    stats !== null &&
    "byStatus" in stats &&
    Array.isArray(stats.byStatus) &&
    "byPriority" in stats &&
    Array.isArray(stats.byPriority) &&
    Array.isArray(stats.byTimeframe)
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
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

  if (isLeadStats(stats)) {
    const getStatusCount = (statuses: LeadStatus[]): number => {
      return stats.byStatus
        .filter((stat) => statuses.includes(stat.status))
        .reduce((acc, stat) => acc + Number(stat.count || 0), 0);
    };

    const getTimeframeCount = (timeframe: Timeframe): number => {
      return stats.byTimeframe
        .filter((stat) => stat.timeframe === timeframe)
        .reduce((acc, stat) => acc + Number(stat.count || 0), 0);
    };

    const newLeadsCount = getStatusCount(["new_lead", "initial_contact"]);
    const qualifiedLeadsCount = getStatusCount(["qualified", "high_interest"]);
    const immediateCount = getTimeframeCount("immediate");

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total !== null ? `${Number(stats.total)}` : "0"}
          description="All active leads in your system"
          icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="New Leads"
          value={`${newLeadsCount}`}
          description="Leads in initial contact phase"
          icon={<FolderIcon className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Qualified Leads"
          value={`${qualifiedLeadsCount}`}
          description="High interest and qualified leads"
          icon={<CheckCircle2Icon className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Immediate Timeframe"
          value={`${immediateCount}`}
          description="Leads ready to buy now"
          icon={<Clock1Icon className="h-5 w-5 text-red-500" />}
        />
      </div>
    );
  } else {
    const countStatuses = (statusList: string[]): number => {
      if (!stats.byStatus) return 0;
      return statusList.reduce(
        (acc, status) => acc + Number(stats.byStatus?.[status] || 0),
        0
      );
    };

    const countTimeframe = (key: string): number => {
      return Number(stats.byTimeframe?.[key] || 0);
    };

    const newLeadsCount = countStatuses(["new_lead", "initial_contact"]);
    const qualifiedLeadsCount = countStatuses(["qualified", "high_interest"]);
    const immediateCount = countTimeframe("immediate");

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total !== null ? `${Number(stats.total)}` : "0"}
          description="All active leads in your system"
          icon={<UsersIcon className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="New Leads"
          value={`${newLeadsCount}`}
          description="Leads in initial contact phase"
          icon={<FolderIcon className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Qualified Leads"
          value={`${qualifiedLeadsCount}`}
          description="High interest and qualified leads"
          icon={<CheckCircle2Icon className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          title="Immediate Timeframe"
          value={`${immediateCount}`}
          description="Leads ready to buy now"
          icon={<Clock1Icon className="h-5 w-5 text-red-500" />}
        />
      </div>
    );
  }
}

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
