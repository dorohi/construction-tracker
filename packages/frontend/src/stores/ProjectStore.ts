import { makeAutoObservable, runInAction } from "mobx";
import type {
  Project,
  ProjectWithTotals,
  Category,
  ProjectSummary,
} from "@construction-tracker/shared";
import { projectsApi, categoriesApi } from "../services/api";

export class ProjectStore {
  projects: ProjectWithTotals[] = [];
  currentProject: (Project & { categories: Category[] }) | null = null;
  summary: ProjectSummary | null = null;
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  async loadProjects() {
    this.loading = true;
    try {
      const projects = await projectsApi.list();
      runInAction(() => {
        this.projects = projects;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to load projects";
        this.loading = false;
      });
    }
  }

  async loadProject(id: string) {
    this.loading = true;
    try {
      const [project, summary, categories] = await Promise.all([
        projectsApi.get(id),
        projectsApi.summary(id),
        categoriesApi.list(id),
      ]);
      runInAction(() => {
        this.currentProject = project;
        this.summary = summary;
        this.categories = categories;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to load project";
        this.loading = false;
      });
    }
  }

  async createProject(name: string, description?: string, budget?: number) {
    try {
      await projectsApi.create({ name, description, budget });
      await this.loadProjects();
    } catch {
      runInAction(() => {
        this.error = "Failed to create project";
      });
    }
  }

  async updateProject(
    id: string,
    data: { name?: string; description?: string; budget?: number }
  ) {
    try {
      await projectsApi.update(id, data);
      await this.loadProjects();
      if (this.currentProject?.id === id) {
        await this.loadProject(id);
      }
    } catch {
      runInAction(() => {
        this.error = "Failed to update project";
      });
    }
  }

  async deleteProject(id: string) {
    try {
      await projectsApi.delete(id);
      runInAction(() => {
        this.projects = this.projects.filter((p) => p.id !== id);
        if (this.currentProject?.id === id) {
          this.currentProject = null;
        }
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to delete project";
      });
    }
  }

  async createCategory(
    projectId: string,
    name: string,
    type: "MATERIAL" | "LABOR" | "DELIVERY"
  ) {
    try {
      const category = await categoriesApi.create(projectId, { name, type });
      runInAction(() => {
        this.categories.push(category);
        if (this.currentProject) {
          this.currentProject.categories.push(category);
        }
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to create category";
      });
    }
  }

  async deleteCategory(projectId: string, categoryId: string) {
    try {
      await categoriesApi.delete(projectId, categoryId);
      runInAction(() => {
        this.categories = this.categories.filter((c) => c.id !== categoryId);
        if (this.currentProject) {
          this.currentProject.categories = this.currentProject.categories.filter(
            (c) => c.id !== categoryId
          );
        }
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to delete category";
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
