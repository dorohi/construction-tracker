import { observer } from "mobx-react-lite";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import type { Expense } from "@construction-tracker/shared/dist";
import CategoryChip from "../../components/CategoryChip";
import ExpenseMobile from "@/pages/expenses/ExpenseMobile";
import Pagination from "@/pages/expenses/Pagination";
import ActionsMenu from "@/pages/expenses/ActionsMenu";
import { formatCurrency, formatDate } from "@/Utils";
import { useStore } from "../../stores/RootStore";

export function getDetails(expense: Expense) {
  if (expense.type === "MATERIAL") {
    const parts: string[] = [];
    if (expense.supplier) parts.push(`Поставщик: ${expense.supplier}`);
    if (expense.quantity != null)
      parts.push(`${expense.quantity} ${expense.unit || "шт."} @ ${formatCurrency(expense.unitPrice || 0)}`);
    return parts.join(" | ");
  }
  if (expense.type === "LABOR") {
    const parts: string[] = [];
    if (expense.worker) parts.push(`Работник: ${expense.worker}`);
    if (expense.hoursWorked != null)
      parts.push(`${expense.hoursWorked} ч @ ${formatCurrency(expense.hourlyRate || 0)}/ч`);
    return parts.join(" | ");
  }
  if (expense.type === "DELIVERY" && expense.carrier) {
    return `Перевозчик: ${expense.carrier}`;
  }
  return "";
}

const ExpenseTable = observer(() => {
  const { expenseStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (expenseStore.filteredExpenses.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">Расходы не найдены</Typography>
      </Paper>
    );
  }

  if (isMobile) {
    return <ExpenseMobile />;
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: "calc(-270px + 100vh)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "lightslategrey" }}>Дата</TableCell>
              <TableCell sx={{ backgroundColor: "lightslategrey" }}>Название</TableCell>
              <TableCell sx={{ backgroundColor: "lightslategrey" }}>Тип</TableCell>
              <TableCell sx={{ backgroundColor: "lightslategrey" }}>Категория</TableCell>
              <TableCell sx={{ backgroundColor: "lightslategrey" }}>Детали</TableCell>
              <TableCell sx={{ backgroundColor: "lightslategrey" }} align="right">Сумма</TableCell>
              <TableCell align="center" sx={{ width: 56, backgroundColor: "lightslategrey" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenseStore.paginatedExpenses.map((expense) => (
              <TableRow key={expense.id} hover sx={expense.planned ? { opacity: 0.7 } : undefined}>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {expense.planned && <HourglassEmptyIcon sx={{ fontSize: 16, verticalAlign: "text-bottom", mr: 0.5, color: "text.secondary" }} />}
                    {expense.title}
                  </Typography>
                  {expense.description && (
                    <Typography variant="caption" color="text.secondary">
                      {expense.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <CategoryChip
                    name={expense.type === "MATERIAL" ? "Материал" : expense.type === "LABOR" ? "Работа" : "Доставка"}
                    type={expense.type}
                  />
                </TableCell>
                <TableCell>
                  {expense.category ? (
                    <CategoryChip name={expense.category.name} type={expense.category.type} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">—</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {getDetails(expense)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>{formatCurrency(expense.amount)}</Typography>
                </TableCell>
                <TableCell align="center" sx={{ width: 56 }}>
                  <IconButton size="small" onClick={(e) => expenseStore.openMenu(e.currentTarget, expense)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ActionsMenu />
      <Pagination />
    </Paper>
  );
});

export default ExpenseTable;
