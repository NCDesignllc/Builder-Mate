import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, Building2, Briefcase, Mail } from 'lucide-react';
import type { User, UserRole } from '../lib/types';
import { ProfileBubble } from '../components/ui/ProfileBubble';

type Props = {
  user: User | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onUpdateUser?: (updates: Partial<User>) => void;
};

export function SettingsPage({ user, isDarkMode, onToggleDarkMode, onLogout, onUpdateUser }: Props) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    company: user?.company ?? '',
    title: user?.title ?? '',
    role: user?.role ?? 'Estimator' as UserRole,
  });

  const handleSaveProfile = () => {
    if (onUpdateUser) {
      onUpdateUser(profileForm);
      setIsEditingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name ?? '',
      company: user?.company ?? '',
      title: user?.title ?? '',
      role: user?.role ?? 'Estimator',
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold border-b pb-4 flex items-center gap-2">
        <ShieldCheck size={20} className="text-orange-600" /> Settings
      </h2>

      {/* User Profile Section */}
      <div className={`border rounded-lg p-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <UserIcon size={18} /> User Profile
          </h4>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-orange-600 font-bold text-xs hover:underline"
            >
              Edit Profile
            </button>
          )}
        </div>

        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProfileBubble user={user} size="lg" />
              <div className="flex-1">
                {!isEditingProfile ? (
                  <>
                    <div className="font-semibold text-lg">{user.name}</div>
                    <div className="text-sm opacity-60">{user.email ?? 'No email'}</div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold opacity-60 uppercase">Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className={`w-full border p-2 rounded text-sm ${
                          isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-60 uppercase flex items-center gap-1 mb-1">
                  <Building2 size={12} /> Company
                </label>
                {!isEditingProfile ? (
                  <div className="text-sm">{user.company || 'Not specified'}</div>
                ) : (
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    className={`w-full border p-2 rounded text-sm ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                    }`}
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold opacity-60 uppercase flex items-center gap-1 mb-1">
                  <Briefcase size={12} /> Job Title
                </label>
                {!isEditingProfile ? (
                  <div className="text-sm">{user.title}</div>
                ) : (
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className={`w-full border p-2 rounded text-sm ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                    }`}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold opacity-60 uppercase flex items-center gap-1 mb-1">
                <ShieldCheck size={12} /> Role
              </label>
              {!isEditingProfile ? (
                <div className="text-sm">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'Estimator' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ) : (
                <select
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value as UserRole })}
                  className={`w-full border p-2 rounded text-sm ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}
                >
                  <option value="Admin">Admin</option>
                  <option value="Estimator">Estimator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              )}
            </div>

            {isEditingProfile && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-orange-600 text-white rounded font-bold text-sm hover:bg-orange-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={`px-4 py-2 rounded font-bold text-sm ${
                    isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`border rounded-lg p-6 flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h4 className="font-bold">Dark Mode</h4>
          <p className="text-xs opacity-60">Visual theme</p>
        </div>
        <button onClick={onToggleDarkMode} className="bg-slate-200/30 px-4 py-1 rounded-full text-xs font-bold">
          {isDarkMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className={`border rounded-lg p-6 flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h4 className="font-bold">Account</h4>
          <p className="text-xs opacity-60">Signed in as {user?.name ?? 'User'}</p>
        </div>
        <button onClick={onLogout} className="text-red-600 font-bold text-xs">
          Logout
        </button>
      </div>

      <div className="text-xs opacity-60">
        User profiles support: Name, Company, Role (Admin/Estimator/Viewer), and Account Switching.
      </div>
    </div>
  );
}
