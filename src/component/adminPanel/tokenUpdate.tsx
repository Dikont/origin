"use client";
import {
  Typography,
  Stack,
  TextField,
  Box,
  Backdrop,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";

import { useSnackbar } from "@/component/SnackbarProvider";
import { useState } from "react";
export default function TokenUpdate() {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const handleDocToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (
      !values.email ||
      !values.newTokenCount ||
      !values.superUser ||
      !values.superPassword
    ) {
      showSnackbar("Tüm bilgileri doldurun", "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/documentTokenUpdate", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        newTokenCount: values.newTokenCount,
        superUser: values.superUser,
        superPassword: values.superPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await res.json();
    if (!res.ok) {
      setLoading(false);
      showSnackbar("Bir hata oluştu", "error");
    } else {
      setLoading(false);
      showSnackbar("Bilgiler güncellendi", "success");
    }
  };
  const handleAIToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (
      !values.email ||
      !values.newTokenCount ||
      !values.superUser ||
      !values.superPassword
    ) {
      showSnackbar("Tüm bilgileri doldurun", "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/AITokenUpdate", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        newTokenCount: values.newTokenCount,
        superUser: values.superUser,
        superPassword: values.superPassword,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await res.json();
    if (!res.ok) {
      setLoading(false);
      showSnackbar("Bir hata oluştu", "error");
    } else {
      setLoading(false);
      showSnackbar("Bilgiler güncellendi", "success");
    }
  };
  return (
    <Box width={"100%"}>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}
      <Box m="30px 0 60px 0">
        <Typography variant="h2" sx={{ mb: 2 }} fontSize={"36px"}>
          Doküman Token Güncelle
        </Typography>
        <form onSubmit={handleDocToken}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField fullWidth size="small" label="email" name="email" />
            <TextField
              fullWidth
              size="small"
              name="newTokenCount"
              label="Token Sayısı"
            />
          </Stack>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              fullWidth
              size="small"
              label="superUser"
              name="superUser"
              autoComplete="off"
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              label="superPassword"
              name="superPassword"
              autoComplete="new-password"
            />
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              id="54321"
            >
              {loading ? "Yükleniyor..." : "Güncelle"}
            </Button>
          </Stack>
        </form>
      </Box>
      <Divider sx={{ mt: 5, mb: 5 }} />
      <Box m="30px 0 60px 0">
        <Typography variant="h2" sx={{ mb: 2 }} fontSize={"36px"}>
          AI Token Güncelle
        </Typography>
        <form onSubmit={handleAIToken}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField fullWidth size="small" label="email" name="email" />
            <TextField
              fullWidth
              size="small"
              name="newTokenCount"
              label="Token Sayısı"
            />
          </Stack>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              fullWidth
              size="small"
              label="superUser"
              name="superUser"
              autoComplete="off"
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              label="superPassword"
              name="superPassword"
              autoComplete="new-password"
            />
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              id="12345"
            >
              {loading ? "Yükleniyor..." : "Güncelle"}
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
