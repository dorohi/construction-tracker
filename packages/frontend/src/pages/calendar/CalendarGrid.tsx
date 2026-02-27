import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { Expense } from "@construction-tracker/shared/dist";
import type { CalendarDay } from "./calendarUtils";
import { getTypeColor } from "./calendarUtils";

const WEEKDAYS_FULL = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEKDAYS_SHORT = ["П", "В", "С", "Ч", "П", "С", "В"];

function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}М`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}т`;
  return String(Math.round(amount));
}

interface CalendarGridProps {
  days: CalendarDay[];
  expensesByDate: Map<string, Expense[]>;
  onDayClick: (dateKey: string) => void;
}

export default function CalendarGrid({
  days,
  expensesByDate,
  onDayClick,
}: CalendarGridProps) {
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));
  const weekdays = isMobile ? WEEKDAYS_SHORT : WEEKDAYS_FULL;

  return (
    <Box>
      {/* Weekday header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {weekdays.map((day, i) => (
          <Box key={i} sx={{ py: 1, textAlign: "center" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: 1,
          borderTop: 0,
          borderColor: "divider",
        }}
      >
        {days.map((day) => {
          const dayExpenses = expensesByDate.get(day.dateKey) || [];
          const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);

          return (
            <Box
              key={day.dateKey}
              onClick={() => onDayClick(day.dateKey)}
              sx={{
                minHeight: isMobile ? 52 : 100,
                p: isMobile ? 0.25 : 0.5,
                borderRight: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: day.isCurrentMonth
                  ? "background.paper"
                  : "action.hover",
                cursor: "pointer",
                overflow: "hidden",
                "&:hover": {
                  bgcolor: day.isCurrentMonth
                    ? "action.hover"
                    : "action.selected",
                },
                "&:nth-of-type(7n)": { borderRight: 0 },
              }}
            >
              {/* Day number */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.25,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    width: isMobile ? 20 : 24,
                    height: isMobile ? 20 : 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: day.isToday ? "primary.main" : "transparent",
                    color: day.isToday
                      ? "primary.contrastText"
                      : day.isCurrentMonth
                        ? "text.primary"
                        : "text.disabled",
                    fontWeight: day.isToday ? 700 : 400,
                    fontSize: isMobile ? "0.7rem" : "0.8rem",
                  }}
                >
                  {day.date.getDate()}
                </Typography>
                {/* Mobile: day total */}
                {isMobile && dayTotal > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.55rem",
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    {formatCompact(dayTotal)}
                  </Typography>
                )}
              </Box>

              {isMobile ? (
                /* Mobile: colored dots only */
                dayExpenses.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.25,
                      flexWrap: "wrap",
                      px: 0.25,
                    }}
                  >
                    {dayExpenses.slice(0, 5).map((exp) => (
                      <Box
                        key={exp.id}
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          bgcolor: getTypeColor(exp.type),
                        }}
                      />
                    ))}
                    {dayExpenses.length > 5 && (
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.5rem", color: "text.secondary", lineHeight: 1 }}
                      >
                        +{dayExpenses.length - 5}
                      </Typography>
                    )}
                  </Box>
                )
              ) : (
                /* Desktop: expense lines */
                <>
                  {dayExpenses.slice(0, 3).map((exp) => (
                    <Box
                      key={exp.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.25,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: getTypeColor(exp.type),
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          flex: 1,
                          fontSize: "0.65rem",
                          color: day.isCurrentMonth
                            ? "text.primary"
                            : "text.disabled",
                          opacity: exp.planned ? 0.6 : 1,
                        }}
                      >
                        {exp.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.6rem",
                          color: "text.secondary",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCompact(exp.amount)}
                      </Typography>
                    </Box>
                  ))}
                  {dayExpenses.length > 3 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.6rem", mt: 0.25, display: "block" }}
                    >
                      +{dayExpenses.length - 3} ещё
                    </Typography>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
