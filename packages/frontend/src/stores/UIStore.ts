import { makeAutoObservable } from "mobx";

const STORAGE_KEY = "sidebar-open";

export class UIStore {
  sidebarOpen: boolean;

  constructor() {
    this.sidebarOpen = localStorage.getItem(STORAGE_KEY) !== "false";
    makeAutoObservable(this);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    localStorage.setItem(STORAGE_KEY, String(this.sidebarOpen));
  }

  closeSidebar() {
    this.sidebarOpen = false;
    localStorage.setItem(STORAGE_KEY, "false");
  }
}
