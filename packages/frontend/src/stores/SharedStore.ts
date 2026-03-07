import { makeAutoObservable, runInAction } from "mobx";
import type { SharedProject, SharedProjectDetail } from "@construction-tracker/shared";
import { sharedApi } from "../services/api";

export class SharedStore {
  projects: SharedProject[] = [];
  detail: SharedProjectDetail | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
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
