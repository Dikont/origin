"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./index";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      <Provider store={store}>{children}</Provider>
    </AppRouterCacheProvider>
  );
}
