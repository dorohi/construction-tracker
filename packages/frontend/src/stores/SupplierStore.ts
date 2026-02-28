import { makeAutoObservable, runInAction } from "mobx";
import type { Supplier, CreateSupplierInput, UpdateSupplierInput } from "@construction-tracker/shared";
import { suppliersApi } from "../services/api";
import { rootStore } from "./RootStore";

export class SupplierStore {
  suppliers: Supplier[] = [];
  loading = false;
  error: string | null = null;

  // UI
  formOpen = false;
  editingSupplier: Supplier | null = null;
  deletingId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // --- UI actions ---

  openAddForm() {
    this.editingSupplier = null;
    this.formOpen = true;
  }

  openEditForm(supplier: Supplier) {
    this.editingSupplier = supplier;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.editingSupplier = null;
  }

  setDeletingId(id: string | null) {
    this.deletingId = id;
  }

  confirmDelete() {
    if (this.deletingId) {
      this.deleteSupplier(this.deletingId);
      this.deletingId = null;
    }
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
        this.suppliers.sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      });
      rootStore.snackbarStore.show("Поставщик добавлен", "success");
      return supplier;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось создать поставщика";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async toggleFavorite(id: string) {
    const supplier = this.suppliers.find((s) => s.id === id);
    if (!supplier) return;
    const updated = await suppliersApi.update(id, { isFavorite: !supplier.isFavorite });
    runInAction(() => {
      const idx = this.suppliers.findIndex((s) => s.id === id);
      if (idx !== -1) this.suppliers[idx] = updated;
      this.suppliers.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    });
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
      rootStore.snackbarStore.show("Поставщик обновлён", "success");
      return updated;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось обновить поставщика";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async deleteSupplier(id: string) {
    try {
      await suppliersApi.delete(id);
      runInAction(() => {
        this.suppliers = this.suppliers.filter((s) => s.id !== id);
      });
      rootStore.snackbarStore.show("Поставщик удалён", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить поставщика";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
    }
  }

  clearError() {
    this.error = null;
  }
}
