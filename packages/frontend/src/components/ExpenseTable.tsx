import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No expenses found</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Details</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
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
              <TableCell>
                <CategoryChip
                  name={expense.type === "MATERIAL" ? "Material" : "Labor"}
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
                  {expense.type === "MATERIAL" && expense.supplier && `Supplier: ${expense.supplier}`}
                  {expense.type === "MATERIAL" && expense.quantity != null &&
                    ` | ${expense.quantity} ${expense.unit || "units"} @ ${formatCurrency(expense.unitPrice || 0)}`}
                  {expense.type === "LABOR" && expense.workerName && `Worker: ${expense.workerName}`}
                  {expense.type === "LABOR" && expense.hoursWorked != null &&
                    ` | ${expense.hoursWorked}h @ ${formatCurrency(expense.hourlyRate || 0)}/h`}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={600}>{formatCurrency(expense.amount)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEdit(expense)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
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
  );
}
