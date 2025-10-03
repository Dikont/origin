"use client";

import { Suspense, useMemo } from "react";
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import { lightTheme, darkTheme } from "@/theme/theme";
import ThemeToggle from "./ThemeToggle";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/index";
import { toggleMode } from "@/store/slices/themeSlice";
import Image from "next/image";
export default function ThemeRegistry({
  children,
  token,
}: {
  children: React.ReactNode;
  token?: string | undefined;
}) {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();

  const theme = useMemo(() => {
    return mode === "dark" ? darkTheme : lightTheme;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!token && (
        <AppBar position="static" color="default">
          <Toolbar>
            <Button
              sx={{
                flex: 1,
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
              disableRipple
              disableFocusRipple
              variant="text"
            >
              <Image src="/Dikont-Logo.svg" alt="" width={145} height={55} />
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* <ThemeToggle mode={mode} onToggle={() => dispatch(toggleMode())} /> */}

      {children}
    </ThemeProvider>
  );
}
