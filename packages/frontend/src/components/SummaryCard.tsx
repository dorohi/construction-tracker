import { Card, CardContent, Typography, Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color?: string;
  sx?: SxProps<Theme>;
}

export default function SummaryCard({ title, value, icon, color = "primary.main", sx }: SummaryCardProps) {
  return (
    <Card sx={sx}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              {title}
            </Typography>
            <Typography
              fontWeight={700}
              noWrap
              sx={{ fontSize: { xs: "0.95rem", sm: "1.5rem" } }}
            >
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8, flexShrink: 0, "& .MuiSvgIcon-root": { fontSize: { xs: "1.25rem", sm: "1.75rem" } } }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
