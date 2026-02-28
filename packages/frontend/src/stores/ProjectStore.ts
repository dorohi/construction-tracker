import { makeAutoObservable, runInAction } from "mobx";
import type {
  Project,
  ProjectWithTotals,
  Category,
  ProjectSummary,
  ExpenseType,
} from "@construction-tracker/shared";
import { projectsApi, categoriesApi } from "../services/api";

export class ProjectStore {
  projects: ProjectWithTotals[] = [];
  currentProject: (Project & { categories: Category[] }) | null = null;
  summary: ProjectSummary | null = null;
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  // UI
  formOpen = false;
  editingProject: ProjectWithTotals | (Project & { categories: Category[] }) | null = null;
  deletingProjectId: string | null = null;

  // UI: category dialog
  categoryDialogOpen = false;
  newCategoryName = "";
  newCategoryType: ExpenseType = "MATERIAL";
  deletingCategoryId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // --- UI actions ---

  openCreateForm() {
    this.editingProject = null;
    this.formOpen = true;
  }

  openEditForm(project: ProjectWithTotals | (Project & { categories: Category[] })) {
    this.editingProject = project;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.editingProject = null;
  }

  setDeletingProjectId(id: string | null) {
    this.deletingProjectId = id;
  }

  // --- UI: category dialog ---

  openCategoryDialog() { this.categoryDialogOpen = true; }
  closeCategoryDialog() { this.categoryDialogOpen = false; }
  setNewCategoryName(name: string) { this.newCategoryName = name; }
  setNewCategoryType(type: ExpenseType) { this.newCategoryType = type; }
  resetNewCategory() { this.newCategoryName = ""; }
  setDeletingCategoryId(id: string | null) { this.deletingCategoryId = id; }

  confirmDeleteProject() {
    if (this.deletingProjectId) {
      this.deleteProject(this.deletingProjectId);
      this.deletingProjectId = null;
    }
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
        this.error = "Не удалось загрузить проекты";
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
        this.error = "Не удалось загрузить проект";
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
        this.error = "Не удалось создать проект";
      });
    }
  }

  async updateProjectOrder(id: string, order: number | null) {
    try {
      await projectsApi.update(id, { order });
      await this.loadProjects();
    } catch {
      runInAction(() => {
        this.error = "Не удалось обновить порядок проекта";
      });
    }
  }

  async pinProject(id: string) {
    const minOrder = this.projects.reduce((min, p) => {
      if (p.order != null && p.order < min) return p.order;
      return min;
    }, 1);
    const newOrder = this.projects.some((p) => p.order != null) ? minOrder - 1 : 1;
    await this.updateProjectOrder(id, newOrder);
  }

  async unpinProject(id: string) {
    await this.updateProjectOrder(id, null);
  }

  async moveProjectUp(id: string) {
    const pinned = this.projects.filter((p) => p.order != null);
    const idx = pinned.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    const prev = pinned[idx - 1];
    const curr = pinned[idx];
    // Swap orders
    await projectsApi.update(prev.id, { order: curr.order });
    await projectsApi.update(curr.id, { order: prev.order });
    await this.loadProjects();
  }

  async moveProjectDown(id: string) {
    const pinned = this.projects.filter((p) => p.order != null);
    const idx = pinned.findIndex((p) => p.id === id);
    if (idx < 0 || idx >= pinned.length - 1) return;
    const next = pinned[idx + 1];
    const curr = pinned[idx];
    // Swap orders
    await projectsApi.update(next.id, { order: curr.order });
    await projectsApi.update(curr.id, { order: next.order });
    await this.loadProjects();
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
        this.error = "Не удалось обновить проект";
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
        this.error = "Не удалось удалить проект";
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
        this.error = "Не удалось создать категорию";
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
        this.error = "Не удалось удалить категорию";
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
