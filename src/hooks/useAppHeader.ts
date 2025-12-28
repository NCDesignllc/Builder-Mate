import { useEffect } from 'react';
import { useAppHeaderContext } from '../components/ui/AppHeaderContext';

/**
 * Imperatively set AppShell header content from any page.
 * Automatically clears on unmount.
 */
export function useAppHeader(options: { left?: React.ReactNode; actions?: React.ReactNode }) {
  const header = useAppHeaderContext();

  useEffect(() => {
    if (options.left !== undefined) header.setLeft(options.left ?? null);
    if (options.actions !== undefined) header.setActions(options.actions ?? null);

    return () => {
      header.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Allow dynamic updates without re-mounting (optional)
  useEffect(() => {
    if (options.left !== undefined) header.setLeft(options.left ?? null);
  }, [options.left]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (options.actions !== undefined) header.setActions(options.actions ?? null);
  }, [options.actions]); // eslint-disable-line react-hooks/exhaustive-deps
}
