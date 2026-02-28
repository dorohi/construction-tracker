import { observer } from "mobx-react-lite";
import { TablePagination, useMediaQuery, useTheme } from "@mui/material";
import { useStore } from "../../stores/RootStore";

const Pagination = observer(() => {
  const { expenseStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TablePagination
      component="div"
      count={expenseStore.filteredExpenses.length}
      page={expenseStore.page}
      onPageChange={(_, newPage) => expenseStore.setPage(newPage)}
      rowsPerPage={expenseStore.rowsPerPage}
      onRowsPerPageChange={(e) => expenseStore.setRowsPerPage(parseInt(e.target.value, 10))}
      rowsPerPageOptions={[10, 25, 50, 100]}
      labelRowsPerPage={isMobile ? "Строк" : "Строк на странице:"}
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
    />
  );
});

export default Pagination;
