import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadsDetailLoader() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to leads</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Lead Details</h1>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Lead Overview Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-5 w-40 mt-1.5" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Status */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-44" />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Skeleton className="h-4 w-4 mt-0.5" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-12" />
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                      <Skeleton className="h-6 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="interactions" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-8">
          <TabsTrigger
            value="interactions"
            className="flex items-center justify-center"
          >
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="flex items-center justify-center"
          >
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-12" />
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex items-center justify-center"
          >
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-12" />
          </TabsTrigger>
          <TabsTrigger
            value="emails"
            className="flex items-center justify-center"
          >
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-14" />
          </TabsTrigger>
        </TabsList>

        {/* Tab Content Placeholder */}
        <TabsContent value="interactions">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-10 w-36" />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-48 mb-2 mx-auto" />
                <Skeleton className="h-4 w-full max-w-md mx-auto" />
                <Skeleton className="h-4 w-3/4 max-w-md mx-auto mt-1" />
                <Skeleton className="h-10 w-48 rounded-md mt-4 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
