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
  supplierId?: string | null;
  carrier?: string | null;
  carrierId?: string | null;
  worker?: string | null;
  workerId?: string | null;
  hoursWorked?: number | null;
  hourlyRate?: number | null;
  planned: boolean;
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
  supplierId?: string;
  carrier?: string;
  carrierId?: string;
  worker?: string;
  workerId?: string;
  hoursWorked?: number;
  hourlyRate?: number;
  planned?: boolean;
  date: string;
  categoryId?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface CreateCategoryInput {
  name: string;
  type: ExpenseType;
}
