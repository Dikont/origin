"use client";

import { useSnackbar } from "@/component/SnackbarProvider";
import ThemeRegistry from "@/component/ThemeRegistry";
import { useTranslations } from "next-intl";
import { Container, Grid, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function Index() {
  const t = useTranslations("login");
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.email) {
      showSnackbar(t("snackFillEmailOnly"), "error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/forgotPassword", {
      method: "POST",
      body: JSON.stringify({ email: values.email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      showSnackbar(data.message || t("snackEmailSent"), "success");
    } else {
      showSnackbar(data.message || t("snackOperationFailed"), "error");
    }
    setLoading(false);
  };

  const headerHeight = 64;
  const footerHeight = 48;

  const inputStyle = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      borderRadius: "24px",
      paddingRight: "12px",
      backgroundColor: "#fff",
      "& fieldset": {
        borderRadius: "24px",
        borderColor: "#d0d0d0",
      },
      "&:hover fieldset": {
        borderColor: "#999",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2e7d32",
        borderWidth: "2px",
      },
    },
  };

  return (
    <>
      <Box mx={"-24px"} mt="24px">
        <Grid container alignItems={"center"}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              height={`calc(100vh - ${headerHeight}px - ${footerHeight}px)`}
              position={"relative"}
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
                  mx: "30px",
                  width: "100%",
                  maxWidth: "600px",
                  display: { xs: "block", lg: "none" },
                  backgroundColor: "rgba(255, 255, 255, 1)",
                  zIndex: 9,
                  borderRadius: "24px",
                }}
              >
                <Typography variant="h2" fontSize={"24px"} mb={"20px"}>
                  {t("forgotTitle")}
                </Typography>

                <form onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label={t("emailLabel")}
                    variant="outlined"
                    name="email"
                    sx={inputStyle}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    color="success"
                    sx={{ borderRadius: "24px" }}
                  >
                    {t("continueButton")}
                  </Button>
                </form>

                <Box mt={2}>
                  <Button
                    variant="text"
                    sx={{ borderRadius: "24px" }}
                    onClick={() => {
                      const locale =
                        window.location.pathname.split("/")[1] || "tr";
                      router.push(`/${locale}/login`);
                    }}
                  >
                    {t("backToLogin")}
                  </Button>
                </Box>
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
                borderRadius: "24px",
                mx: "20px",
              }}
            >
              <Typography variant="h2" fontSize={"24px"} mb={"20px"}>
                {t("forgotTitle")}
              </Typography>

              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label={t("emailLabel")}
                  variant="outlined"
                  name="email"
                  sx={inputStyle}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  color="success"
                  sx={{ borderRadius: "24px" }}
                >
                  {t("continueButton")}
                </Button>
              </form>

              <Box mt={2}>
                <Button
                  variant="text"
                  sx={{ borderRadius: "24px" }}
                  onClick={() => {
                    const locale =
                      window.location.pathname.split("/")[1] || "tr";
                    router.push(`/${locale}/login`);
                  }}
                >
                  {t("backToLogin")}
                </Button>
              </Box>
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
