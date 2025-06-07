"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Settings,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateOrganizationDialog } from "../app/org/OrganizationDialog";

interface WelcomeScreenProps {
  onGetStarted?: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleGetStarted = () => {
    setShowCreateDialog(true);
    onGetStarted?.();
  };

  const features = [
    {
      icon: Building2,
      title: "Organize Your Work",
      description:
        "Create organizations to separate different projects, teams, or clients.",
    },
    {
      icon: Users,
      title: "Collaborate with Teams",
      description:
        "Invite team members and manage roles and permissions efficiently.",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description:
        "Monitor your organization's performance with detailed analytics.",
    },
    {
      icon: Settings,
      title: "Customize Settings",
      description:
        "Configure your organization exactly how you want it to work.",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your CRM
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Get started by creating your first organization. Organizations
              help you manage different projects, teams, and workflows all in
              one place.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
            >
              Create Your First Organization
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </header>

          {/* Features Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
              What you can do with organizations
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="border-0 shadow-sm bg-white/50 backdrop-blur-sm"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Create your organization in just a few simple steps.
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={handleGetStarted}
                className="px-8 py-3"
              >
                Get Started Now
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
