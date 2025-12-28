import type { Project } from '../lib/types';

export const seedProjects: Project[] = [
  {
    id: '1',
    name: 'Kitchen Remodel',
    client: 'John Smith',
    status: 'Active',
    budget: 25000,
    balance: 12000,
    completion: 65,
    nextActivity: 'Cabinet Install',
    estimateItems: [],
    aiPlan: '1. Demo\n2. Rough-in',
  },
];
