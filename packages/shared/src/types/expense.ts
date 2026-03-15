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
  calloutFee?: number | null;
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
  calloutFee?: number;
  planned?: boolean;
  date: string;
  categoryId?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface TransferExpenseInput {
  targetProjectId: string;
  targetType: ExpenseType;
  targetCategoryId?: string;
  quantity: number;
  description?: string;
}

export interface CreateCategoryInput {
  name: string;
  type: ExpenseType;
}

export interface ExpenseFilters {
  types?: ExpenseType[];
  categoryIds?: string[];
  title?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  supplier?: string;
  carrier?: string;
  worker?: string;
  plannedStatus?: "all" | "planned" | "actual";
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
}
