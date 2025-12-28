import type { EstimateItem, Project, User } from '../lib/types';

export type AppState = {
  // UI
  isDarkMode: boolean;
  searchQuery: string;

  // Auth
  user: User | null;

  // Data
  projects: Project[];
  activeProjectId: string | null;
  estimateItems: EstimateItem[];
};

export type AppActions = {
  // UI
  setIsDarkMode: (v: boolean) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (v: string) => void;

  // Auth
  setUser: (u: User | null) => void;

  // Data
  setProjects: (projects: Project[]) => void;
  setActiveProjectId: (id: string | null) => void;

  // Estimate
  setEstimateItems: (items: EstimateItem[]) => void;
  upsertActiveProjectEstimateItems: (items: EstimateItem[]) => void;

  // Helpers
  openProject: (id: string) => void;
  createProject: (name: string, client: string) => void;
};

export type AppStore = AppState & AppActions;
