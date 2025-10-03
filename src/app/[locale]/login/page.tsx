"use client";

import { useSnackbar } from "@/component/SnackbarProvider";
import { useTranslations } from "next-intl";
import { Backdrop, CircularProgress, Grid, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const t = useTranslations("login");
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.email || !values.password) {
      showSnackbar(t("snackFillEmailPassword"), "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await res.json();
    if (!res.ok) {
      showSnackbar(t("snackLoginFailed"), "error");
      setLoading(false);
    } else {
      setLoading(false);
      showSnackbar(t("snackLoginSuccess"), "success");
      const locale = window.location.pathname.split("/")[1] || "tr";
      window.location.href = `/${locale}/dashboard`;
    }
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.email || !values.PhoneNumber || !values.Name) {
      showSnackbar(t("snackFillEmailOnly"), "error");

      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/generateRequestForAccount", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        PhoneNumber: values.PhoneNumber,
        Name: values.Name,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (data.message === "User Request Created") {
      showSnackbar(t("snackEmailSent"), "success");
      setLoading(false);
    } else if (data.error === "Geçerli bir email giriniz") {
      showSnackbar(t("snackEnterValidEmail"), "error");
      setLoading(false);
    } else {
      showSnackbar(data.details?.message || t("snackOperationFailed"), "error");
      setLoading(false);
    }
  };

  const headerHeight = 64;
  const footerHeight = 54;

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}

      <Box mx={"-24px"} mt="24px">
        <Grid container alignItems={"center"}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              height={`calc(100vh - ${headerHeight}px - ${footerHeight}px)`}
              position={"relative"}
              mr={{ xs: 0, lg: 2 }}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Image
                src="/login/1.jpg"
                alt={t("imageAltLogin")}
                fill
                style={{ objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(0,0,0,0.5)",
                  display: { xs: "block", lg: "none" },
                  zIndex: 8,
                }}
              />
              <Paper
                sx={{
                  p: 4,
                  m: 2,
                  width: "100%",
                  maxWidth: "600px",
                  display: { xs: "block", lg: "none" },
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  zIndex: 9,
                  borderRadius: "24px",
                }}
              >
                <Typography variant="h5" gutterBottom textAlign="center">
                  {t(showLogin ? "loginTitle" : "registerTitle")}
                </Typography>

                {showLogin ? (
                  <form onSubmit={handleLogin}>
                    <TextField
                      type="email"
                      fullWidth
                      label={t("emailLabel")}
                      variant="outlined"
                      name="email"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label={t("passwordLabel")}
                      type="password"
                      variant="outlined"
                      name="password"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "end" }}>
                      <Link
                        href="forgotPassword"
                        style={{
                          textDecoration: "none",
                          color: "#1976D2",
                          marginBottom: "16px",
                        }}
                      >
                        {t("forgotPasswordLink")}
                      </Link>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      color="success"
                    >
                      {t("loginButton")}
                    </Button>
                    <Button
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setShowLogin(false)}
                    >
                      {t("toggleToRegister")}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateAccount}>
                    <TextField
                      fullWidth
                      label={t("emailLabel")}
                      variant="outlined"
                      name="email"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label={t("name")}
                      variant="outlined"
                      name="Name"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label={t("phoneNumber")}
                      variant="outlined"
                      name="PhoneNumber"
                      type="tel"
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 11,
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/\D/g, "");
                      }}
                      sx={{ mb: 2 }}
                    />
                    <Button fullWidth variant="contained" type="submit">
                      {t("registerButton")}
                    </Button>
                    <Button
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => setShowLogin(true)}
                    >
                      {t("toggleToLogin")}
                    </Button>
                  </form>
                )}
              </Paper>
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, lg: 4 }}
            justifyContent={"center"}
            display={"flex"}
          >
            <Paper
              sx={{
                p: 4,
                width: "100%",
                maxWidth: "600px",
                display: { xs: "none", lg: "block" },
              }}
            >
              <Typography variant="h5" gutterBottom textAlign="center">
                {t(showLogin ? "loginTitle" : "registerTitle")}
              </Typography>

              {showLogin ? (
                <form onSubmit={handleLogin}>
                  <TextField
                    type="email"
                    fullWidth
                    label={t("emailLabel")}
                    variant="outlined"
                    name="email"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={t("passwordLabel")}
                    type="password"
                    variant="outlined"
                    name="password"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "end" }}>
                    <Link
                      href="forgotPassword"
                      style={{
                        textDecoration: "none",
                        color: "#1976D2",
                        marginBottom: "16px",
                      }}
                    >
                      {t("forgotPasswordLink")}
                    </Link>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    color="success"
                  >
                    {t("loginButton")}
                  </Button>
                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => setShowLogin(false)}
                  >
                    {t("toggleToRegister")}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCreateAccount}>
                  <TextField
                    fullWidth
                    label={t("emailLabel")}
                    variant="outlined"
                    name="email"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={t("name")}
                    variant="outlined"
                    name="Name"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label={t("phoneNumber")}
                    variant="outlined"
                    name="PhoneNumber"
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      maxLength: 11, // 11 hane sınırı
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/\D/g, ""); // rakam dışı karakteri sil
                    }}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    color="success"
                  >
                    {t("registerButton")}
                  </Button>
                  <Button
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => setShowLogin(true)}
                  >
                    {t("toggleToLogin")}
                  </Button>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          py: 2,
          textAlign: "center",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Dikont. {t("footerRights")}
        </Typography>
      </Box>
    </>
  );
}
