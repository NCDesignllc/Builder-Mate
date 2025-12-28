import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from './routes';
import type { Project, User, EstimateItem } from '../lib/types';

import { LandingPage } from '../pages/LandingPage';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AppShell } from '../components/ui/AppShell';
import { NewJobButton } from '../components/ui/NewJobButton';
import { NewProjectModal } from '../components/project/NewProjectModal';
import { uid } from '../lib/id';

type Props = {
  user: User | null;
  setUser: (u: User | null) => void;

  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;

  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;

  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;

  estimateItems: EstimateItem[];
  setEstimateItems: React.Dispatch<React.SetStateAction<EstimateItem[]>>;

  onGeneratePlan: (projectId: string) => void;
  onSpeak: (text: string) => void;

  onLogin: (email: string, password: string) => void;
  onSignup: (name: string, email: string, password: string) => void;
  onProfile: (title: string) => void;

  searchQuery: string;
  setSearchQuery: (v: string) => void;
};

function RequireAuth({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (!user) return <Navigate to={ROUTES.login} replace />;
  return <>{children}</>;
}

function ProjectDetailRoute(props: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = props.projects.find((p) => p.id === id);
  if (!id || !project) return <Navigate to={ROUTES.projects} replace />;

  if (props.activeProjectId !== id) {
    props.setActiveProjectId(id);
    props.setEstimateItems(project.estimateItems ?? []);
  }

  return (
    <ProjectDetailPage
      projectId={id}
      isDarkMode={props.isDarkMode}
      onBack={() => navigate(ROUTES.projects)}
    />
  );
}

function ShellRoute({
  props,
  children,
  headerActions,
}: {
  props: Props;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const onLogout = () => {
    props.setUser(null);
    navigate(ROUTES.landing, { replace: true });
  };

  return (
    <AppShell
      user={props.user}
      isDarkMode={props.isDarkMode}
      onToggleDarkMode={() => props.setIsDarkMode(!props.isDarkMode)}
      onLogout={onLogout}
      searchQuery={props.searchQuery}
      setSearchQuery={props.setSearchQuery}
      headerActions={headerActions}
    >
      {children}
    </AppShell>
  );
}

export function AppRouterIntegrated(props: Props) {
  const [newJobOpen, setNewJobOpen] = useState(false);

  const NewJobModalWrapper = () => {
    const navigate = useNavigate();
    return (
      <NewProjectModal
        isOpen={newJobOpen}
        onClose={() => setNewJobOpen(false)}
        isDarkMode={props.isDarkMode}
        onCreate={(data) => {
          const id = uid('p-');
          const p: Project = {
            id,
            name: data.name,
            client: data.client,
            status: 'Lead',
            budget: 0,
            balance: 0,
            completion: 0,
            nextActivity: '',
            estimateItems: [],
            aiPlan: '',
          };
          props.setProjects((prev) => [...prev, p]);
          props.setActiveProjectId(id);
          props.setEstimateItems([]);
          setNewJobOpen(false);
          navigate(`/app/projects/${id}`);
        }}
      />
    );
  };

  const headerActions = <NewJobButton onClick={() => setNewJobOpen(true)} />;

  const primeOpenProject = (id: string) => {
    props.setActiveProjectId(id);
    const p = props.projects.find((x) => x.id === id);
    props.setEstimateItems(p?.estimateItems ?? []);
  };

  return (
    <BrowserRouter>
      <NewJobModalWrapper />
      <Routes>
        <Route path={ROUTES.landing} element={<LandingPage />} />
        <Route path={ROUTES.login} element={<AuthPage mode="login" onLogin={props.onLogin} />} />
        <Route path={ROUTES.signup} element={<AuthPage mode="signup" onSignup={props.onSignup} />} />
        <Route path={ROUTES.profile} element={<AuthPage mode="profile" onProfile={props.onProfile} />} />

        <Route
          path={ROUTES.dashboard}
          element={
            <RequireAuth user={props.user}>
              <ShellRoute props={props} headerActions={headerActions}>
                <DashboardPage
                  user={props.user}
                  isDarkMode={props.isDarkMode}
                  setIsDarkMode={props.setIsDarkMode}
                  projects={props.projects}
                  onSpeak={props.onSpeak}
                  searchQuery={props.searchQuery}
                  setSearchQuery={props.setSearchQuery}
                />
              </ShellRoute>
            </RequireAuth>
          }
        />

        <Route
          path={ROUTES.projects}
          element={
            <RequireAuth user={props.user}>
              <ShellRoute props={props} headerActions={headerActions}>
                <ProjectsPage
                  user={props.user}
                  isDarkMode={props.isDarkMode}
                  setIsDarkMode={props.setIsDarkMode}
                  projects={props.projects}
                  onGeneratePlan={props.onGeneratePlan}
                  onPrimeOpenProject={primeOpenProject}
                  searchQuery={props.searchQuery}
                  setSearchQuery={props.setSearchQuery}
                />
              </ShellRoute>
            </RequireAuth>
          }
        />

        <Route
          path={ROUTES.projectDetailPattern}
          element={
            <RequireAuth user={props.user}>
              <ShellRoute props={props} headerActions={headerActions}>
                <ProjectDetailRoute {...props} />
              </ShellRoute>
            </RequireAuth>
          }
        />

        <Route
          path={ROUTES.settings}
          element={
            <RequireAuth user={props.user}>
              <ShellRoute props={props} headerActions={headerActions}>
                <SettingsPage
                  user={props.user}
                  isDarkMode={props.isDarkMode}
                  onToggleDarkMode={() => props.setIsDarkMode(!props.isDarkMode)}
                  onLogout={() => props.setUser(null)}
                />
              </ShellRoute>
            </RequireAuth>
          }
        />

        <Route
          path="/app"
          element={
            <RequireAuth user={props.user}>
              <Navigate to={ROUTES.dashboard} replace />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
