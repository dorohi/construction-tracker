import { makeAutoObservable, runInAction } from "mobx";
import type { News } from "@construction-tracker/shared";
import { newsApi } from "@/services/api";

export class NewsStore {
  news: News[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
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
    const created = await newsApi.create(data);
    runInAction(() => {
      this.news.unshift(created);
    });
  }

  async updateNews(id: string, data: { title?: string; content?: string }) {
    const updated = await newsApi.update(id, data);
    runInAction(() => {
      const idx = this.news.findIndex((n) => n.id === id);
      if (idx !== -1) {
        this.news[idx] = updated;
      }
    });
  }

  async deleteNews(id: string) {
    await newsApi.delete(id);
    runInAction(() => {
      this.news = this.news.filter((n) => n.id !== id);
    });
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
