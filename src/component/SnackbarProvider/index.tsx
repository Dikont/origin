"use client";

import { createContext, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

type Severity = "success" | "error" | "warning" | "info";

type SnackbarContextType = {
  /** Örn: showSnackbar("Mesaj", "info", 20000) */
  showSnackbar: (
    message: string,
    severity?: Severity,
    durationMs?: number
  ) => void;
  closeSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context)
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  return context;
};

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("info");
  const [autoHideMs, setAutoHideMs] = useState<number | undefined>(4000);

  const showSnackbar = (
    msg: string,
    sev: Severity = "info",
    durationMs: number = 4000
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setAutoHideMs(durationMs);
    setOpen(true);
  };

  const closeSnackbar = () => setOpen(false);

  const handleClose = (_: any, reason?: string) => {
    if (reason === "clickaway") return;
    closeSnackbar();
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideMs || 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleClose}
          severity={severity}
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </MuiAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
