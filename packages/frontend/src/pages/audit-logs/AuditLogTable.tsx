import { observer } from "mobx-react-lite";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  TablePagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useStore } from "@/stores/RootStore";

const ACTION_LABELS: Record<string, { label: string; color: "success" | "info" | "error" | "warning" | "default" | "primary" | "secondary" }> = {
  LOGIN: { label: "Вход", color: "info" },
  REGISTER: { label: "Регистрация", color: "success" },
  LOGOUT: { label: "Выход", color: "default" },
  CREATE: { label: "Создание", color: "success" },
  UPDATE: { label: "Обновление", color: "warning" },
  DELETE: { label: "Удаление", color: "error" },
  TRANSFER: { label: "Перенос", color: "primary" },
};

const ENTITY_LABELS: Record<string, string> = {
  session: "Сессия",
  project: "Проект",
  expense: "Расход",
  category: "Категория",
  supplier: "Поставщик",
  carrier: "Доставщик",
  worker: "Работник",
  news: "Новость",
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AuditLogTable = observer(() => {
  const { auditLogStore, authStore } = useStore();
  const { logs, total, page, limit, loading } = auditLogStore;
  const isAdmin = authStore.user?.isAdmin ?? false;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!loading && logs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Логов пока нет
        </Typography>
      </Box>
    );
  }

  const paginationComponent = (
    <TablePagination
      component="div"
      count={total}
      page={page - 1}
      onPageChange={(_, newPage) => auditLogStore.setPage(newPage + 1)}
      rowsPerPage={limit}
      rowsPerPageOptions={[25]}
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
    />
  );

  if (isMobile) {
    return (
      <>
        {logs.map((log) => {
          const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "default" as const };
          return (
            <Card key={log.id} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ENTITY_LABELS[log.entity] || log.entity}
                    </Typography>
                    {log.details && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {log.details}
                      </Typography>
                    )}
                    {isAdmin && log.user && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {log.user.name}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {formatDateTime(log.createdAt)}
                    </Typography>
                    <Chip label={actionInfo.label} color={actionInfo.color} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
        {paginationComponent}
      </>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата/время</TableCell>
              {isAdmin && <TableCell>Пользователь</TableCell>}
              <TableCell>Действие</TableCell>
              <TableCell>Сущность</TableCell>
              <TableCell>Детали</TableCell>
              <TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: "default" as const };
              return (
                <TableRow key={log.id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>{log.user?.name || "—"}</TableCell>
                  )}
                  <TableCell>
                    <Chip label={actionInfo.label} color={actionInfo.color} size="small" />
                  </TableCell>
                  <TableCell>{ENTITY_LABELS[log.entity] || log.entity}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.details || "—"}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{log.ip || "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {paginationComponent}
    </>
  );
});

export default AuditLogTable;
