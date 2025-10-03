'use client';

import { IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ThemeToggle({
  mode,
  onToggle,
}: {
  mode: 'light' | 'dark';
  onToggle: () => void;
}) {
  return (
    <IconButton onClick={onToggle} sx={{ position: 'absolute', top: 10, right: 10 }}>
      {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
