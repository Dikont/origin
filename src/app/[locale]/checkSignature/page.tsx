"use client";

import { Backdrop, CircularProgress, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CheckSignature from "@/component/checkSignature";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useDispatch } from "react-redux";
import { setSignerData } from "@/store/slices/signerSlice";
import { useTranslations } from "next-intl";

const inputSx = {
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#345c7f",
    borderRadius: "20px",

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.7)",
    },
    "&:hover fieldset": {
      borderColor: "#ffffff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ffffff",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #345c7f inset",
      WebkitTextFillColor: "white",
      caretColor: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(180,200,215,0.75)",
    fontWeight: 600,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fff",
  },
  "& input": {
    color: "#fff",
  },
};

const inputFormSx = {
  mb: 2.5,
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#345c7f",
    borderRadius: "20px",

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.7)",
    },
    "&:hover fieldset": {
      borderColor: "#ffffff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ffffff",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #345c7f inset",
      WebkitTextFillColor: "white",
      caretColor: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(180,200,215,0.75)",
    fontWeight: 600,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fff",
  },
  "& input": {
    color: "#fff",
  },
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
  "& input[type=number]::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "& input[type=number]::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
};

type LangCode = "tr" | "en" | "nl";
type Lang = { code: LangCode; label: string; flag?: string };

