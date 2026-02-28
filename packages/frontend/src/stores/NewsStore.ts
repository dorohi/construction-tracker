import { makeAutoObservable, observable, runInAction } from "mobx";
import type { News } from "@construction-tracker/shared";
import { newsApi } from "@/services/api";
import { rootStore } from "./RootStore";

export class NewsStore {
  news: News[] = [];
  loading = false;
  error: string | null = null;

  // UI
  formOpen = false;
  editingNews: News | null = null;
  deletingId: string | null = null;
  menuAnchor: HTMLElement | null = null;
  menuNewsId: string | null = null;

  constructor() {
    makeAutoObservable(this, { menuAnchor: observable.ref }, { autoBind: true });
  }

  // --- UI actions ---

  openAddForm() {
    this.editingNews = null;
    this.formOpen = true;
  }

  openEditForm(item: News) {
    this.closeMenu();
    this.editingNews = item;
    this.formOpen = true;
  }

  closeForm() {
    this.formOpen = false;
    this.editingNews = null;
  }

  setDeletingId(id: string | null) {
    this.deletingId = id;
  }

  confirmDelete() {
    if (this.deletingId) {
      this.deleteNews(this.deletingId);
      this.deletingId = null;
    }
  }

  openMenu(anchor: HTMLElement, id: string) {
    this.menuAnchor = anchor;
    this.menuNewsId = id;
  }

  closeMenu() {
    this.menuAnchor = null;
    this.menuNewsId = null;
  }

  get menuNews(): News | null {
    return this.news.find((n) => n.id === this.menuNewsId) ?? null;
  }

  handleMenuEdit() {
    if (this.menuNews) {
      this.openEditForm(this.menuNews);
    }
  }

  handleMenuDelete() {
    if (this.menuNewsId) {
      this.setDeletingId(this.menuNewsId);
      this.closeMenu();
    }
  }

  async loadNews() {
    this.loading = true;
    this.error = null;
    try {
      const data = await newsApi.list();
      runInAction(() => {
        this.news = data;
      });
    } catch (e: any) {
      runInAction(() => {
        this.error = e.response?.data?.error || "Ошибка загрузки новостей";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createNews(data: { title: string; content: string }) {
    try {
      const created = await newsApi.create(data);
      runInAction(() => {
        this.news.unshift(created);
      });
      rootStore.snackbarStore.show("Новость опубликована", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось создать новость";
      rootStore.snackbarStore.show(msg, "error");
      throw e;
    }
  }

  async updateNews(id: string, data: { title?: string; content?: string }) {
    try {
      const updated = await newsApi.update(id, data);
      runInAction(() => {
        const idx = this.news.findIndex((n) => n.id === id);
        if (idx !== -1) {
          this.news[idx] = updated;
        }
      });
      rootStore.snackbarStore.show("Новость обновлена", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось обновить новость";
      rootStore.snackbarStore.show(msg, "error");
      throw e;
    }
  }

  async deleteNews(id: string) {
    try {
      await newsApi.delete(id);
      runInAction(() => {
        this.news = this.news.filter((n) => n.id !== id);
      });
      rootStore.snackbarStore.show("Новость удалена", "success");
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить новость";
      rootStore.snackbarStore.show(msg, "error");
      throw e;
    }
  }

  async toggleReaction(newsId: string, type: "like" | "dislike") {
    try {
      const result = await newsApi.react(newsId, type);
      runInAction(() => {
        const item = this.news.find((n) => n.id === newsId);
        if (item) {
          item.likes = result.likes;
          item.dislikes = result.dislikes;
          item.userReaction = result.userReaction;
        }
      });
    } catch (e: any) {
      console.error("Reaction error:", e);
    }
  }
}
