import { makeAutoObservable, runInAction } from "mobx";
import type { Worker, CreateWorkerInput, UpdateWorkerInput } from "@construction-tracker/shared";
import { workersApi } from "../services/api";

export class WorkersStore {
  workers: Worker[] = [];
  loading = false;
  error: string | null = null;
  deletingId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadWorkers() {
    this.loading = true;
    try {
      const workers = await workersApi.list();
      runInAction(() => {
        this.workers = workers;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось загрузить работников";
        this.loading = false;
      });
    }
  }

  async createWorker(data: CreateWorkerInput) {
    try {
      const worker = await workersApi.create(data);
      runInAction(() => {
        this.workers.push(worker);
        this.workers.sort((a, b) => a.name.localeCompare(b.name));
      });
      return worker;
    } catch {
      runInAction(() => {
        this.error = "Не удалось создать работника";
      });
      return null;
    }
  }

  async updateWorker(id: string, data: UpdateWorkerInput) {
    try {
      const updated = await workersApi.update(id, data);
      runInAction(() => {
        const idx = this.workers.findIndex((s) => s.id === id);
        if (idx !== -1) {
          this.workers[idx] = updated;
        }
      });
      return updated;
    } catch {
      runInAction(() => {
        this.error = "Не удалось обновить работника";
      });
      return null;
    }
  }

  async deleteWorker(id: string) {
    try {
      await workersApi.delete(id);
      runInAction(() => {
        this.workers = this.workers.filter((s) => s.id !== id);
      });
    } catch {
      runInAction(() => {
        this.error = "Не удалось удалить работника";
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
