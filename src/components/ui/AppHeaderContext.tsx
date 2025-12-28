import React, { createContext, useContext } from 'react';

export type AppHeaderState = {
  left: React.ReactNode | null;
  actions: React.ReactNode | null;
};

export type AppHeaderApi = AppHeaderState & {
  setLeft: (node: React.ReactNode | null) => void;
  setActions: (node: React.ReactNode | null) => void;
  clear: () => void;
};

const Ctx = createContext<AppHeaderApi | null>(null);

export function AppHeaderProvider({
  value,
  children,
}: {
  value: AppHeaderApi;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppHeaderContext() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useAppHeaderContext must be used inside <AppHeaderProvider />');
  }
  return ctx;
}
