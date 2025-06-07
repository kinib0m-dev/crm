"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "./UserMenu";
import { useOrganization } from "@/lib/orgs/context/org-context";
import { getOrganizationColor } from "@/lib/orgs/utils/org-utils";
import { Home, Users, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { EmptyOrganizationState } from "@/components/onboarding/EmptyOrganizationState";
import { OrganizationSwitcher } from "./org/OrganizationSwitcher";

interface AppSidebarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Contacts",
    icon: Users,
    href: "/contacts",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar({ name, email, image }: AppSidebarProps) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { currentOrganization, organizations, isLoading } = useOrganization();

  // Get organization color for branding
  const orgColor = currentOrganization
    ? getOrganizationColor(currentOrganization.color)
    : null;

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className={cn("py-4", open && "px-4")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sidebar-foreground">CRM</span>
          </div>
        </div>

        {/* Organization Switcher or Empty State */}
        <div className="p-2">
          {isLoading ? (
            <div className="flex items-center gap-2 p-2">
              <div className="h-6 w-6 rounded bg-muted animate-pulse" />
              {open && (
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              )}
            </div>
          ) : organizations.length > 0 ? (
            <OrganizationSwitcher />
          ) : (
            open && <EmptyOrganizationState variant="sidebar" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Only show navigation if user has organizations */}
        {organizations.length > 0 && (
          <SidebarMenu>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                      isActive &&
                        orgColor &&
                        `border-l-2 border-l-[${orgColor.hex}] px-2 py-1 rounded-lg`
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        )}

        {/* Show minimal empty state when sidebar is collapsed and no orgs */}
        {organizations.length === 0 && !open && (
          <div className="px-2 py-4">
            <EmptyOrganizationState variant="minimal" />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserMenu name={name} email={email} image={image} />
      </SidebarFooter>
    </Sidebar>
  );
}
