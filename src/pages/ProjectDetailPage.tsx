import React, { useEffect, useState, useCallback } from 'react';
import { EstimatorTable } from '../components/project/EstimatorTable';
import { TakeoffCanvas, ThumbnailData } from '../components/project/TakeoffCanvas';
import { EstimateSaveBar } from '../components/project/EstimateSaveBar';
import { useProjectEstimate } from '../store/useProjectEstimate';
import { AiFillModal } from '../components/project/AiFillModal';
import type { EstimateItem } from '../lib/types';
import { ProjectDetailHeaderMount } from '../components/project/ProjectDetailHeaderMount';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import { useConfirmNavigation } from '../hooks/useConfirmNavigation';
import { InlineThumbnailStrip } from '../components/takeoff/InlineThumbnailStrip';

type Props = {
  projectId: string;
  isDarkMode: boolean;
  onBack: () => void;
  defaultTab?: 'estimate' | 'takeoff';
};

const apiKey: string = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? '';

export function ProjectDetailPage({ projectId, isDarkMode, onBack, defaultTab = 'estimate' }: Props) {
  const [tab, setTab] = useState<'estimate' | 'takeoff'>(defaultTab);
  const [showAi, setShowAi] = useState(false);
  const [thumbnailData, setThumbnailData] = useState<ThumbnailData | null>(null);

  const { project, estimateItems, setEstimateItems, updateProjectMeta, save, isDirty, lastSavedAt } =
    useProjectEstimate(projectId);

  useEffect(() => setTab(defaultTab), [projectId, defaultTab]);

  useBeforeUnload(Boolean(isDirty));
  useConfirmNavigation(Boolean(isDirty));

  const appendItems = (items: EstimateItem[]) => {
    setEstimateItems([...(estimateItems ?? []), ...items]);
  };

  const handleThumbnailDataChange = useCallback((data: ThumbnailData | null) => {
    setThumbnailData(data);
  }, []);

  if (!project) {
    return (
      <div className="p-6 rounded border">
        <div className="font-bold">Project not found.</div>
        <button className="mt-4 text-orange-600 font-bold" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectDetailHeaderMount
        isDarkMode={isDarkMode}
        project={project}
        items={estimateItems}
        onBack={onBack}
        onAiFill={() => setShowAi(true)}
        onSave={save}
        onUpdateMeta={updateProjectMeta}
        isDirty={isDirty}
      />

      <div className="flex items-center border-b pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTab('estimate')}
            className={`px-4 py-2 text-sm font-bold ${tab === 'estimate' ? 'text-orange-600 border-b-2 border-orange-600' : 'opacity-50'}`}
          >
            Estimate
          </button>
          <button
            onClick={() => setTab('takeoff')}
            className={`px-4 py-2 text-sm font-bold ${tab === 'takeoff' ? 'text-orange-600 border-b-2 border-orange-600' : 'opacity-50'}`}
          >
            Takeoff
          </button>
          
          {/* Inline thumbnails - shown only on Takeoff tab when data is available */}
          {tab === 'takeoff' && thumbnailData && (
            <InlineThumbnailStrip
              doc={thumbnailData.doc}
              totalPages={thumbnailData.pages}
              activePageIndex={thumbnailData.activePageIndex}
              onPageSelect={thumbnailData.onPageSelect}
              pageVisibility={thumbnailData.pageVisibility}
              showHiddenPages={thumbnailData.showHiddenPages}
              removedPages={thumbnailData.removedPages}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      </div>

      {tab === 'estimate' && (
        <>
          <EstimateSaveBar isDirty={isDirty} lastSavedAt={lastSavedAt} onSave={save} isDarkMode={isDarkMode} />

          <EstimatorTable
            estimateItems={estimateItems}
            setEstimateItems={setEstimateItems}
            isDarkMode={isDarkMode}
            setShowAiSuggestModal={setShowAi}
          />

          <AiFillModal
            isOpen={showAi}
            onClose={() => setShowAi(false)}
            isDarkMode={isDarkMode}
            apiKey={apiKey}
            onAppendItems={appendItems}
          />
        </>
      )}

      {tab === 'takeoff' && (
        <TakeoffCanvas 
          isDarkMode={isDarkMode} 
          projectId={projectId}
          onThumbnailDataChange={handleThumbnailDataChange}
        />
      )}
    </div>
  );
}
