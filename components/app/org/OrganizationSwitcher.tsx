"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOrganization } from "@/lib/orgs/context/org-context";
import { getOrganizationColor } from "@/lib/orgs/utils/org-utils";
import { useSidebar } from "@/components/ui/sidebar";
import { CreateOrganizationDialog } from "./OrganizationDialog";

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { open: sidebarOpen } = useSidebar();

  const { currentOrganization, organizations, switchOrganization, isLoading } =
    useOrganization();

  const handleOrganizationSelect = async (organizationId: string) => {
    if (organizationId === currentOrganization?.id) {
      setOpen(false);
      return;
    }

    try {
      await switchOrganization(organizationId);
      setOpen(false);
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="h-6 w-6 rounded bg-muted animate-pulse" />
        {sidebarOpen && (
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        )}
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center gap-2 p-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        {sidebarOpen && <span className="text-sm">No organization</span>}
      </div>
    );
  }

  const currentOrgColor = getOrganizationColor(currentOrganization.color);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            aria-label="Select organization"
            className={cn(
              "w-full justify-between h-auto p-2",
              !sidebarOpen && "justify-center"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "h-6 w-6 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold",
                  currentOrgColor.bg
                )}
              >
                {currentOrganization.name.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {currentOrganization.name}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {currentOrganization.role}
                  </span>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search organizations..." />
            <CommandList>
              <CommandEmpty>No organizations found.</CommandEmpty>
              <CommandGroup heading="Organizations">
                {organizations.map((org) => {
                  const orgColor = getOrganizationColor(org.color);
                  const isSelected = org.id === currentOrganization?.id;

                  return (
                    <CommandItem
                      key={org.id}
                      value={org.name}
                      onSelect={() => handleOrganizationSelect(org.id)}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={cn(
                          "h-5 w-5 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold",
                          orgColor.bg
                        )}
                      >
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {org.name}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {org.role}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="h-5 w-5 rounded border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-sm">Create organization</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
