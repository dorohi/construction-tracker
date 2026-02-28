import { observer } from "mobx-react-lite";
import { Box, Card, CardContent, CardActions, IconButton, Typography } from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CategoryChip from "@/components/CategoryChip";
import Pagination from "@/pages/expenses/Pagination";
import ActionsMenu from "@/pages/expenses/ActionsMenu";
import { formatCurrency, formatDate } from "@/Utils";
import { getDetails } from "@/pages/expenses/ExpenseTable";
import { useStore } from "../../stores/RootStore";

const ExpenseMobile = observer(() => {
  const { expenseStore } = useStore();

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {expenseStore.paginatedExpenses.map((expense) => (
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
                <CategoryChip
                  name={expense.type === "MATERIAL" ? "Материал" : expense.type === "LABOR" ? "Работа" : "Доставка"}
                  type={expense.type}
                />
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
              <IconButton size="small" onClick={(e) => expenseStore.openMenu(e.currentTarget, expense)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>
      <ActionsMenu />
      <Pagination />
    </Box>
  );
});

export default ExpenseMobile;
