"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, ArrowUpRight, CircleDollarSign } from "lucide-react";

type LeadCount = {
  status: string;
  count: number;
};

interface StatsCardsProps {
  leadCounts: LeadCount[];
  tasksCount: number;
  emailsCount: number;
  carStockCount: number;
}

export function StatsCards({
  leadCounts,
  tasksCount,
  carStockCount,
}: StatsCardsProps) {
  // Calculate total leads
  const totalLeads = leadCounts.reduce(
    (sum, item) => sum + Number(item.count),
    0
  );

  // Calculate leads in active funnel stages
  const activeLeadStages = [
    "new_lead",
    "initial_contact",
    "awaiting_response",
    "engaged",
    "information_gathering",
    "high_interest",
    "qualified",
    "appointment_scheduled",
    "proposal_sent",
    "negotiation",
  ];

  const activeLeads = leadCounts
    .filter((item) => activeLeadStages.includes(item.status))
    .reduce((sum, item) => sum + Number(item.count), 0);

  // Calculate qualified leads
  const qualifiedStages = [
    "high_interest",
    "qualified",
    "appointment_scheduled",
    "proposal_sent",
    "negotiation",
  ];

  const qualifiedLeads = leadCounts
    .filter((item) => qualifiedStages.includes(item.status))
    .reduce((sum, item) => sum + Number(item.count), 0);

  // Calculate conversion rate
  const convertedLeads = leadCounts
    .filter((item) => item.status === "converted")
    .reduce((sum, item) => sum + Number(item.count), 0);

  const conversionRate =
    totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Leads Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            {activeLeads} active in sales funnel
          </p>
        </CardContent>
      </Card>

      {/* Qualified Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{qualifiedLeads}</div>
          <p className="text-xs text-muted-foreground">
            {totalLeads > 0
              ? `${((qualifiedLeads / totalLeads) * 100).toFixed(1)}% qualification rate`
              : "No leads in system"}
          </p>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {convertedLeads} leads converted to sales
          </p>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xl font-bold">{tasksCount}</div>
              <p className="text-xs text-muted-foreground">Pending Tasks</p>
            </div>
            <div>
              <div className="text-xl font-bold">{carStockCount}</div>
              <p className="text-xs text-muted-foreground">Cars in Stock</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
