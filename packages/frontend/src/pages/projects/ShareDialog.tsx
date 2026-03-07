import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useStore } from "../../stores/RootStore";

const ShareDialog = observer(() => {
  const { projectStore, snackbarStore } = useStore();
  const { currentProject: project, shareDialogOpen } = projectStore;

  if (!project) return null;

  const isPublic = project.isPublic || false;
  const shareUrl = project.shareToken
    ? `${window.location.origin}/shared/${project.shareToken}`
    : "";

  const handleToggle = () => {
    projectStore.toggleShare(project.id);
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      snackbarStore.show("Ссылка скопирована", "success");
    }
  };

  return (
    <Dialog
      open={shareDialogOpen}
      onClose={projectStore.closeShareDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Поделиться проектом</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Switch checked={isPublic} onChange={handleToggle} color="primary" />
          }
          label="Сделать проект публичным"
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isPublic
            ? "Любой с этой ссылкой сможет видеть данные проекта в режиме только для чтения."
            : "Включите публичный доступ, чтобы получить ссылку для просмотра."}
        </Typography>

        {isPublic && shareUrl && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={shareUrl}
              slotProps={{ input: { readOnly: true } }}
            />
            <IconButton onClick={handleCopy} color="primary" title="Копировать">
              <ContentCopyIcon />
            </IconButton>
            <IconButton
              color="primary"
              title="Открыть"
              onClick={() => window.open(shareUrl, "_blank")}
            >
              <OpenInNewIcon />
            </IconButton>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={projectStore.closeShareDialog}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
});

export default ShareDialog;
