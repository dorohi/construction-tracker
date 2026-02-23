import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

const useSearch = (
  {
    placeholder,
  }: {
    placeholder: string,
  },
) => {
  const [search, setSearch] = useState("");

  const searchField = (
    <TextField
      placeholder={placeholder}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      size="small"
      fullWidth
      sx={{ mb: 3 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );

  return {
    searchField,
    search,
  };
}

export default useSearch;
