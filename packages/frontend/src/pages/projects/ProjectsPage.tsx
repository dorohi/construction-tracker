import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  LinearProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import useSearch from "@/hooks/useSearch";
import ProjectForm from "./ProjectForm";
import DeleteProjectDialog from "./DeleteProjectDialog";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const ProjectsPage = observer(() => {
  const { projectStore } = useStore();
  const navigate = useNavigate();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));
  const { search, searchField } = useSearch({ placeholder: "Поиск по названию или описанию..." });

  useEffect(() => {
    projectStore.loadProjects();
  }, [projectStore]);

  const filteredProjects = search
    ? projectStore.projects.filter((p) => {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      })
    : projectStore.projects;

  return (
    <>
      {projectStore.loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant={isMobile ? "h5" : "h4"}>Мои проекты</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={projectStore.openCreateForm}>
            Новый
          </Button>
        </Box>

        {projectStore.projects.length > 3 && searchField}
        <Grid container spacing={3}>
          {filteredProjects.map((project) => {
            const spentPercent = project.budget
              ? Math.min((project.totalSpent / project.budget) * 100, 100)
              : 0;

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                <Card
                  sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 }, height: "100%", display: "flex", flexDirection: "column" }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" noWrap>{project.name}</Typography>
                      <Box>
                        <Tooltip title="Редактировать проект">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); projectStore.openEditForm(project); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить проект">
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); projectStore.setDeletingProjectId(project.id); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {project.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>{project.description}</Typography>
                    )}
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AttachMoneyIcon sx={{ fontSize: 18, width: 24, color: "warning.main" }} />
                        <Typography variant="body2">
                          Потрачено: <strong>{formatCurrency(project.totalSpent)}</strong>
                        </Typography>
                      </Box>
                      {project.plannedTotal > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PlaylistAddCheckIcon sx={{ fontSize: 18, width: 24, color: "info.main" }} />
                          <Typography variant="body2">
                            Запланировано: <strong>{formatCurrency(project.plannedTotal)}</strong>
                          </Typography>
                        </Box>
                      )}
                      {project.budget != null && (
                        <>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AccountBalanceIcon sx={{ fontSize: 18, width: 24, color: "info.main" }} />
                            <Typography variant="body2">Бюджет: {formatCurrency(project.budget)}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={spentPercent}
                            color={spentPercent > 90 ? "error" : spentPercent > 70 ? "warning" : "primary"}
                            sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                          />
                        </>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2, rowGap: 0.5, mt: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <BuildIcon sx={{ fontSize: 14, color: "primary.main" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Материалы: {formatCurrency(project.materialTotal)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 14, color: "secondary.main" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Работы: {formatCurrency(project.laborTotal)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalShippingIcon sx={{ fontSize: 14, color: "success.main" }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Доставки: {formatCurrency(project.deliveryTotal)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                    <Button size="small" variant="outlined">Подробнее</Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}

          {!projectStore.loading && projectStore.projects.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">Проектов пока нет</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Создайте первый проект для учёта расходов
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={projectStore.openCreateForm}>
                  Создать проект
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        <ProjectForm />
        <DeleteProjectDialog />
      </Container>
    </>
  );
});

export default ProjectsPage;
