"use client";

import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LockIcon from "@mui/icons-material/Lock";
import { useCallback, useEffect, useRef, useState } from "react";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useSnackbar } from "@/component/SnackbarProvider";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useTranslations } from "next-intl"; // ✅ client için

export default function Index() {
  const t = useTranslations("ai");
  const { showSnackbar } = useSnackbar();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [tokenValue, setTokenValue] = useState(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onChoose = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const canAnalyze = !!file && prompt.trim().length > 0 && !loading;

  const analyze = async () => {
    if (!canAnalyze || !file) return;
    showSnackbar(t("snackbar_creating_dialog"), "info", 20000);
    setLoading(true);
    setResult("");

    try {
      const fd = new FormData();
      if (prompt?.trim()) fd.append("prompt", prompt.trim());
      fd.append("file", file);

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        body: fd,
        cache: "no-store",
      });

      // Cevabı JSON'a çevirmeyi her koşulda dene
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.error ||
          (res.status === 401
            ? t("snackbar_need_auth")
            : res.status === 413
            ? t("snackbar_file_too_large")
            : res.status === 415
            ? t("snackbar_unsupported_type")
            : `${t("snackbar_request_failed")} (${res.status}).`);

        if (
          String(msg).includes("Token Hakkınız Yok") ||
          String(msg).includes("Bitmiş")
        ) {
          showSnackbar(t("snackbar_tokens_none"), "error");
        } else {
          showSnackbar(`${t("error_prefix")}: ${msg}`, "error");
        }

        setResult("");
        return;
      }

      const remaining = data?.remainingTokens;
      if (typeof remaining === "number") {
        showSnackbar(
          t("snackbar_done_with_remaining", { remaining }),
          "success"
        );
      } else {
        showSnackbar(t("snackbar_done"), "success");
      }

      setResult(data?.result ?? t("result_empty"));
    } catch (e: any) {
      const msg = e?.message || String(e);
      showSnackbar(`${t("error_prefix")}: ${msg}`, "error");
      setResult(`${t("error_prefix")}: ${msg}`);
    } finally {
      getTokenCount();
      setLoading(false);
    }
  };
  const getTokenCount = async () => {
    try {
      const res = await fetch("/api/analytics/getTokens", {
        method: "GET",
        cache: "no-store",
      });
      const data = await res.json();
      setTokenValue(data.data.tokens);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    getTokenCount();
  }, []);
  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(90deg, #00b16a 0%, #43e97b 100%)",
          borderRadius: 2,
          p: "20px",
          color: "white",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h1" fontSize="24px" fontWeight="bold">
              {t("hero_title")}
            </Typography>
            <Typography>{t("hero_subtitle")}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                height: { xs: "100%", md: "100%" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography fontWeight="bold" mb={2}>
                {t("upload_title")}
              </Typography>

              <Box
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={!file ? onChoose : undefined}
                sx={{
                  border: "2px dashed #2684FF",
                  borderRadius: "10px",
                  textAlign: "center",
                  py: "20px",
                  color: "#333",
                  cursor: file ? "default" : "pointer",
                  position: "relative",
                  height: "100%",
                }}
              >
                {!file ? (
                  <>
                    <CloudUploadIcon
                      sx={{ fontSize: 40, color: "#2684FF", mb: 1 }}
                    />
                    <Typography fontWeight="500">
                      {t("upload_drop_or_select")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("upload_supported_types")}
                    </Typography>
                  </>
                ) : (
                  <>
                    {/* Üst sağda yüklendi rozeti */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        bgcolor: "rgba(38,132,255,0.08)",
                        border: "1px solid #2684FF33",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: "999px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 16, color: "#2e7d32" }}
                      />
                      {t("upload_badge_uploaded")}
                    </Box>

                    {/* Dosya bilgisi */}
                    <Box sx={{ textAlign: "center" }}>
                      <InsertDriveFileIcon
                        sx={{ fontSize: 48, color: "#2684FF", mb: 1 }}
                      />
                      <Typography fontWeight={600}>{file.name}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={onChoose}
                          startIcon={<CloudUploadIcon />}
                        >
                          {t("upload_change")}
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          color="error"
                          onClick={() => setFile(null)}
                        >
                          {t("upload_remove")}
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  hidden
                  onChange={onFileChange}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                height: { xs: "100%", md: "275px" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box display={"flex"} justifyContent={"space-between"}>
                <Typography fontWeight="bold" mb={2}>
                  {t("instructions_title")}
                </Typography>
                <Typography fontWeight="bold" mb={2}>
                  Token:{tokenValue}
                </Typography>
              </Box>
              <TextField
                multiline
                minRows={5}
                fullWidth
                placeholder={t("instructions_placeholder")}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#2684FF",
                      borderWidth: 2,
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                disabled={!canAnalyze}
                startIcon={loading ? undefined : <LockIcon />}
                sx={{ mt: 2 }}
                onClick={analyze}
              >
                {loading ? t("analyzing") : t("analyze")}
              </Button>
            </Paper>
          </Grid>

          {result && <AnalysisResult markdown={result} t={t} />}
        </Grid>
      </Box>
    </>
  );
}

function AnalysisResult({
  markdown,
  t,
}: {
  markdown: string;
  t: (k: string, p?: any) => string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Üst başlık şeridi */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Chip
          icon={<ArrowRightAltRoundedIcon />}
          label={t("chip_suggestions")}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Divider sx={{ flex: 1 }} />
      </Box>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ color: "primary.main" }}
            >
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mt: 3, color: "primary.dark" }}
            >
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ mt: 2, color: "text.primary" }}
            >
              {children}
            </Typography>
          ),
          p: ({ children }) => (
            <Typography
              variant="body1"
              sx={{ mb: 1.25, color: "text.secondary" }}
            >
              {children}
            </Typography>
          ),
          strong: ({ children }) => (
            <Box
              component="span"
              sx={{
                fontWeight: 700,
                color: "primary.main",
              }}
            >
              {children}
            </Box>
          ),
          ul: ({ children }) => (
            <Box
              component="ul"
              sx={{
                m: 0,
                mb: 2,
                pl: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box
              component="ol"
              sx={{
                m: 0,
                mb: 2,
                pl: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Box
              component="li"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: 2,
                bgcolor: "grey.50",
                transition: "background 0.2s",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <CheckCircleRoundedIcon
                sx={{ fontSize: 18, color: "success.main", mt: "1px" }}
              />
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary" }}
              >
                {children}
              </Typography>
            </Box>
          ),
          hr: () => <Divider sx={{ my: 3 }} />,
          code: ({ children }) => (
            <Box
              component="code"
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "grey.100",
                color: "primary.dark",
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Paper>
  );
}
