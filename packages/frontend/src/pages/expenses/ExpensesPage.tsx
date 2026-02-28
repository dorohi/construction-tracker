import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Badge,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useStore } from "../../stores/RootStore";
import ExpenseTable from "./ExpenseTable";
import ExpenseForm from "./ExpenseForm";
import ExpenseFilters from "./ExpenseFilters";
import CategoryDialog from "./CategoryDialog";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import PurchaseDialog from "./PurchaseDialog";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import AppProgress from "@/components/AppProgress";

const ExpensesPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { projectStore, expenseStore, supplierStore, carrierStore, workersStore } = useStore();
  const navigate = useNavigate();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));

  useEffect(() => {
    if (id) {
      projectStore.loadProject(id);
      expenseStore.loadExpenses(id);
    }
    supplierStore.loadSuppliers();
    carrierStore.loadCarriers();
    workersStore.loadWorkers();
  }, [id, projectStore, expenseStore, supplierStore, carrierStore, workersStore]);

  const { currentProject: project } = projectStore;
  const isLoading = projectStore.loading || expenseStore.loading;

  if (!isLoading && !project) {
    return (
      <Container>
        <Typography>Проект не найден</Typography>
      </Container>
    );
  }

  return (
    <>
      {isLoading && <AppProgress />}
      {project && (
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }} onClick={() => navigate("/projects")}>
              Проекты
            </Link>
            <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }} onClick={() => navigate(`/projects/${id}`)}>
              {project.name}
            </Link>
            <Typography color="text.primary">Расходы</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography variant={isMobile ? "h5" : "h4"}>Расходы</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {isMobile ? (
                <>
                  <Tooltip title="Календарь">
                    <IconButton onClick={() => navigate(`/projects/${id}/calendar`)}>
                      <CalendarMonthIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Фильтры">
                    <IconButton onClick={expenseStore.openFilters}>
                      <Badge badgeContent={expenseStore.activeFilterCount} color="primary">
                        <FilterListIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Категории">
                    <IconButton onClick={expenseStore.openCategoryDialog}>
                      <CategoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Добавить">
                    <IconButton color="primary" onClick={expenseStore.openAddForm}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => navigate(`/projects/${id}/calendar`)}>
                    Календарь
                  </Button>
                  <Badge badgeContent={expenseStore.activeFilterCount} color="primary">
                    <Button variant="outlined" startIcon={<FilterListIcon />} onClick={expenseStore.openFilters}>
                      Фильтры
                    </Button>
                  </Badge>
                  <Button variant="outlined" startIcon={<CategoryIcon />} onClick={expenseStore.openCategoryDialog}>
                    Категории
                  </Button>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={expenseStore.openAddForm}>
                    Добавить
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <ExpenseFilters />
          <ExpenseTable />
          <ExpenseForm />
          <CategoryDialog />
          <DeleteExpenseDialog />
          <PurchaseDialog />
          <DeleteCategoryDialog />
        </Container>
      )}
    </>
  );
});

export default ExpensesPage;
