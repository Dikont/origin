"use client";

import { useState } from "react";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// MUI Imports
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Container,
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  BadgeOutlined,
  EmailOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { Poppins } from "next/font/google";
const poppins = Poppins({
  subsets: ["latin"],
  // İstediğin ağırlıklar: 200(ExtraLight), 300(Light), 400(Regular), 500(Medium), 600(SemiBold)
  weight: ["200", "300", "400", "500", "600"],
  style: ["normal", "italic"], // İtalik desteği
});

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
            "&:hover fieldset": {
              borderColor: "#ccc",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2e7d32",
            },
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

export default function LoginPage() {
  const t = useTranslations("login");
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [phoneValue, setPhoneValue] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  // --- DİL İÇİN GEREKLİ STATELER ---
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en"; // Varsayılan en
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(
    null,
  );
  const locales = ["tr", "en", "nl"];
  const openLanguageMenu = (e: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(e.currentTarget);
  };
  const changeLanguage = (lng: string) => {
    const search = window.location.search;
    const segments = pathname.split("/");
    segments[1] = lng;
    router.push(segments.join("/") + search);
    setLanguageAnchor(null);
  };

  const rawPhone = phoneValue.toString().trim();
  const phoneForBackend = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;

  // --- API FONKSİYONLARI ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.email || !values.password) {
      showSnackbar(t("snackFillEmailPassword"), "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      setLoading(false);
      showSnackbar("Connection error", "error");
    }
  };

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    if (!values.email || !phoneValue || !values.Name) {
      showSnackbar(t("snackFillEmailOnly"), "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/generateRequestForAccount", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          PhoneNumber: phoneForBackend,
          Name: values.Name,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.message === "User Request Created") {
        showSnackbar(t("snackEmailSent"), "success");
        setLoading(false);
      } else if (data.error === "Geçerli bir email giriniz") {
        showSnackbar(t("snackEnterValidEmail"), "error");
        setLoading(false);
      } else {
        showSnackbar(
          data.details?.message || t("snackOperationFailed"),
          "error",
        );
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showSnackbar("Connection error", "error");
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
        {/* --- SOL PANEL --- */}
        <Box
          sx={{
            flex: 1,

            // Arka Plan Resmi
            backgroundImage: "url(/login/loginLeftBg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",

            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", // Mutlaka relative olmalı
            overflow: "hidden",
            p: 4,
            height: "100%",
            zIndex: 1,
          }}
        >
          {/* --- ÜSTTEKİ SLOGAN RESMİ --- */}
          <Box
            sx={{
              position: "absolute",
              top: "15%", // Tasarıma göre biraz aşağıya aldım
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

          {/* --- EN ALTTAKİ YAZI (YENİ EKLENDİ) --- */}
          <Typography
            sx={{
              position: "absolute",
              bottom: "40px", // En alttan 40px yukarıda
              marginLeft: "-50px",
              left: "0",
              width: "100%",
              textAlign: "center", // Ortalanmış yazı
              color: "rgba(255, 255, 255, 0.8)", // Hafif saydam beyaz
              fontSize: "16px",
              fontStyle: "italic", // İtalik stil
              fontWeight: 300,
              paddingX: "55px", // Kenarlardan taşmasın diye boşluk
              zIndex: 3,
            }}
          >
            {t("leftPanelFooterText")}
          </Typography>
        </Box>
        {/* --- SAĞ PANEL (FORM) --- */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: "url(/login/loginRightBg.png)",
            backgroundSize: "cover", // Resmi kutuya tam sığdırır
            backgroundPosition: "center", // Resmi ortalar
            backgroundRepeat: "no-repeat", // Tekrar etmesini engeller

            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflowY: "auto",
            position: "relative",

            // --- YENİ EKLENEN STİLLER BURADA ---
            zIndex: 2, // Sol panelin üstüne çıkması için
            // Sadece masaüstünde (md) sola kaydır ve köşe yuvarla
            marginLeft: { md: "-100px", xs: 0 },
            borderRadius: { md: "70px 0 0 70px", xs: 0 },
            // Hafif gölge verelim ki üstte olduğu belli olsun
            boxShadow: { md: "-20px 0 30px rgba(0,0,0,0.6)", xs: "none" },
          }}
        >
          {/* HEADER (Logo & Toggle Butonu) */}
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/Dikont-Logo-Beyaz.svg" // Logo dosyan (Beyaz versiyonu varsa daha iyi durur)
                alt="Dikont Logo"
                width={160}
                height={60}
                style={{ objectFit: "contain" }}
                priority
              />
            </Box>

            <Button
              // Resimde ikon olmadığı için startIcon'u kaldırdım, istersen ekleyebilirsin.
              onClick={() => setShowLogin(!showLogin)}
              sx={{
                // --- İSTEDİĞİN GRADIENT ---
                background: "linear-gradient(90deg, #451c61 0%, #687ede 100%)",
                color: "#fff",

                // --- FONT AYARLARI ---
                fontWeight: 600, // SemiBold
                fontSize: "0.95rem",
                textTransform: "none", // Harfleri olduğu gibi göster

                // --- ŞEKİL VE BOŞLUK ---
                borderRadius: "10px", // Hap şekli (Pill)
                padding: "10px 30px", // Geniş durması için padding
                boxShadow: "0 4px 15px rgba(69, 28, 97, 0.4)", // Butonun rengine uygun gölge

                // --- HOVER EFEKTİ ---
                transition: "all 0.3s ease",
                "&:hover": {
                  // Üzerine gelince gradient yönünü değiştiriyoruz, çok şık durur
                  background:
                    "linear-gradient(90deg, #687ede 0%, #451c61 100%)",
                  boxShadow: "0 6px 20px rgba(69, 28, 97, 0.6)",
                  transform: "translateY(-2px)", // Hafif yukarı zıplama efekti
                },
              }}
            >
              {showLogin ? t("toggleToRegister") : t("toggleToLogin")}
            </Button>
          </Box>

          {/* FORM KARTI (Glassmorphism) */}
          <Container
            maxWidth="xs" // Kartı daralttık
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
                // BUZLU CAM EFEKTİ & GRADIENT
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
              {/* Üstteki Yuvarlak İkon */}
              <Box
                sx={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 30px auto",
                }}
              >
                <Image
                  src="/login/checkIcon.svg" // Dosya yolun (public klasörüne göre)
                  alt="Check Icon"
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }}
                />
              </Box>

              {showLogin ? (
                <Box
                  component="form"
                  onSubmit={handleLogin}
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  {/* --- E-MAIL INPUT --- */}
                  <TextField
                    fullWidth
                    name="email"
                    label={t("emailLabel")}
                    variant="standard"
                    // --- ETİKET AYARLARI (ExtraLight & 14px) ---
                    InputLabelProps={{
                      sx: {
                        color: "rgb(255, 255, 255)",
                        // --- GÜNCELLEME BURADA ---
                        fontSize: "14px", // 14px boyut
                        fontWeight: 200, // ExtraLight
                        // -------------------------
                        transform: "translate(35px, 20px) scale(1)",
                        "&.MuiInputLabel-shrink": {
                          transform: "translate(0, -1.5px) scale(0.85)", // Biraz daha küçülttüm (0.75 -> 0.85) okunurluk için
                          color: "white",
                          fontWeight: 300, // Yukarı çıkınca Light olsun (biraz daha belirgin)
                        },
                        "&.Mui-focused": { color: "white" },
                      },
                    }}
                    sx={{
                      // --- YAZILAN METİN AYARLARI (ExtraLight & 14px) ---
                      "& .MuiInputBase-input": {
                        color: "white",
                        paddingLeft: "10px",
                        // --- GÜNCELLEME BURADA ---
                        fontSize: "14px", // 14px boyut
                        fontWeight: 200, // ExtraLight
                        // -------------------------
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
                      "& .MuiInputBase-input:-webkit-autofill": {
                        transition: "background-color 5000s ease-in-out 0s",
                        "-webkit-text-fill-color": "white !important",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ marginRight: 0 }}
                        >
                          <EmailOutlined
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />{" "}
                          {/* İkonu da orantılı küçülttüm 1.3 -> 1.2 */}
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* --- PASSWORD INPUT --- */}
                  <TextField
                    fullWidth
                    name="password"
                    label={t("passwordLabel")}
                    type={showPassword ? "text" : "password"}
                    variant="standard"
                    // --- ETİKET AYARLARI ---
                    InputLabelProps={{
                      sx: {
                        color: "rgb(255, 255, 255)",
                        fontSize: "14px", // 14px
                        fontWeight: 200, // ExtraLight
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
                      // --- YAZILAN METİN AYARLARI ---
                      "& .MuiInputBase-input": {
                        color: "white",
                        paddingLeft: "10px",
                        fontSize: "14px", // 14px
                        fontWeight: 200, // ExtraLight
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
                      "& .MuiInputBase-input:-webkit-autofill": {
                        transition: "background-color 5000s ease-in-out 0s",
                        "-webkit-text-fill-color": "white !important",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ marginRight: 0 }}
                        >
                          <LockOutlined
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            {showPassword ? (
                              <Visibility sx={{ fontSize: "1.2rem" }} />
                            ) : (
                              <VisibilityOff sx={{ fontSize: "1.2rem" }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* CHECKBOX VE LINKLER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <FormControlLabel
                      // Checkbox'ı sol hizaya çekmek için negatif margin
                      sx={{ marginLeft: "-4px" }}
                      control={
                        <Checkbox
                          size="small"
                          sx={{
                            color: "rgb(255, 255, 255)", // Pasifken hafif şeffaf
                            "&.Mui-checked": { color: "white" }, // Seçilince tam beyaz
                            padding: "4px", // Kutuyu yazıya yaklaştırmak için
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            color: "rgb(255, 255, 255)", // Pasifken hafif şeffaf

                            // --- BENİ HATIRLA AYARLARI ---
                            fontSize: "13px", // 13px
                            fontWeight: 200, // ExtraLight
                            // -----------------------------
                          }}
                        >
                          {t("rememberMe")}
                        </Typography>
                      }
                    />

                    <Link
                      href="/forgotPassword"
                      style={{
                        color: "white",
                        textDecoration: "none",
                        // --- ŞİFREMİ UNUTTUM AYARLARI ---
                        fontSize: "12px", // 12px
                        fontWeight: 600, // SemiBold
                        fontStyle: "italic", // Italic
                        // --------------------------------
                      }}
                    >
                      {t("forgotPasswordLink")}
                    </Link>
                  </Box>

                  {/* BUTON */}
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

                      // --- İSTEDİĞİN FONT AYARLARI ---
                      fontSize: "16px", // 16px
                      fontWeight: 400, // Regular
                      textTransform: "none", // İsteğe bağlı: Harfleri büyütmez
                      // -------------------------------

                      "&:hover": {
                        background:
                          "linear-gradient(90deg, #687ede 0%, #451c61 100%)",
                      },
                    }}
                  >
                    {t("loginButton")}
                  </Button>
                </Box>
              ) : (
                /* --- REGISTER (KAYIT OL) KISMI --- */
                <Box
                  component="form"
                  onSubmit={handleCreateAccount}
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  {/* --- REGISTER: EMAIL INPUT --- */}
                  <TextField
                    fullWidth
                    name="email"
                    label={t("emailLabel")}
                    variant="standard"
                    // --- LOGIN KISMINDAKİ STİLİN AYNISI ---
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
                      "& .MuiInputBase-input:-webkit-autofill": {
                        transition: "background-color 5000s ease-in-out 0s",
                        "-webkit-text-fill-color": "white !important",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ marginRight: 0 }}
                        >
                          <EmailOutlined
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* --- REGISTER: NAME INPUT --- */}
                  <TextField
                    fullWidth
                    name="Name"
                    label={t("name")}
                    variant="standard"
                    // --- LOGIN KISMINDAKİ STİLİN AYNISI ---
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
                      "& .MuiInputBase-input:-webkit-autofill": {
                        transition: "background-color 5000s ease-in-out 0s",
                        "-webkit-text-fill-color": "white !important",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ marginRight: 0 }}
                        >
                          <BadgeOutlined
                            sx={{ color: "white", fontSize: "1.2rem" }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* --- REGISTER: PHONE INPUT --- */}
                  <Box
                    sx={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
                      "&:hover": { borderBottomColor: "white" },
                      transition: "border-bottom-color 0.2s",
                    }}
                  >
                    <PhoneInput
                      country="tr"
                      value={phoneValue}
                      onChange={(value) => setPhoneValue(value)}
                      containerClass="login-phone-override"
                      inputProps={{ name: "PhoneNumber", required: true }}
                      // 1. Konteyner Stili
                      containerStyle={{
                        width: "100%",
                        margin: 0,
                        border: "none",
                      }}
                      // 2. Input Alanı Stili (Poppins ve İnce Font Eklendi)
                      inputStyle={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        color: "white",

                        // --- FONT AYARLARI BURADA ---
                        fontFamily: poppins.style.fontFamily, // Poppins fontunu uygula
                        fontSize: "14px", // Diğer inputlarla aynı boyut
                        fontWeight: "200", // ExtraLight (İnce) görünüm
                        // ----------------------------
                      }}
                      // 3. Buton (Bayrak) Stili
                      buttonStyle={{
                        border: "none",
                        background: "transparent",
                      }}
                      // 4. Açılan Liste Stili (Poppins Eklendi)
                      dropdownStyle={{
                        // Renkleri CSS'ten yönetiyoruz ama fontu buradan garantiye alalım
                        fontFamily: poppins.style.fontFamily,
                        color: "#333",
                        borderRadius: "12px",
                        width: "300px",
                      }}
                    />
                  </Box>
                  {/* --- REGISTER BUTTON --- */}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 2,
                      py: 1.5,
                      // --- LOGIN BUTONUNUN AYNISI ---
                      background:
                        "linear-gradient(90deg, #451c61 0%, #687ede 100%)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(103, 58, 183, 0.4)",
                      fontSize: "16px",
                      fontWeight: 400,
                      textTransform: "none",
                      // -----------------------------
                      "&:hover": {
                        background:
                          "linear-gradient(90deg, #687ede 0%, #451c61 100%)",
                      },
                    }}
                  >
                    {t("registerButton")}
                  </Button>
                </Box>
              )}
            </Box>
          </Container>

          {/* FOOTER */}
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
            {/* Telif Hakkı Yazısı */}
            <Typography
              sx={{
                color: "rgb(255, 255, 255)",
                fontSize: "14px", // 14px
                fontWeight: 200, // ExtraLight
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
                        flexDirection: "column", // Alt alta dizilim
                        alignItems: "center",
                        opacity: isActive ? 1 : 0.5, // Seçili değilse soluk olsun
                        transition: "all 0.2s",
                        "&:hover": {
                          opacity: 1, // Üzerine gelince parlasın
                          transform: "scale(1.1)", // Hafif büyüsün
                        },
                      }}
                    >
                      {/* Bayrak Resmi */}
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
                      {/* Dil İsmi */}
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
              {/* --- DİL SEÇİCİ BİTİŞ --- */}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
