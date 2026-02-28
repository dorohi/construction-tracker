import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";
import { ProjectStore } from "./ProjectStore";
import { ExpenseStore } from "./ExpenseStore";
import { SupplierStore } from "./SupplierStore";
import { CarrierStore } from "./CarrierStore";
import { ThemeStore } from "./ThemeStore";
import { UIStore } from "./UIStore";
import { WorkersStore } from '@/stores/WorkersStore';
import { NewsStore } from './NewsStore';
import { AdminStore } from './AdminStore';
import { SnackbarStore } from './SnackbarStore';

export class RootStore {
  authStore: AuthStore;
  projectStore: ProjectStore;
  expenseStore: ExpenseStore;
  supplierStore: SupplierStore;
  carrierStore: CarrierStore;
  workersStore: WorkersStore;
  newsStore: NewsStore;
  adminStore: AdminStore;
  themeStore: ThemeStore;
  uiStore: UIStore;
  snackbarStore: SnackbarStore;

  constructor() {
    this.authStore = new AuthStore();
    this.projectStore = new ProjectStore();
    this.expenseStore = new ExpenseStore();
    this.supplierStore = new SupplierStore();
    this.carrierStore = new CarrierStore();
    this.workersStore = new WorkersStore();
    this.newsStore = new NewsStore();
    this.adminStore = new AdminStore();
    this.themeStore = new ThemeStore();
    this.uiStore = new UIStore();
    this.snackbarStore = new SnackbarStore();
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export function useStore() {
  return useContext(StoreContext);
}
