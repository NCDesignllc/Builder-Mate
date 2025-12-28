export type EstimateItemType = 'Material' | 'Labor' | 'Other';

export type EstimateItem = {
  id: number;
  description: string;
  type: EstimateItemType;
  quantity: number;
  rate: number;
};

export type ProjectStatus = 'Active' | 'Lead' | 'Closed';

export type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  budget: number;
  balance: number;
  completion: number;
  nextActivity?: string;
  estimateItems: EstimateItem[];
  aiPlan?: string;
};

export type UserRole = 'Admin' | 'Estimator' | 'Viewer';

export type User = {
  id: string;
  name: string;
  title: string;
  email?: string;
  company?: string;
  profilePhotoUrl?: string;
  role: UserRole;
};
