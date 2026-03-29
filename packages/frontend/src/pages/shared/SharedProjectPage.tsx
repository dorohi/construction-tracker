import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  LinearProgress,
  Breadcrumbs,
  Link,
  Badge,
  Button,
  IconButton,
  Tooltip,
  TablePagination,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import Grid from "@mui/material/Grid2";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HandymanIcon from "@mui/icons-material/Handyman";
import SavingsIcon from "@mui/icons-material/Savings";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useStore } from "../../stores/RootStore";
import SummaryCard from "../../components/SummaryCard";
import ExpenseChart from "../../components/charts/ExpenseChart";
import CategoryChip from "@/components/CategoryChip";
import AppProgress from "@/components/AppProgress";
import { formatCurrency, formatDate } from "@/Utils";
import { getDetails } from "@/pages/expenses/ExpenseTable";
import SharedFilters from "./SharedFilters";

const SharedProjectPage = observer(() => {
  const { token } = useParams<{ token: string }>();
  const { sharedStore } = useStore();
  const navigate = useNavigate();
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));

  useEffect(() => {
    if (token) {
      sharedStore.loadProject(token);
    }
  }, [token, sharedStore]);

  const { detail } = sharedStore;

  if (!sharedStore.loading && !detail) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <LockIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Проект не найден
        </Typography>
        <Typography color="text.secondary">
          Этот проект не существует или больше не является публичным
        </Typography>
      </Container>
    );
  }

  if (!detail) return <AppProgress />;

  const { project, summary } = detail;
  const expenses = sharedStore.paginatedExpenses;

  return (
    <>
      {sharedStore.loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/shared")}
          >
            Публичные проекты
          </Link>
          <Typography color="text.primary">{project.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
          <Typography variant={isMobile ? "h5" : "h4"}>
            {project.name}
          </Typography>
          {project.description && (
            <Typography color="text.secondary">{project.description}</Typography>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {project.ownerName}
            </Typography>
          </Box>
        </Box>

        {/* Summary cards */}
        <Grid container spacing={{ xs: 1.5, sm: 3 }} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Бюджет"
              value={summary.budget != null ? formatCurrency(summary.budget) : "Не задан"}
              icon={<AccountBalanceIcon />}
              color="info.main"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Потрачено"
              value={formatCurrency(summary.totalSpent)}
              icon={<AttachMoneyIcon />}
              color="warning.main"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Запланировано"
              value={formatCurrency(summary.plannedTotal)}
              icon={<PlaylistAddCheckIcon />}
              color="info.main"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard
              title="Остаток"
              value={summary.remaining != null ? formatCurrency(summary.remaining) : "Н/Д"}
              icon={<SavingsIcon />}
              color={summary.remaining != null && summary.remaining < 0 ? "error.main" : "success.main"}
            />
          </Grid>
        </Grid>

        {/* Type breakdown */}
        {isMobile ? (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box sx={{ display: "flex" }}>
                {[
                  { title: "Материалы", value: summary.materialTotal, icon: <BuildIcon sx={{ fontSize: "1rem" }} />, color: "primary.main" },
                  { title: "Работы", value: summary.laborTotal, icon: <PeopleIcon sx={{ fontSize: "1rem" }} />, color: "secondary.main" },
                  { title: "Инструменты", value: summary.toolTotal, icon: <HandymanIcon sx={{ fontSize: "1rem" }} />, color: "warning.main" },
                  { title: "Доставки", value: summary.deliveryTotal, icon: <LocalShippingIcon sx={{ fontSize: "1rem" }} />, color: "success.main" },
                ].map((item, i) => (
                  <Box key={item.title} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", py: 1.5, px: 1, borderLeft: i > 0 ? 1 : 0, borderColor: "divider" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: item.color, mb: 0.5 }}>
                      {item.icon}
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{item.title}</Typography>
                    </Box>
                    <Typography fontWeight={700} sx={{ fontSize: "0.85rem" }}>{formatCurrency(item.value)}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ sm: 3 }}>
              <SummaryCard title="Материалы" value={formatCurrency(summary.materialTotal)} icon={<BuildIcon />} color="primary.main" />
            </Grid>
            <Grid size={{ sm: 3 }}>
              <SummaryCard title="Работы" value={formatCurrency(summary.laborTotal)} icon={<PeopleIcon />} color="secondary.main" />
            </Grid>
            <Grid size={{ sm: 3 }}>
              <SummaryCard title="Инструменты" value={formatCurrency(summary.toolTotal)} icon={<HandymanIcon />} color="warning.main" />
            </Grid>
            <Grid size={{ sm: 3 }}>
              <SummaryCard title="Доставки" value={formatCurrency(summary.deliveryTotal)} icon={<LocalShippingIcon />} color="success.main" />
            </Grid>
          </Grid>
        )}

        {/* Budget progress */}
        {summary.budget != null && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" gutterBottom>
              Использование бюджета: {((summary.totalSpent / summary.budget) * 100).toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((summary.totalSpent / summary.budget) * 100, 100)}
              color={summary.totalSpent / summary.budget > 0.9 ? "error" : summary.totalSpent / summary.budget > 0.7 ? "warning" : "primary"}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        )}

        {/* Charts */}
        {(() => {
          const TYPE_COLORS: Record<string, string> = {
            MATERIAL: "#1976d2",
            LABOR: "#546e7a",
            DELIVERY: "#16a34a",
            TOOL: "#ed6c02",
          };

          function generateShades(hex: string, count: number): string[] {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const shades: string[] = [];
            for (let i = 0; i < count; i++) {
              const factor = 0.4 + (0.6 * i) / Math.max(count - 1, 1);
              const nr = Math.round(r + (255 - r) * (1 - factor));
              const ng = Math.round(g + (255 - g) * (1 - factor));
              const nb = Math.round(b + (255 - b) * (1 - factor));
              shades.push(`#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`);
            }
            return shades;
          }

          const typeData = [
            { categoryId: null, categoryName: "Материалы", type: "MATERIAL", total: summary.materialTotal, count: 0 },
            { categoryId: null, categoryName: "Работы", type: "LABOR", total: summary.laborTotal, count: 0 },
            { categoryId: null, categoryName: "Инструменты", type: "TOOL", total: summary.toolTotal, count: 0 },
            { categoryId: null, categoryName: "Доставки", type: "DELIVERY", total: summary.deliveryTotal, count: 0 },
          ].filter((d) => d.total > 0);

          const categoryCharts = [
            { type: "MATERIAL", title: "Расходы на материалы по категориям" },
            { type: "LABOR", title: "Расходы на работы по категориям" },
            { type: "TOOL", title: "Расходы на инструменты по категориям" },
            { type: "DELIVERY", title: "Расходы на доставки по категориям" },
          ]
            .map(({ type, title }) => {
              const data = summary.byCategory.filter((c) => c.type === type);
              return { type, title, data, colors: generateShades(TYPE_COLORS[type], data.length) };
            })
            .filter(({ data }) => data.length > 0);

          return (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ExpenseChart data={typeData} colors={typeData.map((d) => TYPE_COLORS[d.type])} title="Расходы по типам" />
              </Grid>
              {categoryCharts.map(({ type, title, data, colors }) => (
                <Grid key={type} size={{ xs: 12, md: 6 }}>
                  <ExpenseChart data={data} colors={colors} title={title} />
                </Grid>
              ))}
            </Grid>
          );
        })()}

        {/* Expenses */}
        {sharedStore.allExpenses.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="h6">
                Расходы ({sharedStore.totalFiltered})
              </Typography>
              {isMobile ? (
                <Tooltip title="Фильтры">
                  <IconButton onClick={sharedStore.openFilters}>
                    <Badge badgeContent={sharedStore.activeFilterCount} color="primary">
                      <FilterListIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              ) : (
                <Badge badgeContent={sharedStore.activeFilterCount} color="primary">
                  <Button variant="outlined" size="small" startIcon={<FilterListIcon />} onClick={sharedStore.openFilters}>
                    Фильтры
                  </Button>
                </Badge>
              )}
            </Box>

            <SharedFilters />

            {isMobile ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {expenses.map((expense) => (
                  <Card key={expense.id} variant="outlined" sx={expense.planned ? { opacity: 0.7 } : undefined}>
                    <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
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
                          name={expense.type === "MATERIAL" ? "Материал" : expense.type === "LABOR" ? "Работа" : expense.type === "TOOL" ? "Инструмент" : "Доставка"}
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
                  </Card>
                ))}
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Название</TableCell>
                      <TableCell>Тип</TableCell>
                      <TableCell>Категория</TableCell>
                      <TableCell>Детали</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} sx={expense.planned ? { opacity: 0.6 } : undefined}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {expense.planned && (
                              <HourglassEmptyIcon sx={{ fontSize: 14, verticalAlign: "text-bottom", mr: 0.5, color: "text.secondary" }} />
                            )}
                            {expense.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <CategoryChip
                            name={expense.type === "MATERIAL" ? "Материал" : expense.type === "LABOR" ? "Работа" : expense.type === "TOOL" ? "Инструмент" : "Доставка"}
                            type={expense.type}
                          />
                        </TableCell>
                        <TableCell>
                          {expense.category?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {getDetails(expense)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <TablePagination
              component="div"
              count={sharedStore.totalFiltered}
              page={sharedStore.page}
              onPageChange={(_, p) => sharedStore.setPage(p)}
              rowsPerPage={sharedStore.rowsPerPage}
              onRowsPerPageChange={(e) => sharedStore.setRowsPerPage(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Строк:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
            />
          </Box>
        )}
      </Container>
    </>
  );
});

export default SharedProjectPage;
