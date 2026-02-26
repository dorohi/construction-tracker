import { makeAutoObservable, runInAction } from "mobx";
import type { AdminDashboard } from "@construction-tracker/shared";
import { adminApi } from "@/services/api";

export class AdminStore {
  dashboard: AdminDashboard | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadDashboard() {
    this.loading = true;
    this.error = null;
    try {
      const data = await adminApi.dashboard();
      runInAction(() => {
        this.dashboard = data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.error || "Ошибка загрузки данных";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
