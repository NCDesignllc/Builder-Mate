import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';

import { ROUTES } from './routes';
import type { Project, User } from '../lib/types';

import { LandingPage } from '../pages/LandingPage';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';

/**
 * NOTE:
 * - This router is intentionally "thin" and keeps the app's state management in App.tsx for now.
 * - Pages are presentational and receive props from App.tsx.
 * - We'll refactor shared state into Context/Zustand later if you want.
 */

type Props = {
  user: User | null;
  setUser: (u: User | null) => void;

  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;

  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;

  onGeneratePlan: (projectId: string) => void;
  onSpeak: (text: string) => void;

  // auth handlers (kept in App.tsx)
  onLogin: (email: string, password: string) => void;
  onSignup: (name: string, email: string, password: string) => void;
  onProfile: (title: string) => void;

  // project navigation handler
  onOpenProject: (projectId: string) => void;

  // UI state that was previously in App.tsx header
  searchQuery: string;
  setSearchQuery: (v: string) => void;
};

function RequireAuth({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (!user) return <Navigate to={ROUTES.login} replace />;
  return <>{children}</>;
}

function ProjectDetailRedirect() {
  // Placeholder: We keep detail route now so URLs work.
  // We'll add a real ProjectDetailPage in a later chunk.
  const { id } = useParams();
  return <Navigate to={ROUTES.projects} replace state={{ openProjectId: id }} />;
}

export function AppRouter(props: Props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.landing}
          element={<LandingPage onLogin={() => (window.location.href = ROUTES.login)} onSignup={() => (window.location.href = ROUTES.signup)} />}
        />

        <Route
          path={ROUTES.login}
          element={<AuthPage mode="login" onLogin={props.onLogin} />}
        />
        <Route
          path={ROUTES.signup}
          element={<AuthPage mode="signup" onSignup={props.onSignup} />}
        />
        <Route
          path={ROUTES.profile}
          element={<AuthPage mode="profile" onProfile={props.onProfile} />}
        />

        <Route
          path={ROUTES.app}
          element={<Navigate to={ROUTES.dashboard} replace />}
        />

        <Route
          path={ROUTES.dashboard}
          element={
            <RequireAuth user={props.user}>
              <DashboardPage
                user={props.user}
                isDarkMode={props.isDarkMode}
                setIsDarkMode={props.setIsDarkMode}
                projects={props.projects}
                onSpeak={props.onSpeak}
                searchQuery={props.searchQuery}
                setSearchQuery={props.setSearchQuery}
              />
            </RequireAuth>
          }
        />

        <Route
          path={ROUTES.projects}
          element={
            <RequireAuth user={props.user}>
              <ProjectsPage
                user={props.user}
                isDarkMode={props.isDarkMode}
                setIsDarkMode={props.setIsDarkMode}
                projects={props.projects}
                onGeneratePlan={props.onGeneratePlan}
                onOpenProject={props.onOpenProject}
                searchQuery={props.searchQuery}
                setSearchQuery={props.setSearchQuery}
              />
            </RequireAuth>
          }
        />

        <Route path="/app/projects/:id" element={<ProjectDetailRedirect />} />

        <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
