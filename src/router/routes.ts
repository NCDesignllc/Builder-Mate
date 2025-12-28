export const ROUTES = {
  // public
  landing: '/',
  login: '/login',
  signup: '/signup',
  profile: '/profile',

  // app (protected)
  dashboard: '/app/dashboard',
  projects: '/app/projects',
  settings: '/app/settings',

  // patterns
  projectDetailPattern: '/app/projects/:id',
} as const;

export const routeTo = {
  projectDetail: (id: string) => `/app/projects/${encodeURIComponent(id)}`,
} as const;
