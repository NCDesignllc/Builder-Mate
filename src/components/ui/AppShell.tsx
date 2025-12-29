import React from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import type { User } from '../../lib/types';
import { SidebarNav } from './SidebarNav';
import { AppHeaderSearch } from './AppHeaderSearch';
import { AppHeaderProvider, type AppHeaderApi } from './AppHeaderContext';
import { AccountSwitcher } from './AccountSwitcher';
import { ProfileBubble } from './ProfileBubble';

type Props = {
  user: User | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;

  // Optional account management
  accounts?: User[];
  onSwitchAccount?: (accountId: string) => void;
  onAddAccount?: () => void;

  // Optional header search (default fallback)
  searchQuery?: string;
  setSearchQuery?: (v: string) => void;

  // Optional right-side header actions (static)
  headerActions?: React.ReactNode;

  children: React.ReactNode;
};

export function AppShell({
  user,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
  accounts = [],
  onSwitchAccount,
  onAddAccount,
  searchQuery,
  setSearchQuery,
  headerActions,
  children,
}: Props) {
  const [collapsed, setCollapsed] = React.useState(false);

  // Dynamic header slots set by pages via context
  const [left, setLeft] = React.useState<React.ReactNode | null>(null);
  const [actions, setActions] = React.useState<React.ReactNode | null>(null);

  const api: AppHeaderApi = React.useMemo(
    () => ({
      left,
      actions,
      setLeft,
      setActions,
      clear: () => {
        setLeft(null);
        setActions(null);
      },
    }),
    [left, actions]
  );

  const hasSearch = typeof searchQuery === 'string' && typeof setSearchQuery === 'function';
  const hasAccountSwitching = user && accounts.length > 0 && onSwitchAccount && onAddAccount;

  return (
    <AppHeaderProvider value={api}>
      <div className={isDarkMode ? 'bg-slate-900 text-slate-200 min-h-screen' : 'bg-white text-slate-700 min-h-screen'}>
        <div className="flex min-h-screen">
          <div className="fixed inset-y-0 left-0 z-30">
            <SidebarNav
              isDarkMode={isDarkMode}
              collapsed={collapsed}
              onToggleCollapsed={() => setCollapsed((v) => !v)}
            />
          </div>

          <div className={`flex-1 min-w-0 ${collapsed ? 'ml-20' : 'ml-64'} transition-all`}>
            <header
              className={`h-16 border-b flex items-center justify-between gap-4 px-6 sticky top-0 z-20 backdrop-blur-sm ${
                isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'
              }`}
            >
              {/* Left slot priority: page override -> search -> default */}
              {left ? (
                <div className="flex-1 min-w-0">{left}</div>
              ) : hasSearch ? (
                <AppHeaderSearch value={searchQuery!} onChange={setSearchQuery!} isDarkMode={isDarkMode} />
              ) : (
                <div className="text-xs opacity-70">
                  Signed in as <span className="font-semibold">{user?.name ?? 'User'}</span>
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {/* Actions priority: page override -> static headerActions */}
                {actions ?? headerActions}
                <button onClick={onToggleDarkMode} className="p-2 rounded-full hover:bg-slate-100/10" title="Toggle dark mode">
                  {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                </button>
                
                {/* Show AccountSwitcher if available, otherwise show simple profile bubble or logout */}
                {hasAccountSwitching ? (
                  <AccountSwitcher
                    currentUser={user}
                    accounts={accounts}
                    onSwitchAccount={onSwitchAccount}
                    onAddAccount={onAddAccount}
                    isDarkMode={isDarkMode}
                  />
                ) : user ? (
                  <ProfileBubble user={user} size="sm" />
                ) : null}
                
                <button onClick={onLogout} className="text-red-600 font-bold flex items-center text-xs px-3 py-2 rounded hover:bg-red-500/10" title="Logout">
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            </header>

            <main className="p-6 w-full min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </AppHeaderProvider>
  );
}
