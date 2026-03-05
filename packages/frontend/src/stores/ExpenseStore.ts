import { makeAutoObservable, observable, runInAction } from "mobx";
import type { Expense, CreateExpenseInput, UpdateExpenseInput, TransferExpenseInput, ExpenseType } from "@construction-tracker/shared";
import { expensesApi } from "../services/api";
import { rootStore } from "./RootStore";

export interface ExpenseFilterValues {
  types: ExpenseType[];
  categoryIds: string[];
  title: string;
  dateFrom: string | null;
  dateTo: string | null;
  amountFrom: number | null;
  amountTo: number | null;
  supplier: string;
  carrier: string;
  worker: string;
  plannedStatus: "all" | "planned" | "actual";
}

export const defaultFilters: ExpenseFilterValues = {
  types: [],
  categoryIds: [],
  title: "",
  dateFrom: null,
  dateTo: null,
  amountFrom: null,
  amountTo: null,
  supplier: "",
  carrier: "",
  worker: "",
  plannedStatus: "all",
};

export function countActiveFilters(f: ExpenseFilterValues): number {
  let count = 0;
  if (f.types.length > 0) count++;
  if (f.categoryIds.length > 0) count++;
  if (f.title) count++;
  if (f.dateFrom) count++;
  if (f.dateTo) count++;
  if (f.amountFrom !== null) count++;
  if (f.amountTo !== null) count++;
  if (f.supplier) count++;
  if (f.carrier) count++;
  if (f.worker) count++;
  if (f.plannedStatus !== "all") count++;
  return count;
}

export class ExpenseStore {
  expenses: Expense[] = [];
  total = 0;
  loading = false;
  error: string | null = null;

  // current project id for reloads
  projectId: string | null = null;

  // UI: filters
  filters: ExpenseFilterValues = { ...defaultFilters };
  filtersOpen = false;

  // UI: form
  formOpen = false;
  editingExpense: Expense | null = null;
  duplicatingExpense: Expense | null = null;

  // UI: confirmations
  purchasingExpense: Expense | null = null;
  deletingExpense: Expense | null = null;
  transferringExpense: Expense | null = null;

  // UI: pagination
  page = 0;
  rowsPerPage = 25;

  // UI: actions menu
  menuAnchor: HTMLElement | null = null;
  menuExpense: Expense | null = null;

  constructor() {
    makeAutoObservable(this, {
      menuAnchor: observable.ref,
    }, { autoBind: true });
  }

  // --- Computed ---

  get activeFilterCount() {
    return countActiveFilters(this.filters);
  }

  // --- Actions: API ---

  async loadExpenses(projectId: string) {
    this.projectId = projectId;
    this.loading = true;
    try {
      const { types, categoryIds, title, dateFrom, dateTo, amountFrom, amountTo, supplier, carrier, worker, plannedStatus } = this.filters;
      const result = await expensesApi.list(projectId, {
        page: this.page + 1, // backend is 1-based
        limit: this.rowsPerPage,
        types: types.length > 0 ? types : undefined,
        categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
        title: title || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        amountFrom: amountFrom ?? undefined,
        amountTo: amountTo ?? undefined,
        supplier: supplier || undefined,
        carrier: carrier || undefined,
        worker: worker || undefined,
        plannedStatus: plannedStatus !== "all" ? plannedStatus : undefined,
      });
      runInAction(() => {
        this.expenses = result.expenses;
        this.total = result.total;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to load expenses";
        this.loading = false;
      });
    }
  }

  reload() {
    if (this.projectId) this.loadExpenses(this.projectId);
  }

  async createExpense(projectId: string, data: CreateExpenseInput) {
    try {
      const expense = await expensesApi.create(projectId, data);
      rootStore.snackbarStore.show("Расход добавлен", "success");
      this.reload();
      return expense;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось создать расход";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async updateExpense(id: string, data: UpdateExpenseInput) {
    try {
      const updated = await expensesApi.update(id, data);
      rootStore.snackbarStore.show("Расход обновлён", "success");
      this.reload();
      return updated;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось обновить расход";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async deleteExpense(id: string) {
    try {
      await expensesApi.delete(id);
      rootStore.snackbarStore.show("Расход удалён", "success");
      this.reload();
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить расход";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
    }
  }

  async transferExpense(id: string, data: TransferExpenseInput) {
    try {
      const result = await expensesApi.transfer(id, data);
      rootStore.snackbarStore.show("Трансфер выполнен", "success");
      this.reload();
      return result;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось выполнить трансфер";
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  clearError() {
    this.error = null;
  }

  // --- Actions: UI filters ---

  setFilters(filters: ExpenseFilterValues) {
    this.filters = filters;
    this.page = 0;
    this.reload();
  }

  openFilters() { this.filtersOpen = true; }
  closeFilters() { this.filtersOpen = false; }

  // --- Actions: UI form ---

  openAddForm() {
    this.editingExpense = null;
    this.duplicatingExpense = null;
    this.formOpen = true;
  }

  openEditForm(expense: Expense) {
    this.editingExpense = expense;
    this.duplicatingExpense = null;
    this.formOpen = true;
  }

  openDuplicateForm(expense: Expense) {
    this.editingExpense = null;
    this.duplicatingExpense = expense;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.editingExpense = null;
    this.duplicatingExpense = null;
  }

  // --- Actions: UI confirmations ---

  setPurchasingExpense(expense: Expense | null) { this.purchasingExpense = expense; }
  setDeletingExpense(expense: Expense | null) { this.deletingExpense = expense; }
  setTransferringExpense(expense: Expense | null) { this.transferringExpense = expense; }

  // --- Actions: UI pagination ---

  setPage(page: number) {
    this.page = page;
    this.reload();
  }

  setRowsPerPage(rowsPerPage: number) {
    this.rowsPerPage = rowsPerPage;
    this.page = 0;
    this.reload();
  }

  // --- Actions: UI menu ---

  openMenu(anchor: HTMLElement, expense: Expense) {
    this.menuAnchor = anchor;
    this.menuExpense = expense;
  }

  closeMenu() {
    this.menuAnchor = null;
    this.menuExpense = null;
  }
}
