import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Expense } from "@construction-tracker/shared";
import CategoryChip from "./CategoryChip";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  hideType?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ExpenseTable({ expenses, onEdit, onDelete, hideType }: ExpenseTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  if (expenses.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">Расходы не найдены</Typography>
      </Paper>
    );
  }

  const paginatedExpenses = expenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 250px)" }}>
      <TableContainer sx={{ flex: 1, overflow: "auto" }}>
        <Table stickyHeader size="small">
          <TableHead
            sx={{
              "& .MuiTableCell-head": {
                bgcolor: "background.default",
                fontWeight: 600,
                "&:first-of-type": { borderRadius: "8px 0 0 0" },
                "&:last-of-type": { borderRadius: "0 8px 0 0" },
              },
            }}
          >
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Название</TableCell>
              {!hideType && <TableCell>Тип</TableCell>}
              <TableCell>Категория</TableCell>
              <TableCell>Детали</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.map((expense) => (
              <TableRow key={expense.id} hover>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {expense.title}
                  </Typography>
                  {expense.description && (
                    <Typography variant="caption" color="text.secondary">
                      {expense.description}
                    </Typography>
                  )}
                </TableCell>
                {!hideType && (
                  <TableCell>
                    <CategoryChip
                      name={expense.type === "MATERIAL" ? "Материал" : expense.type === "LABOR" ? "Работа" : "Доставка"}
                      type={expense.type}
                    />
                  </TableCell>
                )}
                <TableCell>
                  {expense.category ? (
                    <CategoryChip name={expense.category.name} type={expense.category.type} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">—</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {expense.type === "MATERIAL" && expense.supplier && `Поставщик: ${expense.supplier}`}
                    {expense.type === "MATERIAL" && expense.quantity != null &&
                      ` | ${expense.quantity} ${expense.unit || "шт."} @ ${formatCurrency(expense.unitPrice || 0)}`}
                    {expense.type === "LABOR" && expense.workerName && `Работник: ${expense.workerName}`}
                    {expense.type === "LABOR" && expense.hoursWorked != null &&
                      ` | ${expense.hoursWorked} ч @ ${formatCurrency(expense.hourlyRate || 0)}/ч`}
                    {expense.type === "DELIVERY" && expense.carrier && `Перевозчик: ${expense.carrier}`}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>{formatCurrency(expense.amount)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => onEdit(expense)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => onDelete(expense)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={expenses.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
      />
    </Paper>
  );
}
