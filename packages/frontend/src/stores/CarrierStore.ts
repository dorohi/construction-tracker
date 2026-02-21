import { makeAutoObservable, runInAction } from "mobx";
import type { Carrier, CreateCarrierInput, UpdateCarrierInput } from "@construction-tracker/shared";
import { carriersApi } from "../services/api";

export class CarrierStore {
  carriers: Carrier[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
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
        this.carriers.sort((a, b) => a.name.localeCompare(b.name));
      });
      return carrier;
    } catch {
      runInAction(() => {
        this.error = "Не удалось создать доставщика";
      });
      return null;
    }
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
      return updated;
    } catch {
      runInAction(() => {
        this.error = "Не удалось обновить доставщика";
      });
      return null;
    }
  }

  async deleteCarrier(id: string) {
    try {
      await carriersApi.delete(id);
      runInAction(() => {
        this.carriers = this.carriers.filter((c) => c.id !== id);
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось удалить доставщика";
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
