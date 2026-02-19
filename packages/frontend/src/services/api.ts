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
    api.post<ApiResponse<AuthResponse>>("/auth/login", data).then((r) => r.data.data!),
  register: (data: RegisterInput) =>
    api.post<ApiResponse<AuthResponse>>("/auth/register", data).then((r) => r.data.data!),
};

// Projects
export const projectsApi = {
  list: () =>
    api.get<ApiResponse<ProjectWithTotals[]>>("/projects").then((r) => r.data.data!),
  get: (id: string) =>
    api.get<ApiResponse<Project & { categories: Category[] }>>(`/projects/${id}`).then((r) => r.data.data!),
  create: (data: CreateProjectInput) =>
    api.post<ApiResponse<Project>>("/projects", data).then((r) => r.data.data!),
  update: (id: string, data: UpdateProjectInput) =>
    api.put<ApiResponse<Project>>(`/projects/${id}`, data).then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/projects/${id}`),
  summary: (id: string) =>
    api.get<ApiResponse<ProjectSummary>>(`/projects/${id}/summary`).then((r) => r.data.data!),
};

// Expenses
export const expensesApi = {
  list: (projectId: string, type?: string) => {
    const params = type ? `?type=${type}` : "";
    return api
      .get<ApiResponse<Expense[]>>(`/projects/${projectId}/expenses${params}`)
      .then((r) => r.data.data!);
  },
  create: (projectId: string, data: CreateExpenseInput) =>
    api
      .post<ApiResponse<Expense>>(`/projects/${projectId}/expenses`, data)
      .then((r) => r.data.data!),
  update: (id: string, data: UpdateExpenseInput) =>
    api.put<ApiResponse<Expense>>(`/expenses/${id}`, data).then((r) => r.data.data!),
  delete: (id: string) =>
    api.delete(`/expenses/${id}`),
};

// Categories
export const categoriesApi = {
  list: (projectId: string) =>
    api.get<ApiResponse<Category[]>>(`/projects/${projectId}/categories`).then((r) => r.data.data!),
  create: (projectId: string, data: CreateCategoryInput) =>
    api
      .post<ApiResponse<Category>>(`/projects/${projectId}/categories`, data)
      .then((r) => r.data.data!),
};

export default api;
