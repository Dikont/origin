"use client";

import {
  Backdrop,
  CircularProgress,
  IconButton,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CheckSignature from "@/component/checkSignature";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useDispatch } from "react-redux";
import { setSignerData } from "@/store/slices/signerSlice";
import { useTranslations } from "next-intl";

const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

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

  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(
    null
  );
  // Statsu kotrolü ile sözleşme reddedildi mi reddedimedi mi (0 ise Reddedildi)
  const [contractStatus, setContractStatus] = useState<null | number>(null);
  const [rejectedBy, setRejectedBy] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const changeLanguage = (lng: string) => {
    const segments = pathname.split("/");
    segments[1] = lng;

    const newPath = segments.join("/");
    //dil değiştirdiğinde query parametrelerini koru
    router.push(`${newPath}?${searchParams.toString()}`);

    setLanguageAnchor(null);
  };

  // Sözleşme status kontrolü 0 ise reddedilmiş oluyor
  useEffect(() => {
    if (!docGroupId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${API}/DocumentService/Document/GetDocumentGroupStatus?docGroupId=${docGroupId}`
        );

        const data = await res.json();
        setRejectedBy(data.rejectedByName);
        setDocumentName(data.documentGroupName);
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

    try {
      const res = await fetch(`/api/checkSignature`, {
        method: "POST",
        body: JSON.stringify({
          mail: values.email,
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
          "success"
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
        setSignerData({ docs: data.docs, vw_SignerTabs: data.vw_SignerTabs })
      );
      setStep(2);
    } else {
      showSnackbar(data.error || t("signatureCheckFailed"), "error");
    }
  };

  if (contractStatus === null) {
    return (
      <Backdrop open>
        <CircularProgress />
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
        position="fixed"
        top={0}
        left={0}
        width="100%"
        height="64px"
        bgcolor="#fff"
        zIndex={20}
        display="flex"
        alignItems="center"
        justifyContent="center" // <-- Dikkat: içerik ortalanıyor
      >
        {/* İçteki sınırlı genişlikli kutu */}
        <Box
          width="100%"
          maxWidth="1400px" // <-- Bu genişliği login sayfasıyla aynı yap
          px="32px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Logo */}
          <img
            src="/Dikont-Logo.svg"
            alt="Logo"
            style={{ width: "120px", height: "auto" }}
          />

          {/* Dil */}
          <IconButton onClick={(e) => setLanguageAnchor(e.currentTarget)}>
            <Typography>{pathname.split("/")[1].toUpperCase()}</Typography>
          </IconButton>

          <Menu
            anchorEl={languageAnchor}
            open={Boolean(languageAnchor)}
            onClose={() => setLanguageAnchor(null)}
          >
            {["tr", "en", "nl"].map((lng) => (
              <MenuItem key={lng} onClick={() => changeLanguage(lng)}>
                {lng.toUpperCase()}
              </MenuItem>
            ))}
          </Menu>
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
