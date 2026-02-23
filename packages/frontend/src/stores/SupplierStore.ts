import { makeAutoObservable, runInAction } from "mobx";
import type { Supplier, CreateSupplierInput, UpdateSupplierInput } from "@construction-tracker/shared";
import { suppliersApi } from "../services/api";

export class SupplierStore {
  suppliers: Supplier[] = [];
  loading = false;
  error: string | null = null;
  deletingId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadSuppliers() {
    this.loading = true;
    try {
      const suppliers = await suppliersApi.list();
      runInAction(() => {
        this.suppliers = suppliers;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось загрузить поставщиков";
        this.loading = false;
      });
    }
  }

  async createSupplier(data: CreateSupplierInput) {
    try {
      const supplier = await suppliersApi.create(data);
      runInAction(() => {
        this.suppliers.push(supplier);
        this.suppliers.sort((a, b) => a.name.localeCompare(b.name));
      });
      return supplier;
    } catch {
      runInAction(() => {
        this.error = "Не удалось создать поставщика";
      });
      return null;
    }
  }

  async updateSupplier(id: string, data: UpdateSupplierInput) {
    try {
      const updated = await suppliersApi.update(id, data);
      runInAction(() => {
        const idx = this.suppliers.findIndex((s) => s.id === id);
        if (idx !== -1) {
          this.suppliers[idx] = updated;
        }
      });
      return updated;
    } catch {
      runInAction(() => {
        this.error = "Не удалось обновить поставщика";
      });
      return null;
    }
  }

  async deleteSupplier(id: string) {
    try {
      await suppliersApi.delete(id);
      runInAction(() => {
        this.suppliers = this.suppliers.filter((s) => s.id !== id);
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось удалить поставщика";
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
