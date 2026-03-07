import { makeAutoObservable, runInAction } from "mobx";
import type { SharedProject, SharedProjectDetail, Expense } from "@construction-tracker/shared";
import { sharedApi } from "../services/api";

export interface SharedFilterValues {
  types: string[];
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

export const defaultSharedFilters: SharedFilterValues = {
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

export function countSharedFilters(f: SharedFilterValues): number {
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

export class SharedStore {
  projects: SharedProject[] = [];
  detail: SharedProjectDetail | null = null;
  loading = false;
  error: string | null = null;

  // Filters & pagination
  filters: SharedFilterValues = { ...defaultSharedFilters };
  filtersOpen = false;
  page = 0;
  rowsPerPage = 25;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get activeFilterCount() {
    return countSharedFilters(this.filters);
  }

  get allExpenses(): Expense[] {
    return this.detail?.expenses ?? [];
  }

  get filteredExpenses(): Expense[] {
    const f = this.filters;
    return this.allExpenses.filter((e) => {
      if (f.types.length > 0 && !f.types.includes(e.type)) return false;
      if (f.categoryIds.length > 0 && (!e.categoryId || !f.categoryIds.includes(e.categoryId))) return false;
      if (f.title && !e.title.toLowerCase().includes(f.title.toLowerCase())) return false;
      if (f.dateFrom && e.date < f.dateFrom) return false;
      if (f.dateTo && e.date > f.dateTo + "T23:59:59") return false;
      if (f.amountFrom !== null && e.amount < f.amountFrom) return false;
      if (f.amountTo !== null && e.amount > f.amountTo) return false;
      if (f.supplier && !(e.supplier || "").toLowerCase().includes(f.supplier.toLowerCase())) return false;
      if (f.carrier && !(e.carrier || "").toLowerCase().includes(f.carrier.toLowerCase())) return false;
      if (f.worker && !(e.worker || "").toLowerCase().includes(f.worker.toLowerCase())) return false;
      if (f.plannedStatus === "planned" && !e.planned) return false;
      if (f.plannedStatus === "actual" && e.planned) return false;
      return true;
    });
  }

  get totalFiltered() {
    return this.filteredExpenses.length;
  }

  get paginatedExpenses(): Expense[] {
    const start = this.page * this.rowsPerPage;
    return this.filteredExpenses.slice(start, start + this.rowsPerPage);
  }

  get uniqueCategories() {
    const map = new Map<string, { id: string; name: string; type: string }>();
    for (const e of this.allExpenses) {
      if (e.category && e.categoryId && !map.has(e.categoryId)) {
        map.set(e.categoryId, { id: e.categoryId, name: e.category.name, type: e.category.type });
      }
    }
    return Array.from(map.values());
  }

  get uniqueSuppliers(): string[] {
    return [...new Set(this.allExpenses.map((e) => e.supplier).filter(Boolean) as string[])];
  }

  get uniqueCarriers(): string[] {
    return [...new Set(this.allExpenses.map((e) => e.carrier).filter(Boolean) as string[])];
  }

  get uniqueWorkers(): string[] {
    return [...new Set(this.allExpenses.map((e) => e.worker).filter(Boolean) as string[])];
  }

  // --- Actions ---

  setFilters(filters: SharedFilterValues) {
    this.filters = filters;
    this.page = 0;
  }

  resetFilters() {
    this.filters = { ...defaultSharedFilters };
    this.page = 0;
  }

  openFilters() { this.filtersOpen = true; }
  closeFilters() { this.filtersOpen = false; }

  setPage(page: number) { this.page = page; }
  setRowsPerPage(rpp: number) {
    this.rowsPerPage = rpp;
    this.page = 0;
  }

  async loadProjects() {
    this.loading = true;
    this.error = null;
    try {
      const projects = await sharedApi.list();
      runInAction(() => {
        this.projects = projects;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось загрузить публичные проекты";
        this.loading = false;
      });
    }
  }

  async loadProject(token: string) {
    this.loading = true;
    this.error = null;
    this.detail = null;
    this.filters = { ...defaultSharedFilters };
    this.page = 0;
    try {
      const detail = await sharedApi.get(token);
      runInAction(() => {
        this.detail = detail;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Проект не найден или не является публичным";
        this.loading = false;
      });
    }
  }
}
