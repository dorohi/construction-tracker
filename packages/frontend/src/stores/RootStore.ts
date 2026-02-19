import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";
import { ProjectStore } from "./ProjectStore";
import { ExpenseStore } from "./ExpenseStore";

export class RootStore {
  authStore: AuthStore;
  projectStore: ProjectStore;
  expenseStore: ExpenseStore;

  constructor() {
    this.authStore = new AuthStore();
    this.projectStore = new ProjectStore();
    this.expenseStore = new ExpenseStore();
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export function useStore() {
  return useContext(StoreContext);
}
