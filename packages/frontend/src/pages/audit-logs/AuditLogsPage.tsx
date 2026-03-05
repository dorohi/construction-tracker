import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Container, Typography, Box, Button, Badge } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useStore } from "@/stores/RootStore";
import AppProgress from "@/components/AppProgress";
import AuditLogFilters from "./AuditLogFilters";
import AuditLogTable from "./AuditLogTable";

const AuditLogsPage = observer(() => {
  const { auditLogStore } = useStore();

  useEffect(() => {
    auditLogStore.loadLogs();
  }, [auditLogStore]);

  return (
    <>
      {auditLogStore.loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Логи действий
          </Typography>
          <Badge badgeContent={auditLogStore.activeFilterCount} color="primary">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={auditLogStore.openFilters}
            >
              Фильтры
            </Button>
          </Badge>
        </Box>

        <AuditLogFilters />
        <AuditLogTable />
      </Container>
    </>
  );
});

export default AuditLogsPage;
