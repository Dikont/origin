"use client";

import {
  alpha,
  Box,
  Button,
  CardContent,
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
import { CustomBannerCard } from "@/ui/Card/CustomCard";

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
          "success",
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
      <Box>
        <CustomBannerCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: alpha("#fff", 1),
                  fontWeight: 900,
                  fontSize: { xs: 18, sm: 22 },
                }}
              >
                {t("hero_title")}
              </Typography>
              <Typography
                sx={{
                  color: alpha("#fff", 0.82),
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {t("hero_subtitle")}
              </Typography>
            </Box>
            <Box
              component="img"
              src="/aiBanner.svg"
              alt="Sözleşme Listesi"
              sx={{
                width: { xs: 70, sm: 90 },
                height: "auto",
                flexShrink: 0, // sıkışmasın diye önemli
              }}
            />
          </CardContent>
        </CustomBannerCard>
      </Box>

      <Box>
        <Grid container spacing={2} sx={{ my: 2 }}>
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
              <Typography
                mb={2}
                sx={{
                  fontWeight: 600,
                  fontSize: 20,
                }}
              >
                {t("upload_title")}
              </Typography>

              <Box
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={!file ? onChoose : undefined}
                sx={{
                  border: "4px dashed #646E9F",
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
                      sx={{ fontSize: 40, color: "#646E9F", mb: 1 }}
                    />
                    <Typography fontWeight="600">
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
                        border: "1px solid #646E9F",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: "999px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ fontSize: 16, color: "#646E9F" }}
                      />
                      {t("upload_badge_uploaded")}
                    </Box>

                    {/* Dosya bilgisi */}
                    <Box sx={{ textAlign: "center" }}>
                      <InsertDriveFileIcon
                        sx={{ fontSize: 48, color: "#646E9F", mb: 1 }}
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
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {t("upload_change")}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{
                            fontWeight: 600,
                          }}
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
                height: { xs: "100%", md: "100%" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box display={"flex"} justifyContent={"space-between"}>
                <Typography
                  mb={2}
                  sx={{
                    fontWeight: 600,
                    fontSize: 20,
                  }}
                >
                  {t("instructions_title")}
                </Typography>
                <Typography
                  mb={2}
                  sx={{
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
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
                      borderColor: "#646E9F",
                      borderWidth: 2,
                    },
                  },
                }}
              />

              <Button
                fullWidth
                disabled={!canAnalyze}
                startIcon={loading ? undefined : <LockIcon />}
                sx={{
                  mt: 2,
                  py: 1,
                  borderRadius: "6px",
                  color: "#fff",
                  fontWeight: 600,
                  border: 1,
                  background:
                    "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
                  },
                  "&.Mui-disabled": {
                    background:
                      "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                    color: "#e5e7eb",
                    borderColor: "#9ca3af",
                    boxShadow: "none",
                    cursor: "not-allowed",
                  },
                }}
                onClick={analyze}
              >
                {loading ? t("analyzing") : t("analyze")}
              </Button>
            </Paper>
          </Grid>
        </Grid>
        {result && <AnalysisResult markdown={result} t={t} />}
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
    <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background:
              "linear-gradient(135deg, rgba(100,110,159,0.10), rgba(1,86,167,0.06))",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Chip
            icon={<ArrowRightAltRoundedIcon />}
            label={t("chip_suggestions")}
            variant="filled"
            sx={{
              fontWeight: 800,
              borderRadius: 999,
              bgcolor: "rgba(1,86,167,0.10)",
              color: "primary.dark",
              "& .MuiChip-icon": { color: "primary.dark" },
            }}
          />

          <Box sx={{ flex: 1 }} />

          <Chip
            label={t("analyze")}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              borderRadius: 999,
              bgcolor: "rgba(0,0,0,0.02)",
            }}
          />
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <Typography
                  variant="h5"
                  fontWeight={900}
                  gutterBottom
                  sx={{ letterSpacing: -0.3, color: "text.primary" }}
                >
                  {children}
                </Typography>
              ),
              h2: ({ children }) => (
                <Typography
                  variant="h6"
                  fontWeight={900}
                  gutterBottom
                  sx={{ mt: 2.5, color: "text.primary" }}
                >
                  {children}
                </Typography>
              ),
              h3: ({ children }) => (
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  gutterBottom
                  sx={{ mt: 2, color: "text.primary" }}
                >
                  {children}
                </Typography>
              ),
              p: ({ children }) => (
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1.25,
                    color: "text.secondary",
                    lineHeight: 1.75,
                  }}
                >
                  {children}
                </Typography>
              ),
              strong: ({ children }) => (
                <Box
                  component="span"
                  sx={{
                    fontWeight: 900,
                    color: "text.primary",
                  }}
                >
                  {children}
                </Box>
              ),

              // Modern list cards
              ul: ({ children }) => (
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    mt: 1,
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
                    mt: 1,
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
              li: ({ children }) => (
                <Box
                  component="li"
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "rgba(100,110,159,0.06)",
                    border: "1px solid rgba(100,110,159,0.18)",
                    transition: "transform .12s ease, background .12s ease",
                    "&:hover": {
                      bgcolor: "rgba(1,86,167,0.06)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 18, color: "success.main", mt: "2px" }}
                  />
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ color: "text.primary", lineHeight: 1.65 }}
                  >
                    {children}
                  </Typography>
                </Box>
              ),

              hr: () => <Divider sx={{ my: 2.5 }} />,

              code: ({ children }) => (
                <Box
                  component="code"
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.06)",
                    color: "primary.dark",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "0.85rem",
                  }}
                >
                  {children}
                </Box>
              ),

              // Blockquote (varsa AI bazen kullanır)
              blockquote: ({ children }) => (
                <Box
                  sx={{
                    my: 2,
                    px: 2,
                    py: 1.25,
                    borderLeft: "4px solid",
                    borderLeftColor: "primary.main",
                    bgcolor: "rgba(1,86,167,0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.7 }}
                  >
                    {children}
                  </Typography>
                </Box>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
        </Box>
      </Paper>
    </Grid>
  );
}
