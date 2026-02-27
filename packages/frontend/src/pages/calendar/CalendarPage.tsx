import { useEffect, useState, useMemo } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ViewListIcon from "@mui/icons-material/ViewList";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import CalendarGrid from "./CalendarGrid";
import DayExpensesDialog from "./DayExpensesDialog";
import {
  buildCalendarGrid,
  formatDateKey,
  formatMonthYear,
} from "./calendarUtils";

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

  useEffect(() => {
    if (id) {
      projectStore.loadProject(id);
      expenseStore.loadExpenses(id);
    }
  }, [id, projectStore, expenseStore]);

  const { currentProject: project } = projectStore;
  const isLoading = projectStore.loading || expenseStore.loading;

  const expensesByDate = useMemo(() => {
    const map = new Map<string, import("@construction-tracker/shared/dist").Expense[]>();
    for (const expense of expenseStore.expenses) {
      const dateKey = formatDateKey(new Date(expense.date));
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(expense);
    }
    return map;
  }, [expenseStore.expenses]);

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
    for (const expense of expenseStore.expenses) {
      const d = new Date(expense.date);
      if (d.getFullYear() === y && d.getMonth() === m) {
        if (expense.type === "MATERIAL") material += expense.amount;
        else if (expense.type === "LABOR") labor += expense.amount;
        else if (expense.type === "DELIVERY") delivery += expense.amount;
      }
    }
    return { material, labor, delivery, total: material + labor + delivery };
  }, [expenseStore.expenses, currentMonth]);

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
                variant={isMobile ? "h6" : "h5"}
                sx={{
                  minWidth: isMobile ? 150 : 220,
                  textAlign: "center",
                  textTransform: "capitalize",
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
            {isMobile ? (
              <Tooltip title="Расходы">
                <IconButton onClick={() => navigate(`/projects/${id}/expenses`)}>
                  <ViewListIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                startIcon={<ViewListIcon />}
                onClick={() => navigate(`/projects/${id}/expenses`)}
              >
                Расходы
              </Button>
            )}
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
        </Container>
      )}
    </>
  );
});

export default CalendarPage;
