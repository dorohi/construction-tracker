import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Paper, Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import type { CategorySummary } from "@construction-tracker/shared";

interface ExpenseChartProps {
  data: CategorySummary[];
  title: string;
  colors?: string[];
}

const COLORS = [
  "#d97706", "#475569", "#16a34a", "#2563eb", "#dc2626",
  "#7c3aed", "#ea580c", "#0891b2", "#65a30d", "#be185d",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

export default function ExpenseChart({ data, title, colors }: ExpenseChartProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!data.length) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">Нет данных для графика</Typography>
      </Paper>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    value: d.total,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant={isMobile ? "body1" : "h6"} fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: "100%", height: isMobile ? 240 : 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 70 : 100}
              label={
                isMobile
                  ? false
                  : ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={(colors || COLORS)[index % (colors || COLORS).length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
