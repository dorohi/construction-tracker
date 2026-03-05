import { makeAutoObservable, runInAction } from "mobx";
import type { AuditLog, AuditLogFilters } from "@construction-tracker/shared";
import { auditApi } from "@/services/api";

export class AuditLogStore {
  logs: AuditLog[] = [];
  total = 0;
  page = 1;
  limit = 25;
  loading = false;

  filters: AuditLogFilters = {};
  filtersOpen = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  setPage(page: number) {
    this.page = page;
    this.loadLogs();
  }

  setFilters(filters: AuditLogFilters) {
    this.filters = filters;
    this.page = 1;
    this.loadLogs();
  }

  clearFilters() {
    this.filters = {};
    this.page = 1;
    this.loadLogs();
  }

  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  async loadLogs() {
    this.loading = true;
    try {
      const result = await auditApi.list({
        ...this.filters,
        page: this.page,
        limit: this.limit,
      });
      runInAction(() => {
        this.logs = result.logs;
        this.total = result.total;
        this.page = result.page;
        this.limit = result.limit;
      });
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
