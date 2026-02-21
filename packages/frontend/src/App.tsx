import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores/RootStore";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import DashboardPage from "./pages/DashboardPage";
import ExpensesPage from "./pages/ExpensesPage";
import SettingsPage from "./pages/SettingsPage";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authStore } = useStore();
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const ObserverAuthGuard = observer(AuthGuard);

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { authStore } = useStore();
  if (authStore.isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }
  return <>{children}</>;
}

const ObserverGuestOnly = observer(GuestOnly);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <ObserverGuestOnly>
              <LoginPage />
            </ObserverGuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <ObserverGuestOnly>
              <RegisterPage />
            </ObserverGuestOnly>
          }
        />
        <Route
          element={
            <ObserverAuthGuard>
              <Layout />
            </ObserverAuthGuard>
          }
        >
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<DashboardPage />} />
          <Route path="/projects/:id/expenses" element={<ExpensesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
