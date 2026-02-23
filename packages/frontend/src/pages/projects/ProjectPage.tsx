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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SavingsIcon from "@mui/icons-material/Savings";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EditIcon from "@mui/icons-material/Edit";
import { useStore } from "../../stores/RootStore";
import SummaryCard from "../../components/SummaryCard";
import ExpenseChart from "../../components/charts/ExpenseChart";
import AppProgress from '@/components/AppProgress';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

const ProjectPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { projectStore } = useStore();
  const navigate = useNavigate();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));

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

  if (!projectStore.loading && (!project || !summary)) {
    return (
      <Container>
        <Typography>Проект не найден</Typography>
      </Container>
    );
  }

  return (
    <>
    {projectStore.loading && <AppProgress />}
    {project && summary && <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
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

      <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", mb: 3, gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant={isMobile ? "h5" : "h4"} noWrap>{project.name}</Typography>
            {project.description && (
              <Typography color="text.secondary" noWrap>{project.description}</Typography>
            )}
          </Box>
          <Tooltip title="Редактировать проект">
            <IconButton onClick={handleEditOpen} sx={{ flexShrink: 0 }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Button variant="contained" onClick={() => navigate(`/projects/${id}/expenses`)} sx={{ flexShrink: 0 }}>
          <ReceiptIcon sx={{ mr: 1 }} />
          Управление
        </Button>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <SummaryCard
            title="Бюджет"
            value={summary.budget != null ? formatCurrency(summary.budget) : "Не задан"}
            icon={<AccountBalanceIcon />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <SummaryCard
            title="Потрачено"
            value={formatCurrency(summary.totalSpent)}
            icon={<AttachMoneyIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <SummaryCard
            title="Запланировано"
            value={formatCurrency(summary.plannedTotal)}
            icon={<PlaylistAddCheckIcon />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <SummaryCard
            title="Остаток"
            value={summary.remaining != null ? formatCurrency(summary.remaining) : "Н/Д"}
            icon={<SavingsIcon />}
            color={summary.remaining != null && summary.remaining < 0 ? "error.main" : "success.main"}
          />
        </Grid>
      </Grid>

      {isMobile ? (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Box sx={{ display: "flex" }}>
              {[
                { title: "Материалы", value: summary.materialTotal, icon: <BuildIcon sx={{ fontSize: "1rem" }} />, color: "primary.main" },
                { title: "Работы", value: summary.laborTotal, icon: <PeopleIcon sx={{ fontSize: "1rem" }} />, color: "secondary.main" },
                { title: "Доставки", value: summary.deliveryTotal, icon: <LocalShippingIcon sx={{ fontSize: "1rem" }} />, color: "success.main" },
              ].map((item, i) => (
                <Box key={item.title} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 1.5, px: 1, borderLeft: i > 0 ? 1 : 0, borderColor: "divider" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: item.color, mb: 0.5 }}>
                    {item.icon}
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography fontWeight={700} sx={{ fontSize: "0.85rem" }}>
                    {formatCurrency(item.value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ sm: 4 }}>
            <SummaryCard
              title="Материалы"
              value={formatCurrency(summary.materialTotal)}
              icon={<BuildIcon />}
              color="primary.main"
            />
          </Grid>
          <Grid size={{ sm: 4 }}>
            <SummaryCard
              title="Работы"
              value={formatCurrency(summary.laborTotal)}
              icon={<PeopleIcon />}
              color="secondary.main"
            />
          </Grid>
          <Grid size={{ sm: 4 }}>
            <SummaryCard
              title="Доставки"
              value={formatCurrency(summary.deliveryTotal)}
              icon={<LocalShippingIcon />}
              color="success.main"
            />
          </Grid>
        </Grid>
      )}

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

      {(() => {
        const TYPE_COLORS: Record<string, string> = {
          MATERIAL: "#1976d2",
          LABOR: "#546e7a",
          DELIVERY: "#16a34a",
        };

        function generateShades(hex: string, count: number): string[] {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const shades: string[] = [];
          for (let i = 0; i < count; i++) {
            const factor = 0.4 + (0.6 * i) / Math.max(count - 1, 1);
            const nr = Math.round(r + (255 - r) * (1 - factor));
            const ng = Math.round(g + (255 - g) * (1 - factor));
            const nb = Math.round(b + (255 - b) * (1 - factor));
            shades.push(`#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`);
          }
          return shades;
        }

        const typeData = [
          { categoryId: null, categoryName: "Материалы", type: "MATERIAL", total: summary.materialTotal, count: 0 },
          { categoryId: null, categoryName: "Работы", type: "LABOR", total: summary.laborTotal, count: 0 },
          { categoryId: null, categoryName: "Доставки", type: "DELIVERY", total: summary.deliveryTotal, count: 0 },
        ].filter((d) => d.total > 0);

        const materialData = summary.byCategory.filter((c) => c.type === "MATERIAL");
        const laborData = summary.byCategory.filter((c) => c.type === "LABOR");
        const deliveryData = summary.byCategory.filter((c) => c.type === "DELIVERY");

        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ExpenseChart
                data={typeData}
                colors={typeData.map((d) => TYPE_COLORS[d.type])}
                title="Расходы по типам"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ExpenseChart
                data={materialData}
                colors={generateShades(TYPE_COLORS.MATERIAL, materialData.length)}
                title="Расходы на материалы по категориям"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ExpenseChart
                data={laborData}
                colors={generateShades(TYPE_COLORS.LABOR, laborData.length)}
                title="Расходы на работы по категориям"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ExpenseChart
                data={deliveryData}
                colors={generateShades(TYPE_COLORS.DELIVERY, deliveryData.length)}
                title="Расходы на доставки по категориям"
              />
            </Grid>
          </Grid>
        );
      })()}

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
    </Container>}
    </>
  );
});

export default ProjectPage;
