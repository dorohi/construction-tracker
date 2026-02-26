export interface AdminUserInfo {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  projectsCount: number;
  suppliersCount: number;
  carriersCount: number;
  workersCount: number;
  totalExpenses: number;
}

export interface AdminSummary {
  totalUsers: number;
  totalProjects: number;
  totalExpenses: number;
  totalSuppliers: number;
  totalCarriers: number;
  totalWorkers: number;
}

export interface AdminDashboard {
  summary: AdminSummary;
  users: AdminUserInfo[];
}
