import { useState, MouseEvent } from "react";
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
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import type { Expense } from "@construction-tracker/shared/dist";
import CategoryChip from "../../components/CategoryChip";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDuplicate: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onPurchase?: (expense: Expense) => void;
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

function getDetails(expense: Expense) {
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

export default function ExpenseTable({ expenses, onEdit, onDuplicate, onDelete, onPurchase, hideType }: ExpenseTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuExpense, setMenuExpense] = useState<Expense | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event: MouseEvent<HTMLElement>, expense: Expense) => {
    setMenuAnchor(event.currentTarget);
    setMenuExpense(expense);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuExpense(null);
  };

  const handleAction = (action: (expense: Expense) => void) => {
    if (menuExpense) action(menuExpense);
    handleMenuClose();
  };

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

  const actionsMenu = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {menuExpense?.planned && onPurchase && (
        <MenuItem onClick={() => handleAction(onPurchase)}>
          <ListItemIcon><ShoppingCartIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Купить</ListItemText>
        </MenuItem>
      )}
      <MenuItem onClick={() => handleAction(onEdit)}>
        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Редактировать</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAction(onDuplicate)}>
        <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
        <ListItemText>Дублировать</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleAction(onDelete)}>
        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
        <ListItemText sx={{ color: "error.main" }}>Удалить</ListItemText>
      </MenuItem>
    </Menu>
  );

  if (isMobile) {
    return (
      <Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {paginatedExpenses.map((expense) => (
            <Card key={expense.id} variant="outlined" sx={expense.planned ? { opacity: 0.7 } : undefined}>
              <CardContent sx={{ pb: 0.5, "&:last-child": { pb: 0.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {expense.planned && (
                        <HourglassEmptyIcon sx={{ fontSize: 14, verticalAlign: "text-bottom", mr: 0.5, color: "text.secondary" }} />
                      )}
                      {expense.title}
                    </Typography>
                    {expense.description && (
                      <Typography variant="caption" color="text.secondary" noWrap component="div">
                        {expense.description}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ ml: 1, whiteSpace: "nowrap" }}>
                    {formatCurrency(expense.amount)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center", mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(expense.date)}
                  </Typography>
                  {!hideType && (
                    <CategoryChip
                      name={expense.type === "MATERIAL" ? "Материал" : expense.type === "LABOR" ? "Работа" : "Доставка"}
                      type={expense.type}
                    />
                  )}
                  {expense.category && (
                    <CategoryChip name={expense.category.name} type={expense.category.type} />
                  )}
                </Box>

                {getDetails(expense) && (
                  <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                    {getDetails(expense)}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ pt: 0, justifyContent: "flex-end" }}>
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, expense)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
        {actionsMenu}
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
          labelRowsPerPage="Строк:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
        />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: "calc(-368px + 100vh)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Название</TableCell>
              {!hideType && <TableCell>Тип</TableCell>}
              <TableCell>Категория</TableCell>
              <TableCell>Детали</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell align="center" sx={{ width: 56 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.map((expense) => (
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
                    {getDetails(expense)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>{formatCurrency(expense.amount)}</Typography>
                </TableCell>
                <TableCell align="center" sx={{ width: 56 }}>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, expense)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {actionsMenu}
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
