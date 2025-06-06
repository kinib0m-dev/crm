import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Organization type based on the existing schema
type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  role: string;
  joinedAt: Date;
  createdAt: Date;
};

interface OrganizationStore {
  // State
  currentOrganizationId: string | null;

  // Actions
  setCurrentOrganization: (organizationId: string) => void;
  clearCurrentOrganization: () => void;

  // Computed getters (these will be used with tRPC data)
  getCurrentOrganization: (
    organizations: Organization[] | undefined
  ) => Organization | undefined;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentOrganizationId: null,

      // Actions
      setCurrentOrganization: (organizationId: string) => {
        set({ currentOrganizationId: organizationId });
      },

      clearCurrentOrganization: () => {
        set({ currentOrganizationId: null });
      },

      // Computed getter
      getCurrentOrganization: (organizations: Organization[] | undefined) => {
        const { currentOrganizationId } = get();

        if (!organizations || organizations.length === 0) {
          return undefined;
        }

        // Find the organization by ID
        const org = organizations.find(
          (org) => org.id === currentOrganizationId
        );

        // If stored org doesn't exist, return the first one
        if (!org && organizations.length > 0) {
          // Auto-select first organization if current selection is invalid
          const firstOrg = organizations[0];
          set({ currentOrganizationId: firstOrg.id });
          return firstOrg;
        }

        return org;
      },
    }),
    {
      name: "organization-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentOrganizationId: state.currentOrganizationId,
      }),
    }
  )
);

// Hook to initialize organization store with tRPC data
export const useInitializeOrganizationStore = (
  organizations: Organization[] | undefined
) => {
  const { currentOrganizationId, setCurrentOrganization } =
    useOrganizationStore();

  // Auto-select first organization if none is selected and organizations are available
  if (!currentOrganizationId && organizations && organizations.length > 0) {
    setCurrentOrganization(organizations[0].id);
  }

  // Clear selection if stored organization no longer exists
  if (currentOrganizationId && organizations) {
    const orgExists = organizations.some(
      (org) => org.id === currentOrganizationId
    );
    if (!orgExists) {
      useOrganizationStore.getState().clearCurrentOrganization();
    }
  }
};
