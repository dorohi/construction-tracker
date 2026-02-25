import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useStore } from "@/stores/RootStore";
import AppProgress from "@/components/AppProgress";
import NewsForm from "./NewsForm";
import type { News } from "@construction-tracker/shared";

const NewsPage = observer(() => {
  const { newsStore, authStore } = useStore();
  const { news, loading } = newsStore;
  const isAdmin = authStore.user?.isAdmin ?? false;

  const [formOpen, setFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuNewsId, setMenuNewsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    newsStore.loadNews();
  }, [newsStore]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCreate = () => {
    setEditingNews(null);
    setFormOpen(true);
  };

  const handleEdit = (item: News) => {
    setMenuAnchor(null);
    setMenuNewsId(null);
    setEditingNews(item);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setMenuAnchor(null);
    setMenuNewsId(null);
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await newsStore.deleteNews(deleteId);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: { title: string; content: string }) => {
    if (editingNews) {
      await newsStore.updateNews(editingNews.id, data);
    } else {
      await newsStore.createNews(data);
    }
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuNewsId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuNewsId(null);
  };

  const menuNews = news.find((n) => n.id === menuNewsId) ?? null;

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Новости
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Добавить
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {news.map((item) => (
            <Grid size={{ xs: 12 }} key={item.id}>
              <Card sx={{ "&:hover": { boxShadow: 4 } }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {item.title}
                    </Typography>
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, item.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Chip
                      icon={<PersonIcon />}
                      label={item.authorName}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.createdAt)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-wrap", mb: 2 }}
                  >
                    {item.content}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      color={item.userReaction === "like" ? "primary" : "default"}
                      onClick={() => newsStore.toggleReaction(item.id, "like")}
                    >
                      {item.userReaction === "like" ? (
                        <ThumbUpIcon fontSize="small" />
                      ) : (
                        <ThumbUpOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {item.likes}
                    </Typography>

                    <IconButton
                      size="small"
                      color={
                        item.userReaction === "dislike" ? "error" : "default"
                      }
                      onClick={() =>
                        newsStore.toggleReaction(item.id, "dislike")
                      }
                    >
                      {item.userReaction === "dislike" ? (
                        <ThumbDownIcon fontSize="small" />
                      ) : (
                        <ThumbDownOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {item.dislikes}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {!loading && news.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Новостей пока нет
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuNews && handleEdit(menuNews)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuNewsId && handleDeleteClick(menuNewsId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Удалить новость?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Эта новость будет удалена без возможности восстановления.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} variant="contained">
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <NewsForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        news={editingNews}
      />
    </>
  );
});

export default NewsPage;
