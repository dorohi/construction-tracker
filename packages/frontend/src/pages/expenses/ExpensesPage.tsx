import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import ListAltIcon from "@mui/icons-material/ListAlt";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { useStore } from "../../stores/RootStore";
import ExpenseTable from "./ExpenseTable";
import ExpenseForm from "./ExpenseForm";
import type { Expense, ExpenseType } from "@construction-tracker/shared/dist";
import AppProgress from '@/components/AppProgress';

const ExpensesPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { projectStore, expenseStore, supplierStore, carrierStore, workersStore } = useStore();
  const navigate = useNavigate();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));
  const [tab, setTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<ExpenseType>("MATERIAL");
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [purchasingExpense, setPurchasingExpense] = useState<Expense | null>(null);
  const [duplicatingExpense, setDuplicatingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

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

  const typeFilter = tab === 1 ? "MATERIAL" : tab === 2 ? "LABOR" : tab === 3 ? "DELIVERY" : undefined;
  const plannedFilter = tab === 4;
  const filteredExpenses = plannedFilter
    ? expenseStore.plannedExpenses
    : typeFilter
      ? expenseStore.expenses.filter((e) => e.type === typeFilter)
      : expenseStore.expenses;

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (editingExpense) {
      await expenseStore.updateExpense(editingExpense.id, data);
    } else {
      await expenseStore.createExpense(id!, data as unknown as Parameters<typeof expenseStore.createExpense>[1]);
    }
    // Reload summary
    projectStore.loadProject(id!);
    setEditingExpense(null);
    setDuplicatingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDuplicatingExpense(null);
    setFormOpen(true);
  };

  const handleDuplicate = (expense: Expense) => {
    setEditingExpense(null);
    setDuplicatingExpense(expense);
    setFormOpen(true);
  };

  const handlePurchase = (expense: Expense) => {
    setPurchasingExpense(expense);
  };

  const confirmPurchase = async () => {
    if (purchasingExpense) {
      await expenseStore.updateExpense(purchasingExpense.id, { planned: false, date: new Date().toISOString() });
      projectStore.loadProject(id!);
      setPurchasingExpense(null);
    }
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const confirmDelete = async () => {
    if (deletingExpense) {
      await expenseStore.deleteExpense(deletingExpense.id);
      projectStore.loadProject(id!);
      setDeletingExpense(null);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName && id) {
      await projectStore.createCategory(id, newCategoryName, newCategoryType);
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = async () => {
    if (deletingCategoryId && id) {
      await projectStore.deleteCategory(id, deletingCategoryId);
      setDeletingCategoryId(null);
      expenseStore.loadExpenses(id);
      projectStore.loadProject(id);
    }
  };

  return (
    <>
    {isLoading && <AppProgress />}
    {project && <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/projects")}
        >
          Проекты
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/projects/${id}`)}
        >
          {project.name}
        </Link>
        <Typography color="text.primary">Расходы</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 1 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>Расходы</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {isMobile ? (
            <>
              <Tooltip title="Категории">
                <IconButton onClick={() => setCategoryDialogOpen(true)}>
                  <CategoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Добавить">
                <IconButton
                  color="primary"
                  onClick={() => {
                    setEditingExpense(null);
                    setDuplicatingExpense(null);
                    setFormOpen(true);
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => setCategoryDialogOpen(true)}
              >
                Категории
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingExpense(null);
                  setFormOpen(true);
                }}
              >
                Добавить
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab icon={<ListAltIcon />} iconPosition="start" label={isMobile ? undefined : `Все (${expenseStore.expenses.length})`} sx={isMobile ? { minWidth: 'auto', px: 1 } : undefined} />
          <Tab icon={<BuildIcon />} iconPosition="start" label={isMobile ? undefined : `Материалы (${expenseStore.materialExpenses.length})`} sx={isMobile ? { minWidth: 'auto', px: 1 } : undefined} />
          <Tab icon={<PeopleIcon />} iconPosition="start" label={isMobile ? undefined : `Работы (${expenseStore.laborExpenses.length})`} sx={isMobile ? { minWidth: 'auto', px: 1 } : undefined} />
          <Tab icon={<LocalShippingIcon />} iconPosition="start" label={isMobile ? undefined : `Доставки (${expenseStore.deliveryExpenses.length})`} sx={isMobile ? { minWidth: 'auto', px: 1 } : undefined} />
          <Tab icon={<PlaylistAddCheckIcon />} iconPosition="start" label={isMobile ? undefined : `Запланированные (${expenseStore.plannedExpenses.length})`} sx={isMobile ? { minWidth: 'auto', px: 1 } : undefined} />
        </Tabs>
      </Box>

      <ExpenseTable
        expenses={filteredExpenses}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onPurchase={handlePurchase}
        hideType={!!typeFilter && !plannedFilter}
      />

      <ExpenseForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingExpense(null);
          setDuplicatingExpense(null);
        }}
        onSubmit={handleSubmit}
        expense={editingExpense}
        initialData={duplicatingExpense}
        categories={projectStore.categories}
        suppliers={supplierStore.suppliers}
        carriers={carrierStore.carriers}
        workers={workersStore.workers}
      />

      {/* Category Management Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Управление категориями</DialogTitle>
        <DialogContent>
          {(
            [
              { type: "MATERIAL" as const, label: "Материалы", color: "primary" as const },
              { type: "LABOR" as const, label: "Работы", color: "secondary" as const },
              { type: "DELIVERY" as const, label: "Доставки", color: "success" as const },
            ] as const
          ).map(({ type, label, color }) => {
            const cats = projectStore.categories.filter((c) => c.type === type);
            if (!cats.length) return null;
            return (
              <Box key={type} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {label}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {cats.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      color={color}
                      size="small"
                      onDelete={() => setDeletingCategoryId(cat.id)}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Добавить
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <TextField
              label="Название категории"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Тип"
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value as ExpenseType)}
              select
              size="small"
              sx={{ width: 150 }}
            >
              <MenuItem value="MATERIAL">Материал</MenuItem>
              <MenuItem value="LABOR">Работа</MenuItem>
              <MenuItem value="DELIVERY">Доставка</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCategoryDialogOpen(false)} variant="contained">Закрыть</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            disabled={!newCategoryName}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Expense Confirmation */}
      <Dialog
        open={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        maxWidth="xs"
      >
        <DialogTitle>Удалить расход?</DialogTitle>
        <DialogContent>
          <Typography>
            Расход «{deletingExpense?.title}» будет удалён без возможности восстановления.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingExpense(null)} variant="contained">Отмена</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Confirmation */}
      <Dialog
        open={!!purchasingExpense}
        onClose={() => setPurchasingExpense(null)}
        maxWidth="xs"
      >
        <DialogTitle>Отметить как купленный?</DialogTitle>
        <DialogContent>
          <Typography>
            Расход «{purchasingExpense?.title}» будет переведён из запланированных в фактические.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchasingExpense(null)} variant="contained">Отмена</Button>
          <Button onClick={confirmPurchase} variant="contained" color="success">
            Купить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog
        open={!!deletingCategoryId}
        onClose={() => setDeletingCategoryId(null)}
        maxWidth="xs"
      >
        <DialogTitle>Удалить категорию?</DialogTitle>
        <DialogContent>
          <Typography>
            Категория будет удалена. Расходы, привязанные к ней, останутся без категории.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCategoryId(null)} variant="contained">Отмена</Button>
          <Button onClick={handleDeleteCategory} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>}
    </>
  );
});

export default ExpensesPage;
