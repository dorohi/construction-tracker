import { makeAutoObservable, runInAction } from "mobx";
import type { Carrier, CreateCarrierInput, UpdateCarrierInput } from "@construction-tracker/shared";
import { carriersApi } from "../services/api";
import { rootStore } from "./RootStore";

export class CarrierStore {
  carriers: Carrier[] = [];
  loading = false;
  error: string | null = null;

  // UI
  formOpen = false;
  editingCarrier: Carrier | null = null;
  deletingId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // --- UI actions ---

  openAddForm() {
    this.editingCarrier = null;
    this.formOpen = true;
  }

  openEditForm(carrier: Carrier) {
    this.editingCarrier = carrier;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.editingCarrier = null;
  }

  setDeletingId(id: string | null) {
    this.deletingId = id;
  }

  confirmDelete() {
    if (this.deletingId) {
      this.deleteCarrier(this.deletingId);
      this.deletingId = null;
    }
  }

  async loadCarriers() {
    this.loading = true;
    try {
      const carriers = await carriersApi.list();
      runInAction(() => {
        this.carriers = carriers;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось загрузить доставщиков";
        this.loading = false;
      });
    }
  }

  async createCarrier(data: CreateCarrierInput) {
    try {
      const carrier = await carriersApi.create(data);
      runInAction(() => {
        this.carriers.push(carrier);
        this.carriers.sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      });
      rootStore.snackbarStore.show("Перевозчик добавлен", "success");
      return carrier;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось создать перевозчика";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async toggleFavorite(id: string) {
    const carrier = this.carriers.find((c) => c.id === id);
    if (!carrier) return;
    const updated = await carriersApi.update(id, { isFavorite: !carrier.isFavorite });
    runInAction(() => {
      const idx = this.carriers.findIndex((c) => c.id === id);
      if (idx !== -1) this.carriers[idx] = updated;
      this.carriers.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    });
  }

  async updateCarrier(id: string, data: UpdateCarrierInput) {
    try {
      const updated = await carriersApi.update(id, data);
      runInAction(() => {
        const idx = this.carriers.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.carriers[idx] = updated;
        }
      });
      rootStore.snackbarStore.show("Перевозчик обновлён", "success");
      return updated;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось обновить перевозчика";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async deleteCarrier(id: string) {
    try {
      await carriersApi.delete(id);
      runInAction(() => {
        this.carriers = this.carriers.filter((c) => c.id !== id);
      });
      rootStore.snackbarStore.show("Перевозчик удалён", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить перевозчика";
      runInAction(() => { this.error = msg; });
      rootStore.snackbarStore.show(msg, "error");
    }
  }

  clearError() {
    this.error = null;
  }
}
