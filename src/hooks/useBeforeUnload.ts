import { useEffect } from 'react';

/**
 * Warn user on browser/tab close when `when` is true.
 */
export function useBeforeUnload(when: boolean, message = 'You have unsaved changes.') {
  useEffect(() => {
    if (!when) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set.
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when, message]);
}