export default function Index() {
  const t = useTranslations("checkSignature");
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const pathname = usePathname();
  const router = useRouter();

  const documentId = searchParams.get("documentId");
  const docGroupId = searchParams.get("docGroupId"); // TODO: Bunu kullancam

  const [signerInformation, setSignerInformation] = useState({}) as any;
  const [otpCode, setOtpCode] = useState(null) as any;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSms, setIsSms] = useState("false");

  // Statsu kotrolü ile sözleşme reddedildi mi reddedimedi mi (0 ise Reddedildi)
  const [contractStatus, setContractStatus] = useState<null | number>(null);
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  const [rejectedBy, setRejectedBy] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const languageOptions: Lang[] = useMemo(
    () => [
      { code: "tr", label: "TR", flag: "/login/tr1.png" },
      { code: "en", label: "EN", flag: "/login/en2.png" },
      { code: "nl", label: "NL", flag: "/login/nl3.png" },
    ],
    [],
  );

  const currentLocale = (pathname?.split("/")?.[1] as LangCode) || "tr";

  const changeLanguage = (lng: LangCode) => {
    // /tr/xxx -> /en/xxx
    const segments = pathname.split("/");
    segments[1] = lng;
    const newPath = segments.join("/");

    const qs = searchParams.toString();
    router.push(qs ? `${newPath}?${qs}` : newPath);
  };

  // Sözleşme status kontrolü 0 ise reddedilmiş oluyor
  useEffect(() => {
    if (!docGroupId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/public/getDocumentGroupStatus?docGroupId=${docGroupId}`,
        );

        if (!res.ok) {
          console.error("Status API error:", res.status);
          return;
        }

        const data = await res.json();

        setRejectedBy(data.rejectedByName ?? null);
        setDocumentName(data.documentGroupName ?? null);
        setContractStatus(data.status);
        setIsCompleted(data.isCompleted);
      } catch (error) {
        console.error("fetchStatus:", error);
      }
    };

    fetchStatus();
  }, [docGroupId]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const target = e.nativeEvent as SubmitEvent;
    const button = target.submitter as HTMLButtonElement;
    const isSms = button.value === "sms" ? "true" : "false";
    setIsSms(isSms);

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    const cleanEmail = values.email.toString().trim().toLowerCase();
    try {
      const res = await fetch(`/api/checkSignature`, {
        method: "POST",
        body: JSON.stringify({
          mail: cleanEmail,
          userName: values.username,
          DocumentId: documentId,
          isSms: isSms,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      setSignerInformation({
        signerMail: values.email,
        documentGroupId: docGroupId,
        documentId: documentId,
        userName: values.username,
      });

      if (res.ok && !data.error) {
        showSnackbar(
          isSms === "true" ? t("smsSentEnterCode") : t("emailSentEnterCode"),
          "success",
        );
        setStep(1);
      } else {
        showSnackbar(data.error || t("signatureCheckFailed"), "error");
      }
    } catch (err) {
      console.error("CheckSignature hata:", err);
      showSnackbar(t("unexpectedError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    setOtpCode(Number(values.code));

    const res = await fetch("/api/getPagesForSigner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentGroup: signerInformation?.documentGroupId,
        signerMail: signerInformation?.signerMail,
        signerCode: values.code,
        documentId: signerInformation?.documentId,
      }),
    });

    const data = await res.json();

    if (!data.error) {
      dispatch(
        setSignerData({ docs: data.docs, vw_SignerTabs: data.vw_SignerTabs }),
      );
      setStep(2);
    } else {
      showSnackbar(data.error || t("signatureCheckFailed"), "error");
    }
  };

  const step0View =
    contractStatus === 0
      ? "rejected"
      : isCompleted === true
        ? "completed"
        : "form";

  const year = new Date().getFullYear();

  if (contractStatus === null) {
    return (
      <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
        <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
      </Backdrop>
    );
  }

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}

      {/* ---- FIXED HEADER WITH CENTERED CONTENT ---- */}
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 20,
          left: 0,
          width: "100%",
          height: "64px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            px: { xs: 1.5, md: "32px" }, // xs biraz küçülsün
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src="/Dikont-Logo-Beyaz.svg"
            alt="Dikont"
            sx={{
              width: { xs: 110, sm: 130 },
              height: 34,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          {/* Dil: sm+ butonlar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {languageOptions.map((lang) => {
              const isActive = lang.code === currentLocale;
              return (
                <Button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  disableRipple
                  variant="text"
                  sx={{
                    minWidth: 0,
                    px: { sm: 2, md: 2.5 },
                    py: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    color: "#fff",
                    opacity: isActive ? 1 : 0.65,
                    backgroundColor: isActive
                      ? "rgba(0,0,0,0.22)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "rgba(0,0,0,0.28)"
                        : "rgba(255,255,255,0.12)",
                      opacity: 1,
                    },
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {lang.flag ? (
                    <Box
                      component="img"
                      src={lang.flag}
                      alt={lang.label}
                      sx={{
                        width: 22,
                        height: 16,
                        borderRadius: "2px",
                        objectFit: "cover",
                        boxShadow: isActive
                          ? "0 0 0 2px rgba(255,255,255,0.7)"
                          : "none",
                      }}
                    />
                  ) : null}

                  <Typography
                    sx={{
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      color: "#fff",
                    }}
                  >
                    {lang.label}
                  </Typography>
                </Button>
              );
            })}
          </Box>
        </Box>
      </Box>
      {/* ---- /HEADER ---- */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        key={step}
        style={{ width: "100%", height: "100vh" }}
      >
        <Box
          width={"100%"}
          height={"100%"}
          sx={{
            backgroundImage: "url('/verification/verificationBg.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            minHeight: "100dvh", // mobilde gerçek viewport
            overflow: "hidden", // sağdaki beyaz taşmayı keser
            backdropFilter: "blur(5px)",
          }}
          position={"relative"}
        >
          <Box
            position={"absolute"}
            top="0"
            width={"100%"}
            height={"100%"}
            zIndex={-1}
          />

          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"100%"}
            zIndex={2}
          >
            {step === 0 &&
              (step0View === "rejected" ? (
                // REDDEDİLMİŞ EKRANI
                <Paper
                  sx={{
                    px: 5,
                    py: 4,
                    mx: "20px",
                    borderRadius: 12,
                    width: "100%",
                    maxWidth: "600px",
                    textAlign: "center",
                    background:
                      "linear-gradient(160deg, #c94444   0%, #8d2222   40%, #8d2222   55%, #c94444   100%)",

                    backdropFilter: "blur(12px)",
                    border: "2px solid rgb(255, 0, 0)",
                  }}
                >
                  <Typography
                    variant="h4"
                    color="error"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    {t("reject_contract")}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    {t("reject_contract_desc", {
                      docName: documentName ?? "---",
                      rejectedBy: rejectedBy ?? "---",
                    })}
                  </Typography>
                </Paper>
              ) : step0View === "completed" ? (
                // TAMAMLANDI EKRANI
                <Paper
                  sx={{
                    px: 5,
                    py: 4,
                    mx: "20px",
                    borderRadius: 12,
                    width: "100%",
                    maxWidth: "600px",
                    textAlign: "center",
                    background:
                      "linear-gradient(160deg, #2e7d32    0%, #1b5e20    40%, #1b5e20    55%, #2e7d32    100%)",

                    backdropFilter: "blur(12px)",
                    border: "2px solid rgb(13, 255, 4)",
                  }}
                >
                  <Typography
                    variant="h4"
                    color="error"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    {t("completed_contract")}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    {t("completed_contract_desc")}
                  </Typography>
                </Paper>
              ) : (
                // NORMAL FORM (status 1)
                <Paper
                  sx={{
                    px: 5,
                    py: 4,
                    mx: "20px",
                    borderRadius: 12,
                    width: "100%",
                    maxWidth: "600px",
                    background:
                      "linear-gradient(160deg, #027395 0%, #00315d 40%, #00315d 55%, #027395 100%)",

                    backdropFilter: "blur(12px)",
                    border: "2px solid rgb(4, 153, 199)",
                  }}
                >
                  <Typography
                    variant="h4"
                    textAlign="center"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    {t("signatureVerification")}
                  </Typography>

                  <form onSubmit={handleLogin}>
                    <TextField
                      fullWidth
                      label={t("username")}
                      variant="outlined"
                      name="username"
                      sx={inputSx}
                    />

                    <TextField
                      fullWidth
                      label={t("email")}
                      autoCapitalize="none"
                      variant="outlined"
                      name="email"
                      sx={inputSx}
                    />

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      gap="20px"
                    >
                      {/* YEŞİL */}
                      <Button
                        fullWidth
                        type="submit"
                        value="email"
                        sx={{
                          py: 1.4,
                          borderRadius: "16px",
                          color: "#fff",
                          fontWeight: 600,
                          textTransform: "none",
                          border: 1,
                          background:
                            "linear-gradient(135deg, #025f4d 0%, #01775f 100%)",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #01775f 0%, #025f4d 100%)",
                          },
                        }}
                      >
                        {t("sendEmail")}
                      </Button>

                      {/* MAVİ */}
                      <Button
                        fullWidth
                        type="submit"
                        value="sms"
                        sx={{
                          py: 1.4,
                          borderRadius: "16px",
                          color: "#fff",
                          fontWeight: 600,
                          textTransform: "none",
                          border: 1,
                          background:
                            "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
                          },
                        }}
                      >
                        {t("sendSms")}
                      </Button>
                    </Box>
                  </form>
                </Paper>
              ))}

            {step === 1 && (
              <Paper
                sx={{
                  px: 5,
                  py: 4,
                  mx: "20px",
                  borderRadius: 12,
                  width: "100%",
                  maxWidth: "600px",
                  background:
                    "linear-gradient(160deg, #027395 0%, #00315d 40%, #00315d 55%, #027395 100%)",

                  backdropFilter: "blur(12px)",
                  border: "2px solid rgb(4, 153, 199)",
                }}
              >
                <Typography
                  variant="h4"
                  textAlign="center"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {t("codeVerification")}
                </Typography>

                <Typography
                  mb={3}
                  textAlign={"center"}
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    mb: 3,
                    fontSize: 14,
                  }}
                >
                  {isSms === "true" ? t("enterPhoneCode") : t("enterEmailCode")}
                </Typography>

                <form onSubmit={handleOtpCode}>
                  <TextField
                    fullWidth
                    label={t("verificationCode")}
                    variant="outlined"
                    name="code"
                    sx={inputFormSx}
                    type="number"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.value.length > 6) {
                        e.target.value = e.target.value.slice(0, 6);
                      }
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    sx={{
                      py: 1.4,
                      borderRadius: "16px",
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      border: 1,
                      background:
                        "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
                      },
                    }}
                  >
                    {t("submit")}
                  </Button>
                </form>
              </Paper>
            )}

            {step === 2 && (
              <CheckSignature
                otpCode={otpCode}
                signerInformation={signerInformation}
              />
            )}
          </Box>

          {/* Ağaç Resmi Alt Ortada */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 64, md: 0 }, // footer yazılara yer aç
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.6,
              pointerEvents: "none",
            }}
          >
            <Box
              component="img"
              src="/verification/verificationTree.png"
              alt=""
              sx={{
                width: { xs: 350, sm: 420, md: 500 }, // ✅ mobilde ekranı aşmaz
                maxWidth: 500,
                height: "auto",
                display: "block",
              }}
            />
          </Box>
          {/* Sol Alttaki Yazı */}
          <Box
            sx={{
              position: "absolute",
              bottom: 24,
              left: { xs: "50%", md: 24 },
              transform: { xs: "translateX(-50%)", md: "none" },
              fontSize: { xs: 12, md: 14 },
              color: "#7186a1",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {t("copyright", { year })}
          </Box>
          {/* Sağ Alttaki Yazı */}
          <Box
            sx={{
              position: "absolute",
              bottom: 24,
              right: 24,
              fontSize: 14,
              color: "#7186a1",
              textAlign: "right",
              pointerEvents: "none",
              display: { xs: "none", md: "block" }, // ✅ mobilde kapat
            }}
          >
            {t("companyName")}
          </Box>
        </Box>
      </motion.div>
    </>
  );
}
