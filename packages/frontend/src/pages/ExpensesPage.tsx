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
  LinearProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import { useStore } from "../stores/RootStore";
import ExpenseTable from "../components/ExpenseTable";
import ExpenseForm from "../components/ExpenseForm";
import type { Expense, ExpenseType } from "@construction-tracker/shared";

const ExpensesPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { projectStore, expenseStore } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<ExpenseType>("MATERIAL");

  useEffect(() => {
    if (id) {
      projectStore.loadProject(id);
      expenseStore.loadExpenses(id);
    }
  }, [id, projectStore, expenseStore]);

  const { currentProject: project } = projectStore;

  if (projectStore.loading || expenseStore.loading) {
    return <LinearProgress />;
  }

  if (!project) {
    return (
      <Container>
        <Typography>Проект не найден</Typography>
      </Container>
    );
  }

  const typeFilter = tab === 1 ? "MATERIAL" : tab === 2 ? "LABOR" : undefined;
  const filteredExpenses = typeFilter
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
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (confirm(`Удалить расход "${expense.title}"?`)) {
      await expenseStore.deleteExpense(expense.id);
      projectStore.loadProject(id!);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName && id) {
      await projectStore.createCategory(id, newCategoryName, newCategoryType);
      setNewCategoryName("");
      setCategoryDialogOpen(false);
    }
  };

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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Расходы</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
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
            Добавить расход
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Все (${expenseStore.expenses.length})`} />
          <Tab label={`Материалы (${expenseStore.materialExpenses.length})`} />
          <Tab label={`Работы (${expenseStore.laborExpenses.length})`} />
        </Tabs>
      </Box>

      <ExpenseTable
        expenses={filteredExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ExpenseForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSubmit}
        expense={editingExpense}
        categories={projectStore.categories}
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Существующие категории
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {projectStore.categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  color={cat.type === "MATERIAL" ? "primary" : "secondary"}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Добавить категорию
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
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Закрыть</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            disabled={!newCategoryName}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
});

export default ExpensesPage;
