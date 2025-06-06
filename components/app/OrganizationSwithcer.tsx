"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { useCurrentOrganization } from "@/lib/orgs/hooks/use-org-store";
import { getOrganizationColor } from "@/lib/orgs/utils/org-utils";
import { organizationColorEnum } from "@/db/schema";

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const {
    currentOrganization,
    organizations,
    setCurrentOrganization,
    isLoading,
  } = useCurrentOrganization();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 px-2 py-1.5", className)}>
        <div className="h-6 w-6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!organizations.length) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("w-full justify-start gap-2", className)}
      >
        <Plus className="h-4 w-4" />
        Create Organization
      </Button>
    );
  }

  const currentOrgColor = currentOrganization
    ? getOrganizationColor(
        currentOrganization.color as (typeof organizationColorEnum.enumValues)[number]
      )
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {currentOrgColor && (
              <div className={cn("h-4 w-4 rounded-sm", currentOrgColor.bg)} />
            )}
            <span className="truncate">
              {currentOrganization?.name || "Select organization..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandEmpty>No organizations found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Organizations">
              {organizations.map((org) => {
                const orgColor = getOrganizationColor(
                  org.color as (typeof organizationColorEnum.enumValues)[number]
                );
                return (
                  <CommandItem
                    key={org.id}
                    value={org.name}
                    onSelect={() => {
                      setCurrentOrganization(org.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className={cn("h-4 w-4 rounded-sm", orgColor.bg)} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{org.name}</span>
                        {org.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {org.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        currentOrganization?.id === org.id
                          ? "opacity-100"
                          : "opacity-0"
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
                  // TODO: Implement create organization modal
                  console.log("Create new organization");
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
