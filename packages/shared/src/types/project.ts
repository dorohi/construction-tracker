export interface Project {
  id: string;
  name: string;
  description?: string | null;
  budget?: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithTotals extends Project {
  totalSpent: number;
  plannedTotal: number;
  materialTotal: number;
  laborTotal: number;
  deliveryTotal: number;
  expenseCount: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  budget?: number;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}
