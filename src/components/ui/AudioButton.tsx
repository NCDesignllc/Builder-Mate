import React from 'react';
import { Loader2, Volume2, Square } from 'lucide-react';
import { Alert } from './Alert';

type Props = {
  onSpeak: () => void;
  onStop: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  isDarkMode: boolean;
  isPlaying?: boolean; // optional future
};

export function AudioButton({ onSpeak, onStop, loading, error, clearError, isDarkMode }: Props) {
  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div className="w-80 max-w-full">
          <Alert title="Audio" message={error} onClose={clearError} isDarkMode={isDarkMode} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onStop}
          className={`p-2 rounded-full border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
          title="Stop"
        >
          <Square size={16} />
        </button>

        <button
          onClick={onSpeak}
          disabled={loading}
          className="p-2 rounded-full text-orange-600 hover:bg-orange-500/10 disabled:opacity-60"
          title="Play / Speak"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}
