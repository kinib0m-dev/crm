"use client";

import { useCallback, useMemo } from "react";
import { useCurrentOrganization } from "./use-current-org";
import { OrganizationAction } from "../types";

/**
 * Permission levels for different actions
 */
export type PermissionLevel = "admin" | "member" | "none";

/**
 * Extended organization actions with more granular permissions
 */
export type ExtendedOrganizationAction =
  | OrganizationAction
  | "view_members"
  | "view_analytics"
  | "create_content"
  | "edit_content"
  | "delete_content"
  | "invite_members"
  | "export_data"
  | "view_billing"
  | "manage_billing";

/**
 * Permission configuration for different actions
 */
const PERMISSION_MAP: Record<ExtendedOrganizationAction, PermissionLevel> = {
  // Organization management (admin only)
  update: "admin",
  delete: "admin",
  manage_members: "admin",
  view_settings: "admin",
  invite_members: "admin",
  manage_billing: "admin",

  // Billing and sensitive data (admin only)
  view_billing: "admin",
  export_data: "admin",

  // Content management (members can create/edit, admins can delete)
  create_content: "member",
  edit_content: "member",
  delete_content: "admin",

  // Viewing permissions (members can view)
  view_members: "member",
  view_analytics: "member",
};

/**
 * Hook for checking organization permissions
 */
export function useOrganizationPermissions() {
  const {
    organization,
    userRole,
    isAdmin,
    isMember,
    hasOrganization,
    canPerformAction,
  } = useCurrentOrganization();

  /**
   * Check if user can perform an extended action
   */
  const canPerform = useCallback(
    (action: ExtendedOrganizationAction): boolean => {
      if (!hasOrganization || !userRole) {
        return false;
      }

      const requiredLevel = PERMISSION_MAP[action];

      switch (requiredLevel) {
        case "admin":
          return isAdmin;
        case "member":
          return isMember || isAdmin; // Admins can do everything members can
        case "none":
          return false;
        default:
          return false;
      }
    },
    [hasOrganization, userRole, isAdmin, isMember]
  );

  /**
   * Check multiple permissions at once
   */
  const canPerformAll = useCallback(
    (actions: ExtendedOrganizationAction[]): boolean => {
      return actions.every((action) => canPerform(action));
    },
    [canPerform]
  );

  /**
   * Check if user can perform any of the given actions
   */
  const canPerformAny = useCallback(
    (actions: ExtendedOrganizationAction[]): boolean => {
      return actions.some((action) => canPerform(action));
    },
    [canPerform]
  );

  /**
   * Get all actions the user can perform
   */
  const allowedActions = useMemo((): ExtendedOrganizationAction[] => {
    if (!hasOrganization || !userRole) {
      return [];
    }

    return Object.keys(PERMISSION_MAP).filter((action) =>
      canPerform(action as ExtendedOrganizationAction)
    ) as ExtendedOrganizationAction[];
  }, [hasOrganization, userRole, canPerform]);

  /**
   * Get actions grouped by permission level
   */
  const getActionsByPermissionLevel = useCallback(() => {
    const adminActions: ExtendedOrganizationAction[] = [];
    const memberActions: ExtendedOrganizationAction[] = [];

    Object.entries(PERMISSION_MAP).forEach(([action, level]) => {
      if (level === "admin") {
        adminActions.push(action as ExtendedOrganizationAction);
      } else if (level === "member") {
        memberActions.push(action as ExtendedOrganizationAction);
      }
    });

    return { adminActions, memberActions };
  }, []);

  /**
   * Permission gates for common UI patterns
   */
  const gates = useMemo(
    () => ({
      // Content management
      canCreateContent: canPerform("create_content"),
      canEditContent: canPerform("edit_content"),
      canDeleteContent: canPerform("delete_content"),

      // Member management
      canViewMembers: canPerform("view_members"),
      canInviteMembers: canPerform("invite_members"),
      canManageMembers: canPerform("manage_members"),

      // Organization management
      canUpdateOrganization: canPerform("update"),
      canDeleteOrganization: canPerform("delete"),
      canViewSettings: canPerform("view_settings"),

      // Analytics and data
      canViewAnalytics: canPerform("view_analytics"),
      canExportData: canPerform("export_data"),

      // Billing
      canViewBilling: canPerform("view_billing"),
      canManageBilling: canPerform("manage_billing"),
    }),
    [canPerform]
  );

  /**
   * Permission-based component wrapper
   */
  const withPermission = useCallback(
    (
      action: ExtendedOrganizationAction | ExtendedOrganizationAction[],
      component: React.ReactNode,
      fallback?: React.ReactNode
    ): React.ReactNode => {
      const hasPermission = Array.isArray(action)
        ? canPerformAny(action)
        : canPerform(action);

      return hasPermission ? component : fallback || null;
    },
    [canPerform, canPerformAny]
  );

  /**
   * Get permission status with reason
   */
  const getPermissionStatus = useCallback(
    (action: ExtendedOrganizationAction) => {
      if (!hasOrganization) {
        return {
          allowed: false,
          reason: "No organization selected",
        };
      }

      if (!userRole) {
        return {
          allowed: false,
          reason: "User role not determined",
        };
      }

      const requiredLevel = PERMISSION_MAP[action];
      const allowed = canPerform(action);

      if (!allowed) {
        return {
          allowed: false,
          reason: `Requires ${requiredLevel} permissions`,
        };
      }

      return {
        allowed: true,
        reason: `User has ${userRole} permissions`,
      };
    },
    [hasOrganization, userRole, canPerform]
  );

  return {
    // Core permission checking
    canPerform,
    canPerformAll,
    canPerformAny,

    // Permission metadata
    allowedActions,
    getActionsByPermissionLevel,
    getPermissionStatus,

    // Convenience gates
    gates,

    // Utility functions
    withPermission,

    // Backward compatibility
    canPerformAction,

    // Permission context
    hasOrganization,
    userRole,
    isAdmin,
    isMember,
    organization,
  };
}

/**
 * Hook for role-based component rendering
 */
export function useRoleBasedRendering() {
  const { isAdmin, isMember, hasOrganization } = useCurrentOrganization();

  /**
   * Render component based on role
   */
  const renderForRole = useCallback(
    (
      adminComponent?: React.ReactNode,
      memberComponent?: React.ReactNode,
      noOrgComponent?: React.ReactNode
    ): React.ReactNode => {
      if (!hasOrganization) {
        return noOrgComponent || null;
      }

      if (isAdmin && adminComponent) {
        return adminComponent;
      }

      if (isMember && memberComponent) {
        return memberComponent;
      }

      return null;
    },
    [hasOrganization, isAdmin, isMember]
  );

  /**
   * Render component for admin only
   */
  const renderForAdmin = useCallback(
    (
      component: React.ReactNode,
      fallback?: React.ReactNode
    ): React.ReactNode => {
      return isAdmin ? component : fallback || null;
    },
    [isAdmin]
  );

  /**
   * Render component for members (including admins)
   */
  const renderForMembers = useCallback(
    (
      component: React.ReactNode,
      fallback?: React.ReactNode
    ): React.ReactNode => {
      return isAdmin || isMember ? component : fallback || null;
    },
    [isAdmin, isMember]
  );

  return {
    renderForRole,
    renderForAdmin,
    renderForMembers,
    hasOrganization,
    isAdmin,
    isMember,
  };
}
