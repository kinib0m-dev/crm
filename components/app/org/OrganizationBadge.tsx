"use client";

import { cn } from "@/lib/utils";
import {
  getOrganizationColor,
  type OrganizationColor,
} from "@/lib/orgs/utils/org-utils";

interface OrganizationBadgeProps {
  name: string;
  color: OrganizationColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function OrganizationBadge({
  name,
  color,
  size = "md",
  className,
}: OrganizationBadgeProps) {
  const orgColor = getOrganizationColor(color);

  return (
    <div
      className={cn(
        "rounded flex-shrink-0 flex items-center justify-center text-white font-semibold",
        orgColor.bg,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
