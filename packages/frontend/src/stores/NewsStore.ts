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
