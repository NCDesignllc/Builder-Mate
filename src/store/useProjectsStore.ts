import React from 'react';
import type { Project } from '../lib/types';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Single source of truth for projects (legacy-friendly).
 * - Backed by localStorage
 * - Syncs across tabs via `storage` event
 * - Provides small CRUD helpers
 */

function read(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.projects);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Project[]) : [];
  } catch {
    return [];
  }
}

function write(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

export function useProjectsStore() {
  const [projects, setProjectsState] = React.useState<Project[]>(() => read());

  // keep in sync across tabs/windows
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.projects) setProjectsState(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setProjects = React.useCallback((next: Project[] | ((prev: Project[]) => Project[])) => {
    setProjectsState((prev) => {
      const resolved = typeof next === 'function' ? (next as any)(prev) : next;
      write(resolved);
      return resolved;
    });
  }, []);

  const addProject = React.useCallback((p: Project) => {
    setProjects((prev) => [...prev, p]);
  }, [setProjects]);

  const updateProject = React.useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, [setProjects]);

  const upsertProject = React.useCallback((p: Project) => {
    setProjects((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id);
      if (idx === -1) return [...prev, p];
      const next = [...prev];
      next[idx] = { ...prev[idx], ...p };
      return next;
    });
  }, [setProjects]);

  const getById = React.useCallback((id: string) => projects.find((p) => p.id === id) ?? null, [projects]);

  const refresh = React.useCallback(() => setProjectsState(read()), []);

  return { projects, setProjects, addProject, updateProject, upsertProject, getById, refresh };
}
