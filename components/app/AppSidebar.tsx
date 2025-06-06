"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Phone,
  Mail,
  Target,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentOrganization } from "@/lib/orgs/hooks/use-org-store";
import { UserMenu } from "./UserMenu";
import { OrganizationSwitcher } from "./OrganizationSwithcer";

// Navigation items for the CRM
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
  },
  {
    title: "Companies",
    url: "/companies",
    icon: Building2,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: DollarSign,
  },
  {
    title: "Activities",
    url: "/activities",
    icon: Calendar,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: Target,
  },
];

const communicationItems = [
  {
    title: "Emails",
    url: "/emails",
    icon: Mail,
  },
  {
    title: "Calls",
    url: "/calls",
    icon: Phone,
  },
];

const reportingItems = [
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
  },
];

const managementItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function AppSidebar({ name, email, image, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { hasOrganizations, isLoading } = useCurrentOrganization();

  // Don't render navigation items if no organizations (except settings)
  const shouldShowMainNav = hasOrganizations && !isLoading;

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="p-4">
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          {open && shouldShowMainNav && (
            <SidebarGroupLabel>Main</SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {shouldShowMainNav &&
                navigationItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Communication */}
        {shouldShowMainNav && (
          <SidebarGroup>
            {open && <SidebarGroupLabel>Communication</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {communicationItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Reporting & Analytics */}
        {shouldShowMainNav && (
          <SidebarGroup>
            {open && <SidebarGroupLabel>Reporting</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {reportingItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Management */}
        <SidebarGroup>
          {open && <SidebarGroupLabel>Management</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Empty State for No Organizations */}
        {!shouldShowMainNav && !isLoading && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-sm mb-2">No Organizations</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Create or join an organization to get started
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="px-2">Account</SidebarGroupLabel>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu name={name} email={email} image={image} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
