import { makeAutoObservable } from "mobx";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme-mode";

export class ThemeStore {
  mode: ThemeMode;

  constructor() {
    this.mode = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "light";
    makeAutoObservable(this, {}, { autoBind: true });
  }

  toggleTheme() {
    this.mode = this.mode === "light" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, this.mode);
  }
}
