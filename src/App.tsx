import React, { useMemo, useState } from 'react';
import type { EstimateItem, Project, User } from './lib/types';
import { useProjectsStore } from './store/useProjectsStore';
import { AppRouterIntegrated } from './router/AppRouter.integrated';
import { useTTS } from './hooks/useTTS';
import { useGemini } from './hooks/useGemini';

/**
 * Legacy App wrapper:
 * - Keeps auth + ui toggles in component state
 * - Uses ProjectsStore as the single source of truth for projects
 */

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { projects, setProjects } = useProjectsStore();
  const { speak } = useTTS();
  const { generateContent } = useGemini();

  const onLogin = (_email: string, _password: string) => setUser({ 
    id: 'user-1',
    name: 'Alex Johnson', 
    title: 'Estimator',
    email: _email,
    role: 'Estimator'
  });
  const onSignup = (name: string, email: string, _password: string, company: string) => setUser({ 
    id: `user-${Date.now()}`,
    name, 
    title: 'Estimator',
    email,
    company,
    role: 'Estimator'
  });
  const onProfile = (title: string) => setUser((u) => (u ? { ...u, title } : { 
    id: 'user-1',
    name: 'Alex Johnson', 
    title,
    role: 'Estimator'
  }));

  const onGeneratePlan = async (projectId: string) => {
    const p = projects.find((x) => x.id === projectId);
    if (!p) return;
    const plan = await generateContent(`Plan for ${p.name}`, '3 step plan');
    if (!plan) return;
    setProjects((prev) => prev.map((x) => (x.id === projectId ? { ...x, aiPlan: plan } : x)));
  };

  // lightweight stats used by some pages (optional)
  const stats = useMemo(() => ({
    active: projects.filter((p) => p.status === 'Active').length,
    pending: projects.filter((p) => p.status === 'Lead').length,
    totalValue: projects.reduce((acc, p) => acc + Number(p.budget ?? 0), 0),
  }), [projects]);

  return (
    // IMPORTANT: Give the app a real viewport-owned root so takeoff canvases
    // can truly fill the screen (and fullscreen/focus overlays can use fixed).
    <div className="h-screen w-screen overflow-hidden">
      <AppRouterIntegrated
        user={user}
        setUser={setUser}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        projects={projects}
        setProjects={setProjects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        estimateItems={estimateItems}
        setEstimateItems={setEstimateItems}
        onGeneratePlan={onGeneratePlan}
        onSpeak={speak}
        onLogin={onLogin}
        onSignup={onSignup}
        onProfile={onProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        // stats is computed in pages now; kept here for compatibility if needed later
        // @ts-ignore legacy passthrough
        stats={stats}
      />
    </div>
  );
}
