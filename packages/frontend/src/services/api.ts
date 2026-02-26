import axios from "axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginInput,
  RegisterInput,
  Project,
  ProjectWithTotals,
  CreateProjectInput,
  UpdateProjectInput,
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  Category,
  CreateCategoryInput,
  ProjectSummary,
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  Carrier,
  CreateCarrierInput,
  UpdateCarrierInput,
  Worker,
  UpdateWorkerInput,
  CreateWorkerInput,
  News,
  AdminDashboard,
} from "@construction-tracker/shared";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data)
      .then((r) => r.data.data!),
  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data)
      .then((r) => r.data.data!),
};

// Projects
export const projectsApi = {
  list: () =>
    api.get<ApiResponse<ProjectWithTotals[]>>("/projects")
      .then((r) => r.data.data!),
  get: (id: string) =>
    api.get<ApiResponse<Project & { categories: Category[] }>>(`/projects/${id}`)
      .then((r) => r.data.data!),
  create: (data: CreateProjectInput) =>
    api.post<ApiResponse<Project>>("/projects", data)
      .then((r) => r.data.data!),
  update: (id: string, data: UpdateProjectInput) =>
    api.put<ApiResponse<Project>>(`/projects/${id}`, data)
      .then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/projects/${id}`),
  summary: (id: string) =>
    api.get<ApiResponse<ProjectSummary>>(`/projects/${id}/summary`)
      .then((r) => r.data.data!),
};

// Expenses
export const expensesApi = {
  list: async (projectId: string, type?: string) => {
    const params = type ? `?type=${type}` : "";
    const r = await api
      .get<ApiResponse<Expense[]>>(`/projects/${projectId}/expenses${params}`);
    return r.data.data!;
  },
  create: (projectId: string, data: CreateExpenseInput) =>
    api.post<ApiResponse<Expense>>(`/projects/${projectId}/expenses`, data)
      .then((r) => r.data.data!),
  update: (id: string, data: UpdateExpenseInput) =>
    api.put<ApiResponse<Expense>>(`/expenses/${id}`, data)
      .then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/expenses/${id}`),
};

// Categories
export const categoriesApi = {
  list: (projectId: string) =>
    api.get<ApiResponse<Category[]>>(`/projects/${projectId}/categories`)
      .then((r) => r.data.data!),
  create: (projectId: string, data: CreateCategoryInput) =>
    api.post<ApiResponse<Category>>(`/projects/${projectId}/categories`, data)
      .then((r) => r.data.data!),
  delete: (projectId: string, categoryId: string) =>
    api.delete(`/projects/${projectId}/categories`, { data: { categoryId } }),
};

// Suppliers
export const suppliersApi = {
  list: () =>
    api.get<ApiResponse<Supplier[]>>("/suppliers")
      .then((r) => r.data.data!),
  get: (id: string) =>
    api.get<ApiResponse<Supplier>>(`/suppliers/${id}`)
      .then((r) => r.data.data!),
  create: (data: CreateSupplierInput) =>
    api.post<ApiResponse<Supplier>>("/suppliers", data)
      .then((r) => r.data.data!),
  update: (id: string, data: UpdateSupplierInput) =>
    api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data)
      .then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/suppliers/${id}`),
};

// Carriers
export const carriersApi = {
  list: () =>
    api.get<ApiResponse<Carrier[]>>("/carriers")
      .then((r) => r.data.data!),
  get: (id: string) =>
    api.get<ApiResponse<Carrier>>(`/carriers/${id}`)
      .then((r) => r.data.data!),
  create: (data: CreateCarrierInput) =>
    api.post<ApiResponse<Carrier>>("/carriers", data)
      .then((r) => r.data.data!),
  update: (id: string, data: UpdateCarrierInput) =>
    api.put<ApiResponse<Carrier>>(`/carriers/${id}`, data)
      .then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/carriers/${id}`),
};

// Carriers
export const workersApi = {
  list: () =>
    api.get<ApiResponse<Worker[]>>("/workers")
      .then((r) => r.data.data!),
  get: (id: string) =>
    api.get<ApiResponse<Worker>>(`/workers/${id}`)
      .then((r) => r.data.data!),
  create: (data: CreateWorkerInput) =>
    api.post<ApiResponse<Worker>>("/workers", data)
      .then((r) => r.data.data!),
  update: (id: string, data: UpdateWorkerInput) =>
    api.put<ApiResponse<Worker>>(`/workers/${id}`, data)
      .then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/workers/${id}`),
};

// News
export const newsApi = {
  list: () =>
    api.get<ApiResponse<News[]>>("/news")
      .then((r) => r.data.data!),
  create: (data: { title: string; content: string }) =>
    api.post<ApiResponse<News>>("/news", data)
      .then((r) => r.data.data!),
  update: (id: string, data: { title?: string; content?: string }) =>
    api.put<ApiResponse<News>>(`/news/${id}`, data)
      .then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/news/${id}`),
  react: (id: string, type: "like" | "dislike") =>
    api.post<ApiResponse<{ likes: number; dislikes: number; userReaction: "like" | "dislike" | null }>>(
      `/news/${id}/reaction`,
      { type }
    ).then((r) => r.data.data!),
};

// Admin
export const adminApi = {
  dashboard: () =>
    api.get<ApiResponse<AdminDashboard>>("/admin/users")
      .then((r) => r.data.data!),
};

export default api;
