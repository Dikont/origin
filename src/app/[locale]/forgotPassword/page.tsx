"use client";

import { useState } from "react";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

// MUI Imports
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Container,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  EmailOutlined,
  ArrowBack, // Geri dön butonu için ikon
  LockResetOutlined, // Şifre sıfırlama ikonu
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Poppins } from "next/font/google";

// --- FONT AYARLARI ---
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// --- TEMA (Login Sayfasıyla Birebir Aynı) ---
const theme = createTheme({
  typography: {
    fontFamily: poppins.style.fontFamily,
  },
  palette: {
    primary: {
      main: "#2e7d32",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "50px",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "50px",
        },
      },
    },
  },
});

export default function ForgotPasswordPage() {
  const t = useTranslations("login"); // Çeviriler login dosyasından geliyor
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- DİL AYARLARI ---
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const changeLanguage = (lng: string) => {
    const search = window.location.search;
    const segments = pathname.split("/");
    segments[1] = lng;
    router.push(segments.join("/") + search);
  };

  // --- API FONKSİYONU ---
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.email) {
      showSnackbar(t("snackFillEmailOnly"), "error");
      return;
    }

    setLoading(true);
    try {
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
    } catch (error) {
      showSnackbar("Connection error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={80} />
        </Backdrop>
      )}

      <Box
        sx={{
          display: "flex",
          height: "calc(100vh)",
          overflow: "hidden",
        }}
      >
        {/* --- SOL PANEL (Login Sayfasıyla Aynı) --- */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: "url(/login/loginLeftBg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            p: 4,
            height: "100%",
            zIndex: 1,
          }}
        >
          {/* Slogan Resmi */}
          <Box
            sx={{
              position: "absolute",
              top: "15%",
              left: "10%",
              zIndex: 3,
            }}
          >
            <Image
              src={`/login/loginLeftText${currentLocale.toUpperCase()}.png`}
              alt="Slogan"
              width={400}
              height={200}
              style={{
                objectFit: "contain",
                width: "100%",
                maxWidth: "450px",
                height: "auto",
              }}
              priority
            />
          </Box>

          {/* Sol Panel Footer Yazısı */}
          <Typography
            sx={{
              position: "absolute",
              bottom: "40px",
              marginLeft: "-50px",
              left: "0",
              width: "100%",
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "16px",
              fontStyle: "italic",
              fontWeight: 300,
              paddingX: "55px",
              zIndex: 3,
            }}
          >
            {t("leftPanelFooterText")}
          </Typography>
        </Box>

        {/* --- SAĞ PANEL (FORM ALANI) --- */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: "url(/login/loginRightBg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflowY: "auto",
            position: "relative",
            zIndex: 2,
            marginLeft: { md: "-100px", xs: 0 },
            borderRadius: { md: "70px 0 0 70px", xs: 0 },
            boxShadow: { md: "-20px 0 30px rgba(0,0,0,0.6)", xs: "none" },
          }}
        >
          {/* HEADER (Logo & Geri Dön Butonu) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 6,
              px: { xs: 3, md: 5 },
              flexShrink: 0,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/Dikont-Logo-Beyaz.svg"
                alt="Dikont Logo"
                width={160}
                height={60}
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>

            {/* Geri Dön Butonu */}
            <Button
              onClick={() => {
                const locale = window.location.pathname.split("/")[1] || "tr";
                router.push(`/${locale}/login`);
              }}
              startIcon={<ArrowBack />}
              sx={{
                background: "linear-gradient(90deg, #451c61 0%, #687ede 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                borderRadius: "10px",
                padding: "10px 25px",
                boxShadow: "0 4px 15px rgba(69, 28, 97, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #687ede 0%, #451c61 100%)",
                  boxShadow: "0 6px 20px rgba(69, 28, 97, 0.6)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {t("backToLogin")}
            </Button>
          </Box>

          {/* FORM KARTI (Glassmorphism) */}
          <Container
            maxWidth="xs"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              pb: 4,
            }}
          >
            <Box
              sx={{
                // Buzlu Cam Efekti
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%)",
                borderRadius: "30px",
                padding: "40px 30px",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                position: "relative",
              }}
            >
              {/* Üstteki Yuvarlak İkon (Kilit İkonu) */}
              <Box
                sx={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px auto",
                }}
              >
                {/* Buraya uygun bir ikon koydum (Kilit/Reset) */}
                <LockResetOutlined sx={{ fontSize: "60px", color: "white" }} />
              </Box>

              <Typography
                variant="h5"
                align="center"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                {t("forgotTitle")}
              </Typography>

              <Typography
                variant="body2"
                align="center"
                sx={{ mb: 4, opacity: 0.8, fontWeight: 200 }}
              >
                {/* Buraya "Email adresinizi girin size link gönderelim" gibi bir yazı çevirisi ekleyebilirsin veya boş bırakabilirsin */}
              </Typography>

              <Box
                component="form"
                onSubmit={handleForgotPassword}
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                {/* --- EMAIL INPUT --- */}
                <TextField
                  fullWidth
                  name="email"
                  label={t("emailLabel")}
                  variant="standard"
                  // --- Login Sayfasındaki Stil Override'ları ---
                  InputLabelProps={{
                    sx: {
                      color: "rgb(255, 255, 255)",
                      fontSize: "14px",
                      fontWeight: 200,
                      transform: "translate(35px, 20px) scale(1)",
                      "&.MuiInputLabel-shrink": {
                        transform: "translate(0, -1.5px) scale(0.85)",
                        color: "white",
                        fontWeight: 300,
                      },
                      "&.Mui-focused": { color: "white" },
                    },
                  }}
                  sx={{
                    // --- MEVCUT AYARLARIN ---
                    "& .MuiInputBase-input": {
                      color: "white",
                      paddingLeft: "10px",
                      fontSize: "14px",
                      fontWeight: 200,
                    },
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "rgba(255,255,255,0.5)",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "white",
                    },
                    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                      borderBottomColor: "white",
                    },

                    // !!! İŞTE O BEYAZLIĞI YOK EDEN SİHİRLİ KOD !!!
                    "& .MuiInputBase-input:-webkit-autofill": {
                      transition: "background-color 5000s ease-in-out 0s", // Rengi değiştirmeyi 5000 saniye geciktirir :)
                      "-webkit-text-fill-color": "white !important", // Yazıyı zorla beyaz yapar
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ marginRight: 0 }}>
                        <EmailOutlined
                          sx={{ color: "white", fontSize: "1.2rem" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* --- GÖNDER BUTONU --- */}
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    background:
                      "linear-gradient(90deg, #451c61 0%, #687ede 100%)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(103, 58, 183, 0.4)",
                    fontSize: "16px",
                    fontWeight: 400,
                    textTransform: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #687ede 0%, #451c61 100%)",
                    },
                  }}
                >
                  {t("continueButton")}
                </Button>
              </Box>
            </Box>
          </Container>

          {/* FOOTER (Login Sayfasıyla Aynı) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              px: { xs: 3, md: 5 },
              flexWrap: "wrap",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: "rgb(255, 255, 255)",
                fontSize: "14px",
                fontWeight: 200,
              }}
            >
              info@dikont.com | +90 212 936 17 96
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* --- RESİMLİ DİL SEÇİCİ --- */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {[
                  { code: "tr", src: "/login/tr1.png", label: "Türkçe" },
                  { code: "en", src: "/login/en2.png", label: "English" },
                  { code: "nl", src: "/login/nl3.png", label: "Dutch" },
                ].map((lang) => {
                  const isActive = currentLocale === lang.code;
                  return (
                    <Box
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        opacity: isActive ? 1 : 0.5,
                        transition: "all 0.2s",
                        "&:hover": {
                          opacity: 1,
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <Image
                        src={lang.src}
                        alt={lang.label}
                        width={28}
                        height={20}
                        style={{
                          objectFit: "cover",
                          borderRadius: "2px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      />
                      <Typography
                        sx={{
                          color: "white",
                          fontSize: "0.75rem",
                          mt: 0.5,
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {lang.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
