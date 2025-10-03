"use client";

import {
  AppBar,
  Backdrop,
  CircularProgress,
  Container,
  IconButton,
  Link,
  Paper,
  Toolbar,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import CheckSignature from "@/component/checkSignature";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useDispatch } from "react-redux";
import { setSignerData } from "@/store/slices/signerSlice";
import { useTranslations } from "next-intl";

export default function Index() {
  const t = useTranslations("checkSignature");
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const documentId = searchParams.get("documentId");
  const docGroupId = searchParams.get("docGroupId");
  const [signerInformation, setSignerInformation] = useState({}) as any;
  const [otpCode, setOtpCode] = useState(null) as any;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSms, setIsSms] = useState("false");
  const router = useRouter();

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
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      setSignerInformation({
        signerMail: values.email,
        documentGroupId: docGroupId,
        documentId: documentId,
        userName: values.username,
      });
      if (res.ok && !data.error) {
        if (isSms === "true") {
          showSnackbar(t("smsSentEnterCode"), "success");
        } else {
          showSnackbar(t("emailSentEnterCode"), "success");
        }
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

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}
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
            {step === 0 && (
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
                  <>
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
                      display={"flex"}
                      justifyContent={"space-between"}
                      gap={"20px"}
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
                  </>
                </form>
              </Paper>
            )}
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
                <Typography
                  variant="h4"
                  gutterBottom
                  textAlign="center"
                  mb="12px"
                >
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
                  <>
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
                  </>
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
