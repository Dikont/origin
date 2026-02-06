"use client";
import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Backdrop,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CustomBannerCard } from "@/ui/Card/CustomCard";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";
// -------------------------------------
// Hazır PDF'ler (public/pdf altında) – başlıklar i18n key olarak
// -------------------------------------

type TemplateItem = {
  documentGroupId: number;
  documentGroupName?: string | null;
  documentGroupDesc?: string | null;
  documentS3Path?: string | null; // base64 (png/jpg/pdf) ya da data:… olabilir
};

// --- helpers ---
const hasDataPrefix = (s?: string | null) => !!s && s.startsWith("data:");
const looksLikePNG = (s: string) => s.startsWith("iVBORw0"); // PNG
const looksLikeJPG = (s: string) => s.startsWith("/9j/"); // JPEG
const looksLikePDF = (s: string) => s.startsWith("JVBERi0"); // PDF

function toDataUrl(base64?: string | null) {
  if (!base64) return "";
  if (hasDataPrefix(base64)) return base64;

  if (looksLikePNG(base64)) return `data:image/png;base64,${base64}`;
  if (looksLikeJPG(base64)) return `data:image/jpeg;base64,${base64}`;
  if (looksLikePDF(base64)) return `data:application/pdf;base64,${base64}`;

  // bilinmiyorsa varsayılanı png dene
  return `data:image/png;base64,${base64}`;
}

function isPdf(base64?: string | null) {
  if (!base64) return false;
  if (hasDataPrefix(base64)) return base64.includes("application/pdf");
  return looksLikePDF(base64);
}

