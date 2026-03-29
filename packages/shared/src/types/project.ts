export interface Project {
  id: string;
  name: string;
  description?: string | null;
  budget?: number | null;
  order?: number | null;
  isPublic?: boolean;
  shareToken?: string | null;
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
  toolTotal: number;
  expenseCount: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  budget?: number;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  order?: number | null;
}

export interface SharedProject {
  id: string;
  name: string;
  description?: string | null;
  budget?: number | null;
  ownerName: string;
  totalSpent: number;
  plannedTotal: number;
  materialTotal: number;
  laborTotal: number;
  deliveryTotal: number;
  toolTotal: number;
  expenseCount: number;
  shareToken: string;
  createdAt: string;
}

export interface SharedProjectDetail {
  project: {
    name: string;
    description?: string | null;
    budget?: number | null;
    ownerName: string;
    createdAt: string;
  };
  summary: import("./api").ProjectSummary;
  expenses: import("./expense").Expense[];
}
