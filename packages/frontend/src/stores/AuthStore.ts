import { makeAutoObservable, runInAction } from "mobx";
import type { User } from "@construction-tracker/shared";
import { authApi } from "../services/api";

export class AuthStore {
  user: User | null = null;
  token: string | null = null;
  loading = false;
  error: string | null = null;
  logoutDialogOpen: boolean = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadFromStorage();
  }

  get isAuthenticated() {
    return !!this.token;
  }

  private loadFromStorage() {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      this.token = token;
      try {
        this.user = JSON.parse(userStr);
      } catch {
        this.logout();
      }
    }
  }

  async login(email: string, password: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await authApi.login({ email, password });
      runInAction(() => {
        this.token = result.token;
        this.user = result.user;
        this.loading = false;
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      });
    } catch (err: unknown) {
      runInAction(() => {
        const error = err as { response?: { data?: { error?: string } } };
        this.error = error.response?.data?.error || "Ошибка входа";
        this.loading = false;
      });
    }
  }

  async register(name: string, email: string, password: string) {
    this.loading = true;
    this.error = null;
    try {
      const result = await authApi.register({ name, email, password });
      runInAction(() => {
        this.token = result.token;
        this.user = result.user;
        this.loading = false;
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      });
    } catch (err: unknown) {
      runInAction(() => {
        const error = err as { response?: { data?: { error?: string } } };
        this.error = error.response?.data?.error || "Ошибка регистрации";
        this.loading = false;
      });
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  clearError() {
    this.error = null;
  }
}