export default function Template({ user }: { user: string | null }) {
  const t = useTranslations("template");
  const router = useRouter();
  const [data, setData] = useState<TemplateItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [previewIsPdf, setPreviewIsPdf] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const res = await fetch("/api/getTemplates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: user }),
    });
    const json = await res.json();
    setData(json);
    setLoading(false);
  };
  const openPreview = (item: TemplateItem) => {
    const src = toDataUrl(item.documentS3Path || "");
    setPreviewSrc(src);
    setPreviewIsPdf(isPdf(item.documentS3Path));
    setPreviewOpen(true);
  };
  const askDelete = (docGId: string | number | null | undefined) => {
    if (docGId === null || docGId === undefined) return;
    setPendingId(docGId);
    setConfirmOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const confirmDelete = async () => {
    if (pendingId === null || pendingId === undefined) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/deleteDocumentTemplate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docGId: Number(pendingId) }),
      });

      const json = await res.json();
      if (!res.ok || json?.error) {
        console.error("Silme hatası:", json);
      } else {
        setData((prev: any[]) =>
          prev.filter(
            (x: any) => String(x.documentGroupId) !== String(pendingId),
          ),
        );
      }
    } catch (e) {
      console.error("Silme istisnası:", e);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingId(null);
    }
  };
  const openEditor = (item: string) => {
    router.push({ pathname: `/createContract?template=${item}` });
  };

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}
      <CustomBannerCard>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 900,
            }}
          >
            {t("readyDraftsTitle")}
          </Typography>
        </CardContent>
      </CustomBannerCard>
      <Divider sx={{ mt: 3, mb: 3, color: "#646E9F", border: 1 }} />
      <Grid container spacing={2}>
        {data?.map((item: any, key) => {
          const imgSrc = toDataUrl(item.documentS3Path || "");
          const showAsImage = !!imgSrc && !isPdf(item.documentS3Path);

          return (
            <Grid key={key} size={{ xs: 12, md: 6, lg: 3 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid #646E9F",
                  borderRadius: 3,
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)",
                  transition: "transform .22s ease, box-shadow .22s ease",
                  "&:hover": {
                    boxShadow:
                      "0 14px 34px rgba(0,0,0,.12), 0 6px 14px rgba(0,0,0,.08)",
                    borderColor: "rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      pt: "62.5%", // 16:10
                      overflow: "hidden",
                      bgcolor: "#f5f7fb",
                    }}
                  >
                    {showAsImage ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={item.documentGroupName || "template preview"}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scale(1)",
                          transition: "transform .25s ease",
                          ".MuiCard-root:hover &": { transform: "scale(1.03)" },
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f5f5f5",
                          fontSize: 14,
                          color: "text.secondary",
                          transform: "scale(1)",
                          transition: "transform .25s ease",
                          ".MuiCard-root:hover &": { transform: "scale(1.02)" },
                        }}
                      >
                        {imgSrc ? t("pdfPreviewText") : t("noPreview")}
                      </Box>
                    )}

                    <Chip
                      size="small"
                      label={t("pdfLabel")}
                      icon={<DescriptionIcon fontSize="small" />}
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        bgcolor: "rgba(255,255,255,.92)",
                        border: "1px solid rgba(0,0,0,0.08)",
                        backdropFilter: "blur(6px)",
                        "& .MuiChip-icon": { color: "text.secondary" },
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(0,0,0,.35)",
                        opacity: 0,
                        transition: "opacity .25s ease",
                        cursor: "pointer",
                        ".MuiCard-root:hover &": { opacity: 1 },
                      }}
                      onClick={() => openPreview(item)}
                    >
                      <Tooltip title={t("preview")}>
                        <IconButton
                          size="large"
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: 3,
                            backgroundColor: "rgba(255,255,255,0.16)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            backdropFilter: "blur(6px)",
                            transition: "all .2s ease",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              backgroundColor: "rgba(255,255,255,0.22)",
                            },
                          }}
                        >
                          <VisibilityIcon
                            sx={{ color: "#fff" }}
                            fontSize="large"
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ pb: 1.2 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={900}
                    noWrap
                    sx={{ color: "#111827" }}
                  >
                    {item.documentGroupName || "-"}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ mt: 0.2 }}
                  >
                    {item.documentGroupDesc || ""}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.2,
                  }}
                >
                  {/* SOL: ikonlar */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* GÖR */}
                    <Tooltip title={t("preview")}>
                      <IconButton
                        onClick={() => openPreview(item)}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          backgroundColor: "rgba(2, 136, 209, 0.10)", // mavi açık
                          border: "1px solid rgba(2, 136, 209, 0.18)",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(2, 136, 209, 0.16)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <VisibilityIcon sx={{ color: "#0288d1" }} />
                      </IconButton>
                    </Tooltip>

                    {/* SİL */}
                    <Tooltip title={t("delete")}>
                      <IconButton
                        onClick={() => askDelete(item.documentGroupId)}
                        disabled={
                          deleting && pendingId === item.documentGroupId
                        }
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          backgroundColor: "rgba(244, 67, 54, 0.10)", // kırmızı açık
                          border: "1px solid rgba(244, 67, 54, 0.18)",
                          transition: "all .2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(244, 67, 54, 0.16)",
                            transform: "translateY(-1px)",
                          },
                          "&.Mui-disabled": {
                            opacity: 0.6,
                          },
                        }}
                      >
                        {deleting && pendingId === item.documentGroupId ? (
                          <CircularProgress
                            size={20}
                            sx={{ color: "#d32f2f" }}
                          />
                        ) : (
                          <DeleteIcon sx={{ color: "#d32f2f" }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* SAĞ: UYGULA */}
                  <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    onClick={() => openEditor(item.documentGroupId)}
                    sx={{
                      py: 1.05,
                      px: 2.2,
                      borderRadius: 2,
                      fontWeight: 900,
                      textTransform: "none",
                      color: "#fff",
                      background:
                        "linear-gradient(135deg, #025f19 0%, #02a84f 100%)",
                      boxShadow: "0 10px 22px rgba(2, 168, 79, 0.22)",
                      transition: "all .2s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 14px 28px rgba(2, 168, 79, 0.32)",
                        background:
                          "linear-gradient(135deg, #02a84f 0%, #025f19 100%)",
                      },
                    }}
                  >
                    {t("applyButton")}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {/* GÖRÜNTÜLEME MODALI */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 0 }}>
          {previewIsPdf ? null : (
            <Box
              borderRadius={"8px"}
              boxShadow={
                "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.40)"
              }
              p={2}
            >
              <img
                src={previewSrc}
                alt="preview"
                style={{
                  width: "100%",
                  height: "800px",
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      {/* SİLME MODALI */}
      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.14)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.90) 100%)",
            boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: 2.2,
            py: 1.8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            background:
              "linear-gradient(135deg, rgba(244,67,54,0.14) 0%, rgba(244,67,54,0.06) 100%)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(244,67,54,0.25) 0%, rgba(244,67,54,0.12) 100%)",
                border: "1px solid rgba(244,67,54,0.25)",
              }}
            >
              <WarningAmberRoundedIcon sx={{ color: "#d32f2f" }} />
            </Box>

            <DialogTitle
              sx={{
                p: 0,
                fontWeight: 900,
                fontSize: 18,
                color: "#1f2937",
                lineHeight: 1.2,
              }}
            >
              {t("deleteConfirmTitle")}
            </DialogTitle>
          </Box>

          <Button
            onClick={() => !deleting && setConfirmOpen(false)}
            disabled={deleting}
            sx={{
              minWidth: 0,
              width: 34,
              height: 34,
              borderRadius: 2,
              color: "#374151",
              backgroundColor: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.08)",
              transition: "all .2s ease",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.08)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </Button>
        </Box>

        {/* CONTENT */}
        <DialogContent sx={{ px: 2.2, pt: 2, pb: 0 }}>
          <Typography
            sx={{
              color: alpha("#111827", 0.78),
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {t("deleteConfirmText")}
          </Typography>

          <Box
            sx={{
              mt: 1.6,
              p: 1.2,
              borderRadius: 2,
              border: "1px dashed rgba(244,67,54,0.35)",
              backgroundColor: "rgba(244,67,54,0.06)",
            }}
          >
            <Typography
              sx={{ fontSize: 12.5, fontWeight: 700, color: "#b71c1c" }}
            >
              {t("deleteConfirmWarn") /* yoksa bunu kaldır */}
            </Typography>
          </Box>
        </DialogContent>

        {/* ACTIONS */}
        <DialogActions
          sx={{
            px: 2.2,
            py: 2,
            gap: 1.2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setConfirmOpen(false)}
            disabled={deleting}
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 800,
              textTransform: "none",
              color: "#374151",
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.04) 100%)",
              border: "1px solid rgba(0,0,0,0.10)",
              transition: "all .2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
                background:
                  "linear-gradient(135deg, rgba(0,0,0,0.09) 0%, rgba(0,0,0,0.06) 100%)",
              },
            }}
          >
            {t("cancel")}
          </Button>

          <Button
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: "10px",
              fontWeight: 900,
              textTransform: "none",
              color: "#fff",
              background: "linear-gradient(135deg, #c62828 0%, #ef5350 100%)",
              boxShadow: "0 10px 22px rgba(198,40,40,0.28)",
              transition: "all .2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 14px 30px rgba(198,40,40,0.38)",
                background: "linear-gradient(135deg, #ef5350 0%, #c62828 100%)",
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.85)",
                background: "linear-gradient(135deg, #c62828 0%, #ef5350 100%)",
                opacity: 0.55,
              },
            }}
          >
            {deleting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              t("yes")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
