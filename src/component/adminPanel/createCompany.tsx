"use client";

import { useState } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { useSnackbar } from "@/component/SnackbarProvider";

const ENDPOINT = "/api/admin/createCompany"; // kendi route yolun buysa dokunma

export default function CreateAccount() {
  const { showSnackbar } = useSnackbar();
  const [compName, setCompName] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CompName: compName, CompDesc: compDesc }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showSnackbar(data?.error || data?.message || "Şirket oluşturulamadı");
        return;
      }
      showSnackbar("Şirket oluşturuldu.");
      setCompName("");
      setCompDesc("");
    } catch (err: any) {
      showSnackbar(`Hata: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h2" sx={{ mb: 2 }} fontSize={"36px"}>
        Şirket Oluştur
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Şirket Adı"
          size="small"
          fullWidth
          value={compName}
          onChange={(e) => setCompName(e.target.value)}
        />
        <TextField
          label="Şirket Açıklaması"
          size="small"
          fullWidth
          multiline
          minRows={3}
          value={compDesc}
          onChange={(e) => setCompDesc(e.target.value)}
        />

        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Oluştur"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
