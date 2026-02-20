import { makeAutoObservable, runInAction } from "mobx";
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from "@construction-tracker/shared";
import { expensesApi } from "../services/api";

export class ExpenseStore {
  expenses: Expense[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get materialExpenses() {
    return this.expenses.filter((e) => e.type === "MATERIAL");
  }

  get laborExpenses() {
    return this.expenses.filter((e) => e.type === "LABOR");
  }

  get deliveryExpenses() {
    return this.expenses.filter((e) => e.type === "DELIVERY");
  }

  get totalAmount() {
    return this.expenses.reduce((s, e) => s + e.amount, 0);
  }

  async loadExpenses(projectId: string, type?: string) {
    this.loading = true;
    try {
      const expenses = await expensesApi.list(projectId, type);
      runInAction(() => {
        this.expenses = expenses;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to load expenses";
        this.loading = false;
      });
    }
  }

  async createExpense(projectId: string, data: CreateExpenseInput) {
    try {
      const expense = await expensesApi.create(projectId, data);
      runInAction(() => {
        this.expenses.unshift(expense);
      });
      return expense;
    } catch {
      runInAction(() => {
        this.error = "Failed to create expense";
      });
      return null;
    }
  }

  async updateExpense(id: string, data: UpdateExpenseInput) {
    try {
      const updated = await expensesApi.update(id, data);
      runInAction(() => {
        const idx = this.expenses.findIndex((e) => e.id === id);
        if (idx !== -1) {
          this.expenses[idx] = updated;
        }
      });
      return updated;
    } catch {
      runInAction(() => {
        this.error = "Failed to update expense";
      });
      return null;
    }
  }

  async deleteExpense(id: string) {
    try {
      await expensesApi.delete(id);
      runInAction(() => {
        this.expenses = this.expenses.filter((e) => e.id !== id);
      });
    } catch {
      runInAction(() => {
        this.error = "Failed to delete expense";
      });
    }
  }

  clearError() {
    this.error = null;
  }
}
