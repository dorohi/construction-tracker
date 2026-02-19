import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
} from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useStore } from "../stores/RootStore";

const LoginPage = observer(() => {
  const { authStore } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authStore.login(email, password);
    if (authStore.isAuthenticated) {
      navigate("/projects");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <ConstructionIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
        <Typography variant="h5" gutterBottom>
          Construction Tracker
        </Typography>
        <Paper sx={{ p: 3, width: "100%", mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sign In
          </Typography>
          {authStore.error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => authStore.clearError()}>
              {authStore.error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={authStore.loading}
            >
              {authStore.loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link component={RouterLink} to="/register">
              Don't have an account? Register
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});

export default LoginPage;
