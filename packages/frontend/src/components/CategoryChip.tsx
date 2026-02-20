import { Chip } from "@mui/material";

interface CategoryChipProps {
  name: string;
  type: string;
}

export default function CategoryChip({ name, type }: CategoryChipProps) {
  return (
    <Chip
      label={name}
      size="small"
      color={type === "MATERIAL" ? "primary" : type === "LABOR" ? "secondary" : "success"}
      variant="outlined"
    />
  );
}
