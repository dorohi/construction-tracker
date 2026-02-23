import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { LinearProgress } from '@mui/material';

const AppProgress = observer(() => (
  <LinearProgress
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1300,
    }}
  />
));

export default AppProgress;
