import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  FolderOpen,
  AttachMoney,
  Receipt,
  LocalShipping,
  DirectionsBus,
  Engineering,
} from "@mui/icons-material";
import { useStore } from "../stores/RootStore";
import { profileApi } from "../services/api";
import type { UserStats } from "@construction-tracker/shared";

const statCards = [
  { key: "projectsCount" as const, label: "Проекты", icon: FolderOpen, color: "#1976d2" },
  { key: "totalExpenses" as const, label: "Затраты", icon: AttachMoney, color: "#2e7d32", isCurrency: true },
  { key: "expensesCount" as const, label: "Операции", icon: Receipt, color: "#0288d1" },
  { key: "suppliersCount" as const, label: "Поставщики", icon: LocalShipping, color: "#ed6c02" },
  { key: "carriersCount" as const, label: "Перевозчики", icon: DirectionsBus, color: "#9c27b0" },
  { key: "workersCount" as const, label: "Работники", icon: Engineering, color: "#d32f2f" },
];

const SettingsPage = observer(() => {
  const { authStore, themeStore } = useStore();
  const user = authStore.user;
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatValue = (value: number, isCurrency?: boolean) =>
    isCurrency ? value.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }) : value;

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Настройки
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={32} />
        </Box>
      ) : stats && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 1.5,
            mb: 3,
          }}
        >
          {statCards.map(({ key, label, icon: Icon, color, isCurrency }) => (
            <Paper
              key={key}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Icon sx={{ color, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatValue(stats[key], isCurrency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Paper sx={{ mb: 3 }}>
        <List disablePadding>
          <ListItem>
            <ListItemText primary="Имя" secondary={user?.name ?? "—"} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText primary="Email" secondary={user?.email ?? "—"} />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Роль"
              secondary={user?.isAdmin ? "Администратор" : "Пользователь"}
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemText
              primary="Дата регистрации"
              secondary={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                  : "—"
              }
            />
          </ListItem>
        </List>
      </Paper>

      <Paper>
        <List disablePadding>
          <ListItem>
            <ListItemText
              primary="Тёмная тема"
              secondary={
                themeStore.mode === "dark" ? "Включена" : "Выключена"
              }
            />
            <Switch
              edge="end"
              checked={themeStore.mode === "dark"}
              onChange={() => themeStore.toggleTheme()}
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
});

export default SettingsPage;
