import { makeAutoObservable, observable, runInAction } from "mobx";
import type {
  Invoice,
  InvoiceListItem,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@construction-tracker/shared";
import { invoicesApi } from "../services/api";
import { rootStore } from "./RootStore";

export class InvoiceStore {
  invoices: InvoiceListItem[] = [];
  total = 0;
  loading = false;
  projectId: string | null = null;

  // UI: form
  formOpen = false;
  editingInvoice: Invoice | null = null;
  loadingForm = false;

  // UI: confirmations / menu
  deletingInvoice: InvoiceListItem | null = null;
  menuAnchor: HTMLElement | null = null;
  menuInvoice: InvoiceListItem | null = null;

  constructor() {
    makeAutoObservable(this, { menuAnchor: observable.ref }, { autoBind: true });
  }

  async loadInvoices(projectId: string) {
    this.projectId = projectId;
    this.loading = true;
    try {
      const result = await invoicesApi.list(projectId, { all: true });
      runInAction(() => {
        this.invoices = result.invoices;
        this.total = result.total;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
      rootStore.snackbarStore.show("Не удалось загрузить накладные", "error");
    }
  }

  reload() {
    if (this.projectId) this.loadInvoices(this.projectId);
  }

  async createInvoice(projectId: string, data: CreateInvoiceInput) {
    try {
      const inv = await invoicesApi.create(projectId, data);
      rootStore.snackbarStore.show("Накладная создана", "success");
      this.reload();
      return inv;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось создать накладную";
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async updateInvoice(id: string, data: UpdateInvoiceInput) {
    try {
      const inv = await invoicesApi.update(id, data);
      rootStore.snackbarStore.show("Накладная обновлена", "success");
      this.reload();
      return inv;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось обновить накладную";
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async deleteInvoice(id: string) {
    try {
      await invoicesApi.delete(id);
      rootStore.snackbarStore.show("Накладная удалена", "success");
      this.reload();
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить накладную";
      rootStore.snackbarStore.show(msg, "error");
    }
  }

  // UI: form
  openAddForm() {
    this.editingInvoice = null;
    this.formOpen = true;
  }

  async openEditForm(item: InvoiceListItem) {
    this.formOpen = true;
    this.loadingForm = true;
    this.editingInvoice = null;
    try {
      const inv = await invoicesApi.get(item.id);
      runInAction(() => {
        this.editingInvoice = inv;
        this.loadingForm = false;
      });
    } catch {
      runInAction(() => {
        this.loadingForm = false;
        this.formOpen = false;
      });
      rootStore.snackbarStore.show("Не удалось загрузить накладную", "error");
    }
  }

  closeForm() {
    this.formOpen = false;
    this.editingInvoice = null;
  }

  // UI: confirmations / menu
  setDeletingInvoice(item: InvoiceListItem | null) {
    this.deletingInvoice = item;
  }

  openMenu(anchor: HTMLElement, item: InvoiceListItem) {
    this.menuAnchor = anchor;
    this.menuInvoice = item;
  }

  closeMenu() {
    this.menuAnchor = null;
    this.menuInvoice = null;
  }
}
