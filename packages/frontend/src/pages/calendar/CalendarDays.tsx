import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

const WEEKDAYS_FULL = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const WEEKDAYS_SHORT = ["П", "В", "С", "Ч", "П", "С", "В"];

const CalendarDays = observer(() => {
  const thm = useTheme();
  const isMobile = useMediaQuery(thm.breakpoints.down("md"));
  const weekdays = isMobile ? WEEKDAYS_SHORT : WEEKDAYS_FULL;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {weekdays.map((day, i) => (
        <Box key={i} sx={{ py: 1, textAlign: "center" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
          >
            {day}
          </Typography>
        </Box>
      ))}
    </Box>
  );
});

export default CalendarDays;
