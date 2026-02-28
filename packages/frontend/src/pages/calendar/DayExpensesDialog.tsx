import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Expense } from "@construction-tracker/shared/dist";
import CategoryChip from "../../components/CategoryChip";
import { formatDayLong, getTypeColor } from "./calendarUtils";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

const TYPE_LABELS: Record<string, string> = {
  MATERIAL: "Материал",
  LABOR: "Работа",
  DELIVERY: "Доставка",
};

interface DayExpensesDialogProps {
  open: boolean;
  onClose: () => void;
  dateKey: string | null;
  expenses: Expense[];
}

export default function DayExpensesDialog({
  open,
  onClose,
  dateKey,
  expenses,
}: DayExpensesDialogProps) {
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box component="span" sx={{ textTransform: "capitalize" }}>
          {dateKey ? formatDayLong(dateKey) : ""}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {expenses.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            Нет расходов за этот день
          </Typography>
        ) : (
          <>
            {expenses.map((exp, i) => (
              <Box key={exp.id}>
                {i > 0 && <Divider sx={{ my: 1 }} />}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    py: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: getTypeColor(exp.type),
                      mt: 0.8,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{ opacity: exp.planned ? 0.6 : 1 }}
                      >
                        {exp.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        {formatCurrency(exp.amount)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        mt: 0.5,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {TYPE_LABELS[exp.type] || exp.type}
                      </Typography>
                      {exp.category && (
                        <CategoryChip
                          name={exp.category.name}
                          type={exp.category.type}
                        />
                      )}
                      {exp.planned && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.65rem",
                            color: "warning.main",
                            fontStyle: "italic",
                          }}
                        >
                          план
                        </Typography>
                      )}
                    </Box>
                    {exp.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.25 }}
                      >
                        {exp.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Итого за день
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {formatCurrency(total)}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
