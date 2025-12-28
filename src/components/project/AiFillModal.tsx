import React, { useMemo, useState } from 'react';
import { Loader2, Sparkles, Settings2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import type { EstimateItem } from '../../lib/types';
import { normalizeAiItems } from '../../lib/aiEstimate';
import { useGemini } from '../../hooks/useGemini';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  apiKey: string;
  onAppendItems: (items: EstimateItem[]) => void;
};

export function AiFillModal({ isOpen, onClose, isDarkMode, apiKey, onAppendItems }: Props) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'fast' | 'detailed'>('fast');

  const system = useMemo(() => {
    const base =
      'Return a JSON array of estimate line items: [{description, type, quantity, rate}]. ' +
      'type must be Material or Labor. quantity and rate must be numbers.';
    if (mode === 'detailed') {
      return base + ' Provide more granular items and realistic placeholder rates.';
    }
    return base + ' Keep it concise.';
  }, [mode]);

  const { generateContent, loading, error, clearError } = useGemini(apiKey, {
    timeoutMs: 25000,
    maxChars: 5000,
  });

  const run = async () => {
    const res = await generateContent(prompt, system, true);
    const items = normalizeAiItems(res);
    if (items.length) onAppendItems(items);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Auto-Fill" isDarkMode={isDarkMode}>
      <div className="space-y-4">
        {error && <Alert title="AI Error" message={error} onClose={clearError} isDarkMode={isDarkMode} />}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs opacity-70">
            Describe the scope and we’ll generate estimate line items (JSON).
          </p>

          <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
            <Settings2 size={14} className="opacity-70" />
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-transparent outline-none"
              title="Generation mode"
            >
              <option value="fast">Fast</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={`w-full h-32 border p-2 rounded outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}
          placeholder="Example: 'Replace two side gates with aluminum privacy gates, include demo, disposal, materials, labor, hardware'"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded font-bold text-sm border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            Cancel
          </button>
          <button
            onClick={run}
            disabled={loading || !prompt.trim()}
            className="flex-1 bg-slate-900 text-white py-2 rounded font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={16} />}
            Generate
          </button>
        </div>
      </div>
    </Modal>
  );
}
