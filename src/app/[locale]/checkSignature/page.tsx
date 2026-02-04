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
          top: 0,
          left: 0,
          width: "100%",
          height: "64px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: "none",
          backgroundImage:
            "linear-gradient(90deg,#2C1737 0%,#5C2230 50%,#453562 100%)",
          backgroundSize: "300% 300%",
          animation: "headerGradient 15s ease infinite",
          "@keyframes headerGradient": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
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
            backgroundImage: "url('/login/1.jpg')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backdropFilter: "blur(5px)",
          }}
          position={"relative"}
        >
          <Box
            position={"absolute"}
            top="0"
            width={"100%"}
            height={"100%"}
            sx={{ background: "rgba(0, 0, 0, 0.5)" }}
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
              (contractStatus === 0 ? (
                // REDDEDİLMİŞ EKRANI
                <Paper
                  sx={{
                    p: 4,
                    mx: "20px",
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: "600px",
                    background: "white",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h4" color="error" mb={2}>
                    {t("reject_contract")}
                  </Typography>

                  <Typography variant="body1" color="text.secondary">
                    {t("reject_contract_desc", {
                      docName: documentName ?? "---",
                      rejectedBy: rejectedBy ?? "---",
                    })}
                  </Typography>
                </Paper>
              ) : (
                // NORMAL FORM (status 1)
                <Paper
                  sx={{
                    p: 4,
                    mx: "20px",
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: "600px",
                    background: "white",
                  }}
                >
                  <Typography
                    variant="h4"
                    gutterBottom
                    textAlign="center"
                    mb="28px"
                  >
                    {t("signatureVerification")}
                  </Typography>

                  <form onSubmit={handleLogin}>
                    <TextField
                      fullWidth
                      label={t("username")}
                      variant="outlined"
                      name="username"
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      label={t("email")}
                      autoCapitalize="none"
                      variant="outlined"
                      name="email"
                      sx={{ mb: 4 }}
                    />

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      gap="20px"
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        color="success"
                        value="email"
                      >
                        {t("sendEmail")}
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        value="sms"
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
                  p: 4,
                  borderRadius: 4,
                  width: "100%",
                  maxWidth: "600px",
                  mx: "20px",
                  background: "white",
                }}
              >
                <Typography variant="h4" textAlign="center" mb="12px">
                  {t("codeVerification")}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                  textAlign={"center"}
                >
                  {isSms === "true" ? t("enterPhoneCode") : t("enterEmailCode")}
                </Typography>

                <form onSubmit={handleOtpCode}>
                  <TextField
                    fullWidth
                    label={t("verificationCode")}
                    variant="outlined"
                    name="code"
                    sx={{ mb: 4 }}
                    type="number"
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.value.length > 6) {
                        e.target.value = e.target.value.slice(0, 6);
                      }
                    }}
                  />

                  <Button fullWidth variant="contained" type="submit">
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
        </Box>
      </motion.div>
    </>
  );
}
