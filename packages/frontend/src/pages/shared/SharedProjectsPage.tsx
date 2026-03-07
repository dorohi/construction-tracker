import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

const SharedProjectsPage = observer(() => {
  const { sharedStore } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    sharedStore.loadProjects();
  }, [sharedStore]);

  return (
    <>
      {sharedStore.loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <PublicIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant={isMobile ? "h5" : "h4"}>
            Публичные проекты
          </Typography>
        </Box>

        {!sharedStore.loading && sharedStore.projects.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: "center", mt: 6 }}>
            Нет публичных проектов
          </Typography>
        )}

        <Grid container spacing={2}>
          {sharedStore.projects.map((project) => {
            const budgetPercent =
              project.budget != null && project.budget > 0
                ? Math.round((project.totalSpent / project.budget) * 100)
                : null;

            return (
              <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea
                    onClick={() => navigate(`/shared/${project.shareToken}`)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent>
                      <Typography variant="h6" noWrap gutterBottom>
                        {project.name}
                      </Typography>

                      {project.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ mb: 1.5 }}
                        >
                          {project.description}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
                        <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.ownerName}
                        </Typography>
                      </Box>

                      {project.budget != null && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Бюджет: {formatCurrency(project.budget)}
                          </Typography>
                          {budgetPercent != null && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                              <Box
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: "action.hover",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${Math.min(budgetPercent, 100)}%`,
                                    height: "100%",
                                    borderRadius: 3,
                                    bgcolor:
                                      budgetPercent > 90
                                        ? "error.main"
                                        : budgetPercent > 70
                                          ? "warning.main"
                                          : "primary.main",
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {budgetPercent}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {formatCurrency(project.totalSpent)}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {project.materialTotal > 0 && (
                          <Chip
                            size="small"
                            icon={<BuildIcon />}
                            label={formatCurrency(project.materialTotal)}
                            variant="outlined"
                            color="primary"
                          />
                        )}
                        {project.laborTotal > 0 && (
                          <Chip
                            size="small"
                            icon={<PeopleIcon />}
                            label={formatCurrency(project.laborTotal)}
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                        {project.deliveryTotal > 0 && (
                          <Chip
                            size="small"
                            icon={<LocalShippingIcon />}
                            label={formatCurrency(project.deliveryTotal)}
                            variant="outlined"
                            color="success"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
});

export default SharedProjectsPage;
