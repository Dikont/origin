"use client";
import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
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
  Skeleton,
  Chip,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link, useRouter } from "@/i18n/navigation";
import { useDispatch } from "react-redux";
import { setSelectedTemplate } from "@/store/slices/templateSlice";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslations } from "next-intl";

// -------------------------------------
// Hazır PDF'ler (public/pdf altında) – başlıklar i18n key olarak
// -------------------------------------
const READY_PDFS = [
  { key: "termination", url: "/pdf/Fesih Sözleşmesi.pdf" },
  { key: "employment", url: "/pdf/İş Sözleşmesi.pdf" },
  { key: "permission", url: "/pdf/İzin Sözleşmesi.pdf" },
  { key: "lease", url: "/pdf/Kira Sözleşmesi.pdf" },
] as const;

type TemplateItem = {
  id: number;
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
  const dispatch = useDispatch();
  const router = useRouter();
  const [data, setData] = useState<TemplateItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [previewIsPdf, setPreviewIsPdf] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---- pdf.js ile hazır PDF ilk sayfa önizlemeleri ----
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({}); // url -> dataURL
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("pdfjs-dist");
      if (!mounted) return;
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setPdfjs(mod);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!pdfjs) return;

    READY_PDFS.forEach(async (p) => {
      const encoded = encodeURI(p.url);
      try {
        const task = pdfjs.getDocument(encoded);
        const pdf = await task.promise;
        const page = await pdf.getPage(1);
        const unscaled = page.getViewport({ scale: 1 });

        const targetH = 800;
        const scale = targetH / unscaled.height;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataURL = canvas.toDataURL("image/png");
        setThumbs((prev) => ({ ...prev, [p.url]: dataURL }));
      } catch (e) {
        // render edilemezse boş bırak
        console.error("Önizleme üretilemedi:", p.url, e);
      }
    });
  }, [pdfjs]);

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

  // hazır pdf kartından modal aç
  const openReadyPreview = (url: string) => {
    const img = thumbs[url];
    if (img) {
      setPreviewSrc(img);
      setPreviewIsPdf(false);
      setPreviewOpen(true);
    }
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

  // i18n'li hazır pdf listesi
  const readyCards = READY_PDFS.map((p) => ({
    ...p,
    title: t(`ready.${p.key}`),
  }));

  return (
    <>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("readyDraftsTitle")}
      </Typography>

      <Grid container spacing={2}>
        {readyCards.map((p, idx) => {
          const thumb = thumbs[p.url];
          const encodedUrl = encodeURI(p.url);

          return (
            <Grid key={idx} size={{ xs: 12, md: 6, lg: 3 }}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #e9ecef",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform .2s ease, box-shadow .2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.06)",
                  },
                }}
              >
                {/* PREVIEW alanı (sabit 16:10 oran) */}
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      pt: "62.5%", // 16:10
                      overflow: "hidden",
                    }}
                  >
                    {thumb ? (
                      <Box
                        component="img"
                        src={thumb}
                        alt={p.title}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scale(1)",
                          transition: "transform .25s ease",
                          ".MuiCard-root:hover &": { transform: "scale(1.02)" },
                        }}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        sx={{ position: "absolute", inset: 0 }}
                      />
                    )}

                    {/* PDF chip */}
                    <Chip
                      size="small"
                      label={t("pdfLabel")}
                      icon={<DescriptionIcon fontSize="small" />}
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: "rgba(255,255,255,.9)",
                        "& .MuiChip-icon": { color: "text.secondary" },
                      }}
                    />

                    {/* Hover overlay: Ön izleme */}
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
                        cursor: thumb ? "pointer" : "default",
                        ".MuiCard-root:hover &": { opacity: 1 },
                      }}
                      onClick={() => thumb && openReadyPreview(p.url)}
                    >
                      <Tooltip title={t("preview")}>
                        <IconButton size="large">
                          <VisibilityIcon
                            sx={{ color: "#fff" }}
                            fontSize="large"
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* İçerik */}
                <CardContent sx={{ pb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("firstPagePreviewPdf")}
                  </Typography>
                </CardContent>

                {/* Aksiyonlar: yalnızca İndir */}
                <CardActions
                  sx={{ px: 2, pb: 2, pt: 0, justifyContent: "flex-end" }}
                >
                  <Button
                    component="a"
                    href={encodedUrl}
                    download
                    startIcon={<DownloadIcon />}
                    variant="contained"
                    color="primary"
                    sx={{ "&:hover": { bgcolor: "#2e7d32" } }}
                  >
                    {t("download")}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ mt: 5, mb: 3 }} />
      {data.length > 0 && (
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t("uploadedDraftsTitle")}
        </Typography>
      )}

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
                  border: "1px solid #e9ecef",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform .2s ease, box-shadow .2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.06)",
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
                          ".MuiCard-root:hover &": { transform: "scale(1.02)" },
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
                        top: 8,
                        left: 8,
                        bgcolor: "rgba(255,255,255,.9)",
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
                        <IconButton size="large">
                          <VisibilityIcon
                            sx={{ color: "#fff" }}
                            fontSize="large"
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ pb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {item.documentGroupName || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {item.documentGroupDesc || ""}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{ justifyContent: "space-between", px: 2, pb: 2, pt: 0 }}
                >
                  <Box>
                    <IconButton onClick={() => openPreview(item)}>
                      <VisibilityIcon color="primary" />
                    </IconButton>
                    <IconButton
                      onClick={() => askDelete(item.documentGroupId)}
                      disabled={deleting && pendingId === item.documentGroupId}
                    >
                      {deleting && pendingId === item.documentGroupId ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon sx={{ color: "red" }} />
                      )}
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#519b54ff",
                      color: "white",
                      "&:hover": { bgcolor: "#2e7d32" },
                    }}
                    startIcon={<DescriptionIcon />}
                    onClick={() => openEditor(item.documentGroupId)}
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
      >
        <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
        <DialogContent>{t("deleteConfirmText")}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={18} /> : t("yes")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
