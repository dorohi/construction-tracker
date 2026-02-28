import { Snackbar, Alert } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";

const AppSnackbar = observer(() => {
  const { snackbarStore } = useStore();

  return (
    <Snackbar
      open={snackbarStore.open}
      autoHideDuration={4000}
      onClose={snackbarStore.close}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={snackbarStore.close}
        severity={snackbarStore.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {snackbarStore.message}
      </Alert>
    </Snackbar>
  );
});

export default AppSnackbar;
