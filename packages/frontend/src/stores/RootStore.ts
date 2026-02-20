import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";
import { ProjectStore } from "./ProjectStore";
import { ExpenseStore } from "./ExpenseStore";
import { ThemeStore } from "./ThemeStore";

export class RootStore {
  authStore: AuthStore;
  projectStore: ProjectStore;
  expenseStore: ExpenseStore;
  themeStore: ThemeStore;

  constructor() {
    this.authStore = new AuthStore();
    this.projectStore = new ProjectStore();
    this.expenseStore = new ExpenseStore();
    this.themeStore = new ThemeStore();
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export function useStore() {
  return useContext(StoreContext);
}
