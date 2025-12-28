import { useAppStore } from './useAppStore';

/**
 * Small selector helpers to avoid re-rendering entire pages.
 * Keep these lightweight for now.
 */

export const useUser = () => useAppStore((s) => s.user);
export const useIsDarkMode = () => useAppStore((s) => s.isDarkMode);
export const useSearchQuery = () => useAppStore((s) => s.searchQuery);

export const useProjects = () => useAppStore((s) => s.projects);
export const useActiveProjectId = () => useAppStore((s) => s.activeProjectId);
export const useEstimateItems = () => useAppStore((s) => s.estimateItems);

export const useActions = () =>
  useAppStore((s) => ({
    setUser: s.setUser,
    setIsDarkMode: s.setIsDarkMode,
    toggleDarkMode: s.toggleDarkMode,
    setSearchQuery: s.setSearchQuery,
    setProjects: s.setProjects,
    setActiveProjectId: s.setActiveProjectId,
    setEstimateItems: s.setEstimateItems,
    upsertActiveProjectEstimateItems: s.upsertActiveProjectEstimateItems,
    openProject: s.openProject,
    createProject: s.createProject,
  }));
