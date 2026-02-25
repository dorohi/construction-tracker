import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { useStore } from "@/stores/RootStore";
import AppProgress from "@/components/AppProgress";

const NewsPage = observer(() => {
  const { newsStore } = useStore();
  const { news, loading } = newsStore;

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

  return (
    <>
      {loading && <AppProgress />}
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Новости
        </Typography>

        <Grid container spacing={3}>
          {news.map((item) => (
            <Grid size={{ xs: 12 }} key={item.id}>
              <Card sx={{ "&:hover": { boxShadow: 4 } }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {item.title}
                  </Typography>

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
    </>
  );
});

export default NewsPage;
