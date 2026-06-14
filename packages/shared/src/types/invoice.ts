import type { Expense } from "./expense";

export interface Invoice {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  supplier?: string | null;
  supplierId?: string | null;
  planned: boolean;
  projectId: string;
  items: Expense[];
  total: number;
  createdAt: string;
}

export interface InvoiceListItem {
  id: string;
  title: string;
  supplier?: string | null;
  date: string;
  planned: boolean;
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface InvoiceItemInput {
  id?: string;
  title: string;
  categoryId?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  title: string;
  description?: string;
  date: string;
  supplier?: string;
  supplierId?: string | null;
  planned?: boolean;
  items: InvoiceItemInput[];
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

export interface InvoiceListResponse {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
}
