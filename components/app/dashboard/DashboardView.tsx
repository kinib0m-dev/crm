"use client";

import { useDashboardSummary } from "@/hooks/use-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { StatsCards } from "./StatsCards";
import { TaskList } from "./TaskList";
import { LeadFunnelChart } from "./LeadFunnelChart";
import { EmailSummary } from "./EmailSummary";
import { BotConversations } from "./BotConversations";

export function DashboardView() {
  const { summary, isLoading, refetch } = useDashboardSummary();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading || !summary) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid h-[400px] place-items-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards
        leadCounts={summary.leadCounts}
        tasksCount={summary.upcomingTasks.length}
        emailsCount={summary.recentEmails.length}
        carStockCount={summary.carStockCount}
      />

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Tasks */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            <CardDescription>
              Your most urgent tasks requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList tasks={summary.upcomingTasks} />
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/leads">View All Tasks</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Email Campaigns */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Emails</CardTitle>
            <CardDescription>
              Latest email campaigns sent to leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailSummary emails={summary.recentEmails} />
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/emails">Manage Email Templates</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Bot Conversations */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bot Conversations</CardTitle>
            <CardDescription>
              Recent automated sales conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BotConversations conversations={summary.recentConversations} />
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/playground">Open Bot Playground</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Lead Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Funnel Overview</CardTitle>
          <CardDescription>
            Distribution of leads across your sales funnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadFunnelChart leadCounts={summary.leadCounts} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link href="/leads">Manage Leads</Link>
          </Button>
          <Button asChild>
            <Link href="/leads/new">Add New Lead</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
