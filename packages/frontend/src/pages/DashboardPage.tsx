import { useEffect } from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import SavingsIcon from "@mui/icons-material/Savings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useStore } from "../stores/RootStore";
import SummaryCard from "../components/SummaryCard";
import ExpenseChart from "../components/charts/ExpenseChart";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

  const { currentProject: project, summary } = projectStore;

  if (projectStore.loading) {
    return <LinearProgress />;
  }

  if (!project || !summary) {
    return (
      <Container>
        <Typography>Project not found</Typography>
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
          Projects
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4">{project.name}</Typography>
          {project.description && (
            <Typography color="text.secondary">{project.description}</Typography>
          )}
        </Box>
        <Button variant="contained" onClick={() => navigate(`/projects/${id}/expenses`)}>
          <ReceiptIcon sx={{ mr: 1 }} />
          Manage Expenses
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Total Budget"
            value={summary.budget != null ? formatCurrency(summary.budget) : "Not set"}
            icon={<AccountBalanceIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Total Spent"
            value={formatCurrency(summary.totalSpent)}
            icon={<AttachMoneyIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Remaining"
            value={summary.remaining != null ? formatCurrency(summary.remaining) : "N/A"}
            icon={<SavingsIcon fontSize="large" />}
            color={summary.remaining != null && summary.remaining < 0 ? "error.main" : "success.main"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <SummaryCard
            title="Materials"
            value={formatCurrency(summary.materialTotal)}
            icon={<BuildIcon fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <SummaryCard
            title="Labor"
            value={formatCurrency(summary.laborTotal)}
            icon={<PeopleIcon fontSize="large" />}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      {summary.budget != null && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" gutterBottom>
            Budget Usage: {((summary.totalSpent / summary.budget) * 100).toFixed(1)}%
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
          <ExpenseChart
            data={summary.byCategory.filter((c) => c.type === "MATERIAL")}
            title="Material Costs by Category"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpenseChart
            data={summary.byCategory.filter((c) => c.type === "LABOR")}
            title="Labor Costs by Category"
          />
        </Grid>
      </Grid>
    </Container>
  );
});

export default DashboardPage;
