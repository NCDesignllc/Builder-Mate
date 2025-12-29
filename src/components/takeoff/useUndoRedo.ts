import { useCallback, useEffect, useState } from 'react';
import type { Measurement, HistoryEntry } from './types';

const MAX_HISTORY = 50;

export function useUndoRedo(measurements: Measurement[], setMeasurements: (m: Measurement[]) => void) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoing, setIsUndoing] = useState(false);

  // Push current state to history when measurements change (but not during undo/redo)
  useEffect(() => {
    if (isUndoing) {
      setIsUndoing(false);
      return;
    }

    const entry: HistoryEntry = {
      measurements: JSON.parse(JSON.stringify(measurements)),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // If we're not at the end of history, truncate forward history
      const newHistory = historyIndex >= 0 ? prev.slice(0, historyIndex + 1) : prev;
      const updated = [...newHistory, entry];
      
      // Keep only MAX_HISTORY entries
      if (updated.length > MAX_HISTORY) {
        return updated.slice(-MAX_HISTORY);
      }
      return updated;
    });

    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [measurements]); // eslint-disable-line react-hooks/exhaustive-deps

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const prevIndex = historyIndex - 1;
    const prevEntry = history[prevIndex];
    
    setIsUndoing(true);
    setMeasurements(JSON.parse(JSON.stringify(prevEntry.measurements)));
    setHistoryIndex(prevIndex);
  }, [history, historyIndex, setMeasurements]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const nextIndex = historyIndex + 1;
    const nextEntry = history[nextIndex];
    
    setIsUndoing(true);
    setMeasurements(JSON.parse(JSON.stringify(nextEntry.measurements)));
    setHistoryIndex(nextIndex);
  }, [history, historyIndex, setMeasurements]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return { undo, redo, canUndo, canRedo };
}
