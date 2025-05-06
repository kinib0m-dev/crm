"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  MessageSquare,
  GitBranch,
  Settings,
  FileSpreadsheet,
} from "lucide-react";
import { UserMenu } from "@/components/app/UserMenu";
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
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AppSidebar({ name, email, image }: UserMenuProps) {
  const pathname = usePathname();

  const isActiveRoute = (route: string) => {
    if (route === "/dashboard") {
      return pathname === route;
    }
    return pathname.startsWith(route);
  };

  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          {open ? (
            <Link href="/dashboard" className="text-xl font-bold">
              CRM
            </Link>
          ) : (
            <Link href="/dashboard" className="text-xs font-bold">
              CRM
            </Link>
          )}
        </div>
      </SidebarHeader>
      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/dashboard"),
                  })}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Leads */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Leads"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/leads"),
                  })}
                >
                  <Link href="/leads">
                    <Users />
                    <span>Leads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Messages */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Messages"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/messages"),
                  })}
                >
                  <Link href="/messages">
                    <MessageSquare />
                    <span>Messages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Emails */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Emails"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/emails"),
                  })}
                >
                  <Link href="/emails">
                    <Mail />
                    <span>Emails</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sequences */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Sequences"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/sequences"),
                  })}
                >
                  <Link href="/sequences">
                    <GitBranch />
                    <span>Sequences</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Import/Export */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Import/Export"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/import-export"),
                  })}
                >
                  <Link href="/import-export">
                    <FileSpreadsheet />
                    <span>Import/Export</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  className={cn({
                    "bg-primary/90 text-background px-2 py-1 rounded-lg hover:bg-primary/90 hover:text-background":
                      isActiveRoute("/settings"),
                  })}
                >
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2">Account</SidebarGroupLabel>
          <div className="flex items-center">
            <UserMenu name={name} email={email} image={image} />
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
