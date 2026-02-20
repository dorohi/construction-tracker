import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SavingsIcon from "@mui/icons-material/Savings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EditIcon from "@mui/icons-material/Edit";
import { useStore } from "../stores/RootStore";
import SummaryCard from "../components/SummaryCard";
import ExpenseChart from "../components/charts/ExpenseChart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

const DashboardPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { projectStore } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      projectStore.loadProject(id);
    }
  }, [id, projectStore]);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBudget, setEditBudget] = useState("");

  const { currentProject: project, summary } = projectStore;

  if (projectStore.loading) {
    return <LinearProgress />;
  }

  const handleEditOpen = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditBudget(project.budget != null ? String(project.budget) : "");
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditSave = async () => {
    if (!project) return;
    await projectStore.updateProject(project.id, {
      name: editName,
      description: editDescription || undefined,
      budget: editBudget ? parseFloat(editBudget) : undefined,
    });
    setEditOpen(false);
  };

  if (!project || !summary) {
    return (
      <Container>
        <Typography>Проект не найден</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/projects")}
        >
          Проекты
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box>
            <Typography variant="h4">{project.name}</Typography>
            {project.description && (
              <Typography color="text.secondary">{project.description}</Typography>
            )}
          </Box>
          <Tooltip title="Редактировать проект">
            <IconButton onClick={handleEditOpen}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Button variant="contained" onClick={() => navigate(`/projects/${id}/expenses`)}>
          <ReceiptIcon sx={{ mr: 1 }} />
          Управление
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Общий бюджет"
            value={summary.budget != null ? formatCurrency(summary.budget) : "Не задан"}
            icon={<AccountBalanceIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Потрачено"
            value={formatCurrency(summary.totalSpent)}
            icon={<AttachMoneyIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Остаток"
            value={summary.remaining != null ? formatCurrency(summary.remaining) : "Н/Д"}
            icon={<SavingsIcon fontSize="large" />}
            color={summary.remaining != null && summary.remaining < 0 ? "error.main" : "success.main"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Материалы"
            value={formatCurrency(summary.materialTotal)}
            icon={<BuildIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Работы"
            value={formatCurrency(summary.laborTotal)}
            icon={<PeopleIcon fontSize="large" />}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Доставки"
            value={formatCurrency(summary.deliveryTotal)}
            icon={<LocalShippingIcon fontSize="large" />}
            color="success.main"
          />
        </Grid>
      </Grid>

      {summary.budget != null && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" gutterBottom>
            Использование бюджета: {((summary.totalSpent / summary.budget) * 100).toFixed(1)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((summary.totalSpent / summary.budget) * 100, 100)}
            color={
              summary.totalSpent / summary.budget > 0.9
                ? "error"
                : summary.totalSpent / summary.budget > 0.7
                  ? "warning"
                  : "primary"
            }
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          {(() => {
            const TYPE_COLOR_MAP: Record<string, string> = {
              MATERIAL: "#1976d2",
              LABOR: "#546e7a",
              DELIVERY: "#16a34a",
            };
            const typeData = [
              { categoryId: null, categoryName: "Материалы", type: "MATERIAL", total: summary.materialTotal, count: 0 },
              { categoryId: null, categoryName: "Работы", type: "LABOR", total: summary.laborTotal, count: 0 },
              { categoryId: null, categoryName: "Доставки", type: "DELIVERY", total: summary.deliveryTotal, count: 0 },
            ].filter((d) => d.total > 0);
            return (
              <ExpenseChart
                data={typeData}
                colors={typeData.map((d) => TYPE_COLOR_MAP[d.type])}
                title="Расходы по типам"
              />
            );
          })()}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpenseChart
            data={summary.byCategory.filter((c) => c.type === "MATERIAL")}
            title="Расходы на материалы по категориям"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpenseChart
            data={summary.byCategory.filter((c) => c.type === "LABOR")}
            title="Расходы на работы по категориям"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpenseChart
            data={summary.byCategory.filter((c) => c.type === "DELIVERY")}
            title="Расходы на доставки по категориям"
          />
        </Grid>
      </Grid>

      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать проект</DialogTitle>
        <DialogContent>
          <TextField
            label="Название проекта"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Описание"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
          <TextField
            label="Бюджет"
            type="number"
            value={editBudget}
            onChange={(e) => setEditBudget(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} variant="contained">Отмена</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={!editName}>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default DashboardPage;
