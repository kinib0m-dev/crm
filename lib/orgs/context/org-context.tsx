"use client";

import { createContext, useContext } from "react";
import { OrganizationContextType } from "../types";

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}

export { OrganizationContext };
