import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const EntityTitleAndAdd = observer((
  {
    title,
    handleCreate,
  }: {
    title: string;
    handleCreate: () => void;
  },
) => {
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant={isMobile ? "h5" : "h4"}>{title}</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreate}
      >
        Добавить
      </Button>
    </Box>
  );
});

export default EntityTitleAndAdd;
