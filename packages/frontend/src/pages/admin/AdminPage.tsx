import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PeopleIcon from "@mui/icons-material/People";
import FolderIcon from "@mui/icons-material/Folder";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { useStore } from "@/stores/RootStore";
import AppProgress from "@/components/AppProgress";

function formatCurrency(value: number) {
  return value.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const summaryCards = [
  { key: "totalUsers" as const, label: "Пользователи", icon: PeopleIcon, color: "#1976d2" },
  { key: "totalProjects" as const, label: "Проекты", icon: FolderIcon, color: "#ed6c02" },
  { key: "totalExpenses" as const, label: "Расходы", icon: ReceiptIcon, color: "#2e7d32", isCurrency: true },
  { key: "totalSuppliers" as const, label: "Поставщики", icon: StorefrontIcon, color: "#9c27b0" },
  { key: "totalCarriers" as const, label: "Доставщики", icon: LocalShippingIcon, color: "#0288d1" },
  { key: "totalWorkers" as const, label: "Работники", icon: EngineeringIcon, color: "#d32f2f" },
];

const AdminPage = observer(() => {
  const { adminStore, authStore } = useStore();
  const { dashboard, loading } = adminStore;
  const isAdmin = authStore.user?.isAdmin ?? false;

  useEffect(() => {
    if (isAdmin) {
      adminStore.loadDashboard();
    }
  }, [adminStore, isAdmin]);

  if (!isAdmin) {
    return (
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, mt: 4 }}>
        <Alert severity="error">Доступ запрещён</Alert>
      </Container>
    );
  }

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Админ-панель
        </Typography>

        {dashboard && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {summaryCards.map(({ key, label, icon: Icon, color, isCurrency }) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={key}>
                  <Card sx={{ "&:hover": { boxShadow: 4 } }}>
                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                      <Icon sx={{ fontSize: 32, color, mb: 0.5 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {isCurrency
                          ? formatCurrency(dashboard.summary[key])
                          : dashboard.summary[key]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Имя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Регистрация</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell align="center">Проекты</TableCell>
                    <TableCell align="center">Поставщики</TableCell>
                    <TableCell align="center">Доставщики</TableCell>
                    <TableCell align="center">Работники</TableCell>
                    <TableCell align="right">Расходы</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.isAdmin ? "Админ" : "Пользователь"}
                          color={user.isAdmin ? "error" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">{user.projectsCount}</TableCell>
                      <TableCell align="center">{user.suppliersCount}</TableCell>
                      <TableCell align="center">{user.carriersCount}</TableCell>
                      <TableCell align="center">{user.workersCount}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(user.totalExpenses)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {adminStore.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {adminStore.error}
          </Alert>
        )}
      </Container>
    </>
  );
});

export default AdminPage;
