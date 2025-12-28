import type { AppState } from './storeTypes';
import { seedProjects } from '../data/seedProjects';

export const initialState: AppState = {
  isDarkMode: false,
  searchQuery: '',
  user: null,

  projects: seedProjects,
  activeProjectId: null,
  estimateItems: [],
};
