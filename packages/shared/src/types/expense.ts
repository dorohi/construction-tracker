export type ExpenseType = "MATERIAL" | "LABOR" | "DELIVERY";

export interface Category {
  id: string;
  name: string;
  type: ExpenseType;
  projectId: string;
}

export interface Expense {
  id: string;
  type: ExpenseType;
  title: string;
  description?: string | null;
  amount: number;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  supplier?: string | null;
  carrier?: string | null;
  workerName?: string | null;
  hoursWorked?: number | null;
  hourlyRate?: number | null;
  date: string;
  categoryId?: string | null;
  category?: Category | null;
  projectId: string;
  createdAt: string;
}

export interface CreateExpenseInput {
  type: ExpenseType;
  title: string;
  description?: string;
  amount: number;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  supplier?: string;
  carrier?: string;
  workerName?: string;
  hoursWorked?: number;
  hourlyRate?: number;
  date: string;
  categoryId?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface CreateCategoryInput {
  name: string;
  type: ExpenseType;
}
