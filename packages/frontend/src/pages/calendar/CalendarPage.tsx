import { useEffect, useState, useMemo, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  IconButton,
  Button,
  Tooltip,
  Popover,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TableViewIcon from "@mui/icons-material/TableView";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import type { Expense } from "@construction-tracker/shared";
import { useStore } from "../../stores/RootStore";
import { expensesApi } from "@/services/api";
import AppProgress from "@/components/AppProgress";
import CalendarGrid from "./CalendarGrid";
import DayExpensesDialog from "./DayExpensesDialog";
import {
  buildCalendarGrid,
  formatDateKey,
  formatMonthYear,
} from "./calendarUtils";
import AddIcon from '@mui/icons-material/Add';
import ExpenseForm from '@/pages/expenses/ExpenseForm';

const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

const CalendarPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const { projectStore, expenseStore } = useStore();
  const navigate = useNavigate();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarExpenses, setCalendarExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  useEffect(() => {
    if (id) projectStore.loadProject(id);
  }, [id, projectStore]);

  useEffect(() => {
    if (!id) return;
    const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
    const dateFrom = from.toISOString().split("T")[0];
    const dateTo = to.toISOString().split("T")[0];
    setLoadingExpenses(true);
    expensesApi.list(id, { dateFrom, dateTo, all: true }).then((data) => {
      setCalendarExpenses(data.expenses);
      setLoadingExpenses(false);
    }).catch(() => setLoadingExpenses(false));
  }, [id, currentMonth]);

  const { currentProject: project } = projectStore;
  const isLoading = projectStore.loading || loadingExpenses;

  const expensesByDate = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const expense of calendarExpenses) {
      const dateKey = formatDateKey(new Date(expense.date));
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(expense);
    }
    return map;
  }, [calendarExpenses]);

  const calendarDays = useMemo(
    () => buildCalendarGrid(currentMonth),
    [currentMonth],
  );

  // Monthly totals for current view
  const monthTotals = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    let material = 0;
    let labor = 0;
    let delivery = 0;
    for (const expense of calendarExpenses) {
      const d = new Date(expense.date);
      if (d.getFullYear() === y && d.getMonth() === m) {
        if (expense.type === "MATERIAL") material += expense.amount;
        else if (expense.type === "LABOR") labor += expense.amount;
        else if (expense.type === "DELIVERY") delivery += expense.amount;
      }
    }
    return { material, labor, delivery, total: material + labor + delivery };
  }, [calendarExpenses, currentMonth]);

  const prevMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const pickerOpen = Boolean(pickerAnchor);

  const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());

  const handleOpenPicker = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setPickerYear(currentMonth.getFullYear());
    setPickerAnchor(e.currentTarget);
  }, [currentMonth]);

  const handlePickMonth = useCallback((month: number) => {
    setCurrentMonth(new Date(pickerYear, month, 1));
    setPickerAnchor(null);
  }, [pickerYear]);

  if (!isLoading && !project) {
    return (
      <Container>
        <Typography>Проект не найден</Typography>
      </Container>
    );
  }

  const selectedExpenses = selectedDate
    ? expensesByDate.get(selectedDate) || []
    : [];

  return (
    <>
      {isLoading && <AppProgress />}
      {project && (
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          {/* Breadcrumbs */}
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
            <Typography color="text.primary">Календарь</Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton onClick={prevMonth} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant={isMobile ? "body1" : "h5"}
                onClick={handleOpenPicker}
                sx={{
                  minWidth: isMobile ? 100 : 220,
                  textAlign: "center",
                  textTransform: "capitalize",
                  cursor: "pointer",
                  borderRadius: 1,
                  px: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {formatMonthYear(currentMonth)}
              </Typography>
              <IconButton onClick={nextMonth} size="small">
                <ChevronRightIcon />
              </IconButton>
              <Button size="small" variant="outlined" onClick={goToday}>
                Сегодня
              </Button>
            </Box>

            <Popover
              open={pickerOpen}
              anchorEl={pickerAnchor}
              onClose={() => setPickerAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Box sx={{ p: 2, width: 280 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <IconButton size="small" onClick={() => setPickerYear((y) => y - 1)}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {pickerYear}
                  </Typography>
                  <IconButton size="small" onClick={() => setPickerYear((y) => y + 1)}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.5 }}>
                  {MONTHS_SHORT.map((name, i) => {
                    const isActive = pickerYear === currentMonth.getFullYear() && i === currentMonth.getMonth();
                    return (
                      <Button
                        key={i}
                        size="small"
                        variant={isActive ? "contained" : "text"}
                        onClick={() => handlePickMonth(i)}
                        sx={{ textTransform: "capitalize", minWidth: 0 }}
                      >
                        {name}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Popover>
            <Box sx={{ display: "flex", gap: 1 }}>
              {isMobile ? (
                <>
                  <Tooltip title="Расходы">
                    <IconButton onClick={() => navigate(`/projects/${id}/expenses`)}>
                      <TableViewIcon />
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
                  <Button
                    variant="outlined"
                    startIcon={<TableViewIcon />}
                    onClick={() => navigate(`/projects/${id}/expenses`)}
                  >
                    Расходы
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={expenseStore.openAddForm}>
                    Добавить
                  </Button>
                </>
            )}
            </Box>
          </Box>

          {/* Calendar */}
          <CalendarGrid
            days={calendarDays}
            expensesByDate={expensesByDate}
            onDayClick={(dateKey) => setSelectedDate(dateKey)}
          />

          {/* Month summary */}
          {monthTotals.total > 0 && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: isMobile ? 1 : 3,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                Итого: {formatCurrency(monthTotals.total)}
              </Typography>
              {monthTotals.material > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <BuildIcon sx={{ fontSize: "1rem", color: "primary.main" }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(monthTotals.material)}
                  </Typography>
                </Box>
              )}
              {monthTotals.labor > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PeopleIcon
                    sx={{ fontSize: "1rem", color: "secondary.main" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(monthTotals.labor)}
                  </Typography>
                </Box>
              )}
              {monthTotals.delivery > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocalShippingIcon
                    sx={{ fontSize: "1rem", color: "success.main" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(monthTotals.delivery)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Day detail dialog */}
          <DayExpensesDialog
            open={selectedDate !== null}
            onClose={() => setSelectedDate(null)}
            dateKey={selectedDate}
            expenses={selectedExpenses}
          />
          <ExpenseForm />
        </Container>
      )}
    </>
  );
});

export default CalendarPage;
