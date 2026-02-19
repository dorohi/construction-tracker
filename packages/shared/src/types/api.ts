import type { User } from "./user";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProjectSummary {
  totalSpent: number;
  materialTotal: number;
  laborTotal: number;
  remaining: number | null;
  budget: number | null;
  byCategory: CategorySummary[];
}

export interface CategorySummary {
  categoryId: string | null;
  categoryName: string;
  type: string;
  total: number;
  count: number;
}
