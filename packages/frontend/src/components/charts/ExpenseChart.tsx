import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Paper, Typography, Box } from "@mui/material";
import type { CategorySummary } from "@construction-tracker/shared";

interface ExpenseChartProps {
  data: CategorySummary[];
  title: string;
}

const COLORS = [
  "#d97706", "#475569", "#16a34a", "#2563eb", "#dc2626",
  "#7c3aed", "#ea580c", "#0891b2", "#65a30d", "#be185d",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function ExpenseChart({ data, title }: ExpenseChartProps) {
  if (!data.length) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No data for chart</Typography>
      </Paper>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    value: d.total,
  }));

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
