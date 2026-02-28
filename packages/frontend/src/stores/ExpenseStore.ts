import { makeAutoObservable, observable, runInAction } from "mobx";
import type { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseType } from "@construction-tracker/shared";
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
  loading = false;
  error: string | null = null;

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

  // --- Computed: data ---

  get materialExpenses() {
    return this.expenses.filter((e) => e.type === "MATERIAL");
  }

  get laborExpenses() {
    return this.expenses.filter((e) => e.type === "LABOR");
  }

  get deliveryExpenses() {
    return this.expenses.filter((e) => e.type === "DELIVERY");
  }

  get plannedExpenses() {
    return this.expenses.filter((e) => e.planned);
  }

  get actualExpenses() {
    return this.expenses.filter((e) => !e.planned);
  }

  get totalAmount() {
    return this.expenses.reduce((s, e) => s + e.amount, 0);
  }

  get filteredExpenses() {
    let result = this.expenses;
    const f = this.filters;

    if (f.types.length > 0) {
      result = result.filter((e) => f.types.includes(e.type));
    }
    if (f.categoryIds.length > 0) {
      result = result.filter((e) => e.categoryId && f.categoryIds.includes(e.categoryId));
    }
    if (f.title) {
      const search = f.title.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(search));
    }
    if (f.dateFrom) {
      result = result.filter((e) => e.date >= f.dateFrom!);
    }
    if (f.dateTo) {
      result = result.filter((e) => e.date <= f.dateTo! + "T23:59:59");
    }
    if (f.amountFrom !== null) {
      result = result.filter((e) => e.amount >= f.amountFrom!);
    }
    if (f.amountTo !== null) {
      result = result.filter((e) => e.amount <= f.amountTo!);
    }
    if (f.supplier) {
      const s = f.supplier.toLowerCase();
      result = result.filter((e) => e.supplier?.toLowerCase().includes(s));
    }
    if (f.carrier) {
      const s = f.carrier.toLowerCase();
      result = result.filter((e) => e.carrier?.toLowerCase().includes(s));
    }
    if (f.worker) {
      const s = f.worker.toLowerCase();
      result = result.filter((e) => e.worker?.toLowerCase().includes(s));
    }
    if (f.plannedStatus === "planned") {
      result = result.filter((e) => e.planned);
    } else if (f.plannedStatus === "actual") {
      result = result.filter((e) => !e.planned);
    }

    return result;
  }

  get paginatedExpenses() {
    return this.filteredExpenses.slice(
      this.page * this.rowsPerPage,
      this.page * this.rowsPerPage + this.rowsPerPage,
    );
  }

  get activeFilterCount() {
    return countActiveFilters(this.filters);
  }

  // --- Actions: API ---

  async loadExpenses(projectId: string, type?: string) {
    this.loading = true;
    try {
      const expenses = await expensesApi.list(projectId, type);
      runInAction(() => {
        this.expenses = expenses;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to load expenses";
        this.loading = false;
      });
    }
  }

  async createExpense(projectId: string, data: CreateExpenseInput) {
    try {
      const expense = await expensesApi.create(projectId, data);
      runInAction(() => {
        this.expenses.unshift(expense);
      });
      rootStore.snackbarStore.show("Расход добавлен", "success");
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
      runInAction(() => {
        const idx = this.expenses.findIndex((e) => e.id === id);
        if (idx !== -1) {
          this.expenses[idx] = updated;
        }
      });
      rootStore.snackbarStore.show("Расход обновлён", "success");
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
      runInAction(() => {
        this.expenses = this.expenses.filter((e) => e.id !== id);
      });
      rootStore.snackbarStore.show("Расход удалён", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить расход";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
    }
  }

  clearError() {
    this.error = null;
  }

  // --- Actions: UI filters ---

  setFilters(filters: ExpenseFilterValues) {
    this.filters = filters;
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

  // --- Actions: UI pagination ---

  setPage(page: number) { this.page = page; }
  setRowsPerPage(rowsPerPage: number) {
    this.rowsPerPage = rowsPerPage;
    this.page = 0;
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
