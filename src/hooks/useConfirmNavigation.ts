import { useEffect, useRef } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import React from 'react';

/**
 * React Router v6 "block" helper using UNSAFE_NavigationContext.
 * When `when` is true, prompts before navigation.
 */
export function useConfirmNavigation(when: boolean, message = 'You have unsaved changes. Leave anyway?') {
  const navigator = React.useContext(NavigationContext).navigator as any;
  const whenRef = useRef(when);
  whenRef.current = when;

  useEffect(() => {
    if (!navigator?.block) return;

    const unblock = navigator.block((tx: any) => {
      if (!whenRef.current) {
        tx.retry();
        return;
      }
      const ok = window.confirm(message);
      if (ok) tx.retry();
    });

    return unblock;
  }, [navigator, message]);
}
