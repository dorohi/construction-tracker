import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import InvoiceForm from "./InvoiceForm";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(amount);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU");
}

const InvoicesPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoiceStore, projectStore, supplierStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (id) {
      projectStore.loadProject(id);
      invoiceStore.loadInvoices(id);
    }
    supplierStore.loadSuppliers();
  }, [id, invoiceStore, projectStore, supplierStore]);

  const project = projectStore.currentProject;
  const { invoices, menuAnchor, menuInvoice, deletingInvoice } = invoiceStore;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }} onClick={() => navigate("/projects")}>
          Проекты
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/projects/${id}`)}
        >
          {project?.name || "Проект"}
        </Link>
        <Typography color="text.primary">Накладные</Typography>
      </Breadcrumbs>

      {invoiceStore.loading && <AppProgress />}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 1 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>Накладные</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={invoiceStore.openAddForm}>
          Создать накладную
        </Button>
      </Box>

      {invoices.length === 0 && !invoiceStore.loading ? (
        <Typography color="text.secondary">Накладных пока нет</Typography>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Название</TableCell>
                {!isMobile && <TableCell>Поставщик</TableCell>}
                <TableCell align="right">Позиций</TableCell>
                <TableCell align="right">Итого</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  hover
                  sx={{ cursor: "pointer", opacity: inv.planned ? 0.7 : 1 }}
                  onClick={() => invoiceStore.openEditForm(inv)}
                >
                  <TableCell>{formatDate(inv.date)}</TableCell>
                  <TableCell>{inv.title}</TableCell>
                  {!isMobile && <TableCell>{inv.supplier || "—"}</TableCell>}
                  <TableCell align="right">{inv.itemCount}</TableCell>
                  <TableCell align="right">{formatCurrency(inv.total)}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={(e) => invoiceStore.openMenu(e.currentTarget, inv)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={invoiceStore.closeMenu}>
        <MenuItem
          onClick={() => {
            const inv = menuInvoice!;
            invoiceStore.closeMenu();
            invoiceStore.openEditForm(inv);
          }}
        >
          Открыть
        </MenuItem>
        <MenuItem
          onClick={() => {
            const inv = menuInvoice!;
            invoiceStore.closeMenu();
            invoiceStore.setDeletingInvoice(inv);
          }}
        >
          Удалить
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(deletingInvoice)} onClose={() => invoiceStore.setDeletingInvoice(null)}>
        <DialogTitle>Удалить накладную?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Накладная «{deletingInvoice?.title}» и все её позиции ({deletingInvoice?.itemCount}) будут удалены.
            Действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => invoiceStore.setDeletingInvoice(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              const inv = deletingInvoice!;
              invoiceStore.setDeletingInvoice(null);
              invoiceStore.deleteInvoice(inv.id).then(() => {
                if (id) projectStore.loadProject(id);
              });
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <InvoiceForm />
    </Container>
  );
});

export default InvoicesPage;
