import React, { useMemo } from 'react';
import { ChevronRight, Sparkles, Save } from 'lucide-react';
import { useAppHeader } from '../../hooks/useAppHeader';
import type { EstimateItem, Project } from '../../lib/types';
import { ExportMenu } from './ExportMenu';
import { ProjectMetaEditor } from './ProjectMetaEditor';
import { InlineTextEdit } from './InlineTextEdit';

type Props = {
  isDarkMode: boolean;
  project: Project;
  items: EstimateItem[];
  onBack: () => void;
  onAiFill: () => void;
  onSave: () => void;
  onUpdateMeta: (patch: Partial<Pick<Project, 'status' | 'budget' | 'name' | 'client'>>) => void;
  isDirty: boolean;
};

export function ProjectDetailHeaderMount({
  isDarkMode,
  project,
  items,
  onBack,
  onAiFill,
  onSave,
  onUpdateMeta,
  isDirty,
}: Props) {
  const left = useMemo(() => {
    const linkCls = isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900';
    const crumbCls = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    return (
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onBack} className={`text-sm font-bold ${linkCls}`}>
          Jobs
        </button>
        <ChevronRight size={16} className={crumbCls} />

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-bold truncate">
              <InlineTextEdit
                value={project.name || ''}
                placeholder="Project name"
                isDarkMode={isDarkMode}
                onSave={(name) => onUpdateMeta({ name })}
                className="font-bold text-base"
              />
            </div>
            <ProjectMetaEditor isDarkMode={isDarkMode} project={project} onUpdate={onUpdateMeta} />
          </div>

          <div className="text-xs opacity-60 truncate">
            <InlineTextEdit
              value={project.client || ''}
              placeholder="Client"
              isDarkMode={isDarkMode}
              onSave={(client) => onUpdateMeta({ client })}
              className="text-xs opacity-90"
              inputClassName="text-xs"
              maxLength={80}
            />
          </div>
        </div>
      </div>
    );
  }, [isDarkMode, onBack, onUpdateMeta, project]);

  const actions = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <ExportMenu isDarkMode={isDarkMode} project={project} items={items} />

        <button
          onClick={onAiFill}
          className={`px-3 py-2 rounded text-xs font-bold flex items-center gap-2 border ${
            isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'
          }`}
          title="AI Fill estimate line items"
        >
          <Sparkles size={14} className="text-orange-600" />
          AI Fill
        </button>

        <button
          onClick={onSave}
          disabled={!isDirty}
          className={`px-3 py-2 rounded text-xs font-bold flex items-center gap-2 ${
            isDirty ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-slate-300/40 text-slate-500 cursor-not-allowed'
          }`}
          title={isDirty ? 'Save changes' : 'No changes to save'}
        >
          <Save size={14} />
          Save
        </button>
      </div>
    );
  }, [isDarkMode, isDirty, items, onAiFill, onSave, project]);

  useAppHeader({ left, actions });
  return null;
}
