import { Box, Stack, Button, IconButton, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";

function PdfSinglePage({
  pdfDoc,
  page,
  onPageChange,
  totalPages,
  selectedDocId,
}: {
  pdfDoc: any;
  page: number;
  onPageChange: (n: number) => void;
  totalPages: number;
  selectedDocId: number | null;
}) {
  const t = useTranslations("followContracts");

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale] = useState(1.0);
  const [fitting] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    const pdfPage = await pdfDoc.getPage(page);

    // container genişliğine göre ölçek (fit-to-width)
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const maxWidth = Math.min(
      wrapRef.current?.clientWidth || baseViewport.width,
      800,
    );
    const fitScale = maxWidth / baseViewport.width;

    const finalScale = fitting ? fitScale : scale;
    const viewport = pdfPage.getViewport({ scale: finalScale });

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
  }, [pdfDoc, page, scale, fitting]);

  useEffect(() => {
    render();
  }, [render]);

  useLayoutEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (fitting) render();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [render, fitting]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPageChange(Math.max(1, page - 1));
      if (e.key === "ArrowRight") onPageChange(Math.min(totalPages, page + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, totalPages, onPageChange]);

  const handleDownload = async () => {
    if (!selectedDocId) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/getDownloadAblePdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docGId: selectedDocId }),
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || t("downloadFailed"));
      }

      // route JSON döndürüyor (düz string veya {result: "..."} olabilir)
      const data = await res.json();
      const b64 =
        typeof data === "string"
          ? data
          : (data?.result ?? data?.pdf ?? data?.data);
      if (!b64) throw new Error(t("noPdfData"));

      const bin = atob(
        b64.indexOf("base64,") >= 0 ? b64.split("base64,")[1] : b64,
      );
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${selectedDocId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box textAlign={"center"}>
      <Button
        variant="contained"
        onClick={handleDownload}
        sx={{
          py: 1,
          px: 2,
          mb: 2,
          width: "200px",
          borderRadius: 2,
          color: "#fff",
          fontWeight: 600,
          textTransform: "none",
          background: "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
          },
        }}
        disabled={downloading}
        startIcon={
          downloading ? (
            <CircularProgress size={18} color="inherit" />
          ) : undefined
        }
      >
        {downloading ? t("downloading") : t("download")}
      </Button>

      <Box
        ref={wrapRef}
        sx={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <Box>
          <canvas
            ref={canvasRef}
            style={{
              borderRadius: 8,
              boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
              width: "100%",
              height: "100%",
              maxHeight: "842px",
              maxWidth: "595px",
            }}
          />
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="center"
        mt={2}
      >
        <IconButton
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography variant="body2">
          {t("pageCounter", { page, total: totalPages })}
        </Typography>

        <IconButton
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRightIcon />
        </IconButton>

        <Box sx={{ mx: 2 }} />
      </Stack>
    </Box>
  );
}

export default PdfSinglePage;
