import React from 'react';
import type { EstimateItem, Project } from '../lib/types';
import { uid } from '../lib/id';
import { useProjectsStore } from './useProjectsStore';

/**
 * Project estimate view-model backed by the single Projects store.
 * - project meta updates write through to localStorage immediately
 * - estimate items are edited locally and written on Save
 * - dirty tracking includes meta + items
 */

function normalizeItem(i: Partial<EstimateItem>): EstimateItem {
  return {
    id: i.id ?? uid('li-'),
    description: i.description ?? '',
    type: i.type ?? 'Material',
    quantity: Number(i.quantity ?? 1),
    rate: Number(i.rate ?? 0),
  };
}

export function useProjectEstimate(projectId: string) {
  const { projects, updateProject, getById } = useProjectsStore();
  const project = React.useMemo(() => getById(projectId), [getById, projectId]);

  const [estimateItems, _setEstimateItems] = React.useState<EstimateItem[]>(() => {
    const p = getById(projectId);
    return (p?.estimateItems ?? []).map(normalizeItem);
  });

  // Sync items when projectId changes OR projects update (e.g. edited in another tab)
  React.useEffect(() => {
    const p = getById(projectId);
    _setEstimateItems((p?.estimateItems ?? []).map(normalizeItem));
  }, [projectId, projects]); // eslint-disable-line react-hooks/exhaustive-deps

  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);
  const lastSavedRef = React.useRef<string>('');

  const snapshot = React.useMemo(() => {
    if (!project) return JSON.stringify({});
    return JSON.stringify({
      meta: { name: project.name, client: project.client, status: project.status, budget: project.budget },
      items: estimateItems,
    });
  }, [project, estimateItems]);

  React.useEffect(() => {
    // initialize snapshot on project change
    lastSavedRef.current = snapshot;
    setIsDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  React.useEffect(() => {
    setIsDirty(snapshot !== lastSavedRef.current);
  }, [snapshot]);

  const setEstimateItems = React.useCallback((items: EstimateItem[]) => {
    _setEstimateItems(items.map(normalizeItem));
  }, []);

  const updateProjectMeta = React.useCallback(
    (patch: Partial<Pick<Project, 'name' | 'client' | 'status' | 'budget'>>) => {
      if (!project) return;
      updateProject(projectId, patch);
    },
    [project, projectId, updateProject]
  );

  const save = React.useCallback(() => {
    if (!project) return;
    updateProject(projectId, { estimateItems: estimateItems.map(normalizeItem) });
    lastSavedRef.current = snapshot;
    setIsDirty(false);
    setLastSavedAt(Date.now());
  }, [estimateItems, project, projectId, snapshot, updateProject]);

  return { project, estimateItems, setEstimateItems, updateProjectMeta, save, isDirty, lastSavedAt };
}
