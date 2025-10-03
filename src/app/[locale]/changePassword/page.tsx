"use client";
import { useSnackbar } from "@/component/SnackbarProvider";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";
export default function ChangePasswordPage() {
  const { showSnackbar } = useSnackbar();
  const t = useTranslations("login");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.oldPas || !values.newPasAgain || !values.newPas) {
      showSnackbar(t("snackFillRequired"), "error");
      return;
    }
    if (values.newPasAgain !== values.newPas) {
      showSnackbar(t("snackPasswordsNotMatch"), "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/resetPasswordFromAccount", {
      method: "POST",
      body: JSON.stringify({
        oldPas: values.oldPas,
        newPas: values.newPas,
        newPasAgain: values.newPasAgain,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.succeeded === true) {
      showSnackbar(t("snackResetSuccessTwo"), "success");
      setLoading(false);
      try {
        // 1 saniye bekle
        await delay(1000);

        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (res.ok) {
          window.location.href = "/login";
        } else {
          console.error("Çıkış başarısız");
        }
      } catch (error) {
        console.error("Logout hatası:", error);
      }
    } else {
      showSnackbar(data.message || t("snackOperationFailedTwo"), "error");
      setLoading(false);
    }
  };
  return (
    <Container sx={{ display: "flex", justifyContent: "center" }}>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}
      <Box sx={{ mt: 2 }} maxWidth={"500px"}>
        <Typography
          variant="h1"
          fontSize={"38px"}
          textAlign={"center"}
          mb={"30px"}
        >
          {t("resetTitle")}
        </Typography>

        <form onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            label={t("oldPas")}
            variant="outlined"
            name="oldPas"
            type="password"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("newPas")}
            type="password"
            variant="outlined"
            name="newPas"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("newPasAgain")}
            type="password"
            variant="outlined"
            name="newPasAgain"
            sx={{ mb: 2 }}
          />
          <Button fullWidth variant="contained" type="submit" color="success">
            {t("send")}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
