"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./index";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-poppins), Arial, sans-serif",

    // Default text: Regular
    body1: { fontWeight: 500 },
    body2: { fontWeight: 400 },

    // Başlıklar (istersen değiştirirsin)
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    // ✅ Button: ExtraLight
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-poppins), Arial, sans-serif",
          fontWeight: 200,
          textTransform: "none",
        },
      },
    },

    // ✅ TextField input yazısı Regular kalsın
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontWeight: 400,
        },
      },
    },

    // ✅ Label'lar Regular
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 400,
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>{children}</Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
