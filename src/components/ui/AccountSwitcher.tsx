import React, { useState, useRef, useEffect } from 'react';
import { Check, Plus, ChevronDown } from 'lucide-react';
import type { User } from '../../lib/types';
import { ProfileBubble } from './ProfileBubble';

type Props = {
  currentUser: User;
  accounts: User[];
  onSwitchAccount: (accountId: string) => void;
  onAddAccount: () => void;
  isDarkMode: boolean;
};

export function AccountSwitcher({ currentUser, accounts, onSwitchAccount, onAddAccount, isDarkMode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <ProfileBubble user={currentUser} size="sm" />
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-64 rounded-lg shadow-xl border overflow-hidden z-50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className={`p-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="text-xs font-bold uppercase opacity-60 mb-2">Current Account</div>
            <div className="flex items-center gap-3">
              <ProfileBubble user={currentUser} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{currentUser.name}</div>
                <div className="text-xs opacity-60 truncate">{currentUser.company || 'No company'}</div>
                <div className="text-xs opacity-60">{currentUser.role}</div>
              </div>
            </div>
          </div>

          {accounts.length > 1 && (
            <div className={`p-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="text-xs font-bold uppercase opacity-60 px-2 py-1">Switch Account</div>
              {accounts
                .filter((acc) => acc.id !== currentUser.id)
                .map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      onSwitchAccount(account.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded hover:bg-opacity-10 transition-colors ${
                      isDarkMode ? 'hover:bg-white' : 'hover:bg-slate-900'
                    }`}
                  >
                    <ProfileBubble user={account} size="sm" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-medium truncate">{account.name}</div>
                      <div className="text-xs opacity-60 truncate">{account.company || 'No company'}</div>
                    </div>
                    {account.id === currentUser.id && <Check size={14} className="text-orange-500" />}
                  </button>
                ))}
            </div>
          )}

          <button
            onClick={() => {
              onAddAccount();
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 p-3 text-sm font-medium hover:bg-opacity-10 transition-colors ${
              isDarkMode ? 'hover:bg-white text-orange-400' : 'hover:bg-slate-900 text-orange-600'
            }`}
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
      )}
    </div>
  );
}
