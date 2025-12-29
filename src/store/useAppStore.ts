import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppStore } from './storeTypes';
import { initialState } from './initialState';
import type { Project } from '../lib/types';
import { PERSIST_KEY } from './persistKeys';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../lib/storage';

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- state ---
      ...initialState,

      // --- UI ---
      setIsDarkMode: (v) => set({ isDarkMode: v }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setSearchQuery: (v) => set({ searchQuery: v }),

      // --- Auth ---
      setUser: (u) => set({ user: u }),
      addAccount: (account) => {
        set((state) => {
          const exists = state.accounts.some((a) => a.id === account.id);
          if (exists) return state;
          return {
            accounts: [...state.accounts, account],
            activeAccountId: account.id,
            user: account,
          };
        });
      },
      switchAccount: (accountId) => {
        const account = get().accounts.find((a) => a.id === accountId);
        if (account) {
          set({ user: account, activeAccountId: accountId });
        }
      },
      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...updates };
          return {
            user: updatedUser,
            accounts: state.accounts.map((a) => (a.id === updatedUser.id ? updatedUser : a)),
          };
        });
      },

      // --- Data ---
      setProjects: (projects) => set({ projects }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),

      // --- Estimate ---
      setEstimateItems: (items) => {
        set({ estimateItems: items });
        // keep active project's estimateItems in sync if there is an active project
        get().upsertActiveProjectEstimateItems(items);
      },

      upsertActiveProjectEstimateItems: (items) => {
        const activeProjectId = get().activeProjectId;
        if (!activeProjectId) return;

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === activeProjectId ? { ...p, estimateItems: items } : p
          ),
        }));
      },

      // --- Helpers ---
      openProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return;
        set({
          activeProjectId: id,
          estimateItems: project.estimateItems ?? [],
        });
      },

      createProject: (name, client) => {
        const p: Project = {
          id: String(Date.now()),
          name,
          client,
          status: 'Lead',
          budget: 0,
          balance: 0,
          completion: 0,
          estimateItems: [],
        };

        set((state) => ({
          projects: [...state.projects, p],
        }));
      },
    }),
    {
      name: PERSIST_KEY,
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: safeGetItem,
        setItem: safeSetItem,
        removeItem: safeRemoveItem,
      })),
      // only persist the things we want in localStorage
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        user: state.user,
        accounts: state.accounts,
        activeAccountId: state.activeAccountId,
        projects: state.projects,
      }),
    }
  )
);
