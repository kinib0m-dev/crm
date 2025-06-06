"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Building2, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  useCurrentOrganization,
  useOrganizations,
  useOrganizationPermissions,
} from "@/lib/orgs/hooks/use-org";
import { getOrganizationColor } from "@/lib/orgs/utils/org-utils";
import { Badge } from "../ui/badge";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AppSidebar({}: UserMenuProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  // Organization hooks
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const { currentOrganization, setCurrentOrganization, hasOrganizations } =
    useCurrentOrganization();
  const { isAdmin, canUpdateOrganization } = useOrganizationPermissions();

  const organizations = orgsData?.organizations || [];

  // Navigation items based on current organization
  const getNavigationItems = () => {
    if (!currentOrganization) return [];

    const baseItems = [
      {
        title: "Dashboard",
        url: `/organizations/${currentOrganization.slug}`,
        icon: Building2,
      },
      {
        title: "Members",
        url: `/organizations/${currentOrganization.slug}/members`,
        icon: Users,
      },
    ];

    // Add settings for admins
    if (canUpdateOrganization) {
      baseItems.push({
        title: "Settings",
        url: `/organizations/${currentOrganization.slug}/settings`,
        icon: Settings,
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Building2 className="size-8 text-primary" />
          {open && (
            <div>
              <h1 className="text-lg font-bold text-foreground">CRM</h1>
              {currentOrganization && (
                <p className="text-xs text-muted-foreground">
                  {currentOrganization.name}
                </p>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Organizations Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Organizations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {orgsLoading ? (
                <SidebarMenuItem>
                  <div className="flex items-center gap-2 px-2 py-1">
                    <div className="size-6 animate-pulse rounded bg-muted" />
                    {open && (
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    )}
                  </div>
                </SidebarMenuItem>
              ) : organizations.length > 0 ? (
                <>
                  {organizations.map((org) => {
                    const colorConfig = getOrganizationColor(org.color);
                    const isSelected = currentOrganization?.id === org.id;

                    return (
                      <SidebarMenuItem key={org.id}>
                        <SidebarMenuButton asChild>
                          <div
                            onClick={() => setCurrentOrganization(org)}
                            className={cn(
                              "cursor-pointer",
                              isSelected && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-6 items-center justify-center rounded text-xs font-medium text-white",
                                colorConfig.bg
                              )}
                            >
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            {open && (
                              <div className="flex flex-1 items-center justify-between">
                                <span className="truncate">{org.name}</span>
                                {org.role === "admin" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  {open && (
                    <SidebarMenuItem>
                      <div className="mt-2">
                        <Link href="/organizations/create">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                          >
                            <Plus className="size-4" />
                            Create Organization
                          </Button>
                        </Link>
                      </div>
                    </SidebarMenuItem>
                  )}
                </>
              ) : (
                <SidebarMenuItem>
                  <div className="px-2 py-4">
                    {open ? (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          No organizations yet
                        </p>
                        <Link href="/organizations/create">
                          <Button size="sm" className="w-full">
                            <Plus className="size-4 mr-2" />
                            Create First Organization
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href="/organizations/create">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full p-2"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Section - Only show if user has an organization */}
        {hasOrganizations && currentOrganization && (
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !==
                      `/organizations/${currentOrganization.slug}` &&
                      pathname.startsWith(item.url));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            isActive && "bg-primary text-primary-foreground"
                          )}
                        >
                          <item.icon className="size-4" />
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

        {/* Quick Actions Section - Only show for admins */}
        {hasOrganizations && currentOrganization && isAdmin && open && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link
                    href={`/organizations/${currentOrganization.slug}/members/invite`}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Users className="size-4 mr-2" />
                      Invite Members
                    </Button>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
