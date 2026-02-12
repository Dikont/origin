"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useSnackbar } from "@/component/SnackbarProvider";

type LangCode = "tr" | "en" | "nl";
type Lang = { code: LangCode; label: string; flag?: string };

export default function PublicPdfViewer({ docId }: { docId: string }) {
  const t = useTranslations("uploadedDocument");
  const { showSnackbar } = useSnackbar();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    const segments = pathname.split("/");
    segments[1] = lng;
    const newPath = segments.join("/");
    const qs = searchParams.toString();
    router.push(qs ? `${newPath}?${qs}` : newPath);
  };

  // --- PDF state ---
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const [pdfBase64Raw, setPdfBase64Raw] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function base64ToUint8Array(b64: string) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function normalizePdfBase64(s: string) {
    const i = s.indexOf("base64,");
    return i !== -1 ? s.slice(i + 7) : s.trim();
  }

  async function renderPage(doc: any, num: number) {
    const canvas = canvasRef.current;
    if (!canvas || !doc) return;

    const page = await doc.getPage(num);

    // ekranı aşmasın diye ölçek
    const unscaled = page.getViewport({ scale: 1 });
    const maxWidth = Math.min(900, window.innerWidth - 32);
    const scale = Math.min(1.6, maxWidth / unscaled.width);

    const viewport = page.getViewport({ scale });
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  // --- PDF'i çek ---
  useEffect(() => {
    let alive = true;

    const loadPdf = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/public/getDownLoadAblePdfBIM?docGId=${docId}`,
          {
            cache: "no-store",
          },
        );

        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error("Public PDF api başarısız");

        const raw =
          typeof json?.data === "string"
            ? json.data
            : (json?.data?.data ?? json?.data?.result ?? "");

        const cleaned = normalizePdfBase64(String(raw || ""));
        if (!cleaned) throw new Error("PDF base64 boş geldi");

        // @ts-ignore
        const pdfjs = await import("pdfjs-dist/build/pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const doc = await pdfjs.getDocument({
          data: base64ToUint8Array(cleaned),
        }).promise;

        if (!alive) return;

        setPdfBase64Raw(cleaned);
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPageNum(1);

        // ✅ render'i state setten sonra değil direkt doc ile yap
        requestAnimationFrame(() => {
          if (alive) renderPage(doc, 1);
        });
      } catch (e) {
        console.error(e);
        if (alive) {
          setPdfBase64Raw("");
          setPdfDoc(null);
          setTotalPages(1);
          setPageNum(1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadPdf();
    return () => {
      alive = false;
    };
  }, [docId]);

  // sayfa değişince çiz
  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(pdfDoc, pageNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pdfDoc]);

  const downloadPdf = () => {
    if (!pdfBase64Raw) {
      showSnackbar(t("download.error"), "error", 4000);
      return;
    }

    try {
      const bytes = base64ToUint8Array(pdfBase64Raw);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${docId}.pdf`;
      a.click();

      URL.revokeObjectURL(url);

      // 3 saniye sonra otomatik kapanır
      showSnackbar(t("download.success"), "success", 3000);
    } catch (e) {
      showSnackbar(t("download.error"), "error", 4000);
    }
  };

  const canPrev = pageNum > 1;
  const canNext = pageNum < totalPages;

  const year = new Date().getFullYear();

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      {/* ---- HEADER aynı ---- */}
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
          pointerEvents: "none", // header tıklanabilir olsun istiyorsan kaldır
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            px: { xs: 1.5, md: "32px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pointerEvents: "auto",
          }}
        >
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                    sx={{ fontWeight: isActive ? 700 : 500, fontSize: 13 }}
                  >
                    {lang.label}
                  </Typography>
                </Button>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ---- BACKGROUND aynı ---- */}
      <Box
        sx={{
          backgroundImage: "url('/verification/verificationBg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          minHeight: "100dvh",
          overflow: "hidden",
          backdropFilter: "blur(5px)",
          position: "relative",
          pt: "110px", // header üstten boşluk
          pb: 8,
        }}
      >
        {loading && (
          <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
            <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
          </Backdrop>
        )}

        {/* ✅ üstte indir butonu (mavi) */}
        <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadPdf}
            disabled={!pdfBase64Raw}
            sx={{
              py: 1,
              px: 4,
              borderRadius: 2,
              color: "#fff",
              fontWeight: 700,
              textTransform: "none",
              border: 1,
              background: "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
              },
            }}
          >
            {t("uploadButton")}
          </Button>
        </Stack>

        {/* ✅ PDF canvas */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            px: { xs: 2, md: 2 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", md: 900 }, // desktop’ta 900, mobilde full
              borderRadius: 2,
              overflow: "hidden", // ✅ scroll yok
              boxShadow:
                "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.40)",
              backgroundColor: "rgba(255,255,255,0.95)",
              p: { xs: 0.5, md: 1 },
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
        </Box>

        {/* ✅ altta sayfa kontrol (istersen kaldırabilirsin) */}
        {totalPages > 1 && (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeRoundedIcon />}
              disabled={!canPrev}
              onClick={() => setPageNum((p) => Math.max(1, p - 1))}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.55)",
                "&:hover": { borderColor: "#fff" },
              }}
            >
              Önceki
            </Button>

            <Typography sx={{ fontWeight: 800, color: "#fff" }}>
              Sayfa {pageNum} / {totalPages}
            </Typography>

            <Button
              variant="outlined"
              endIcon={<NavigateNextRoundedIcon />}
              disabled={!canNext}
              onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.55)",
                "&:hover": { borderColor: "#fff" },
              }}
            >
              Sonraki
            </Button>
          </Stack>
        )}

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

        <Box
          sx={{
            position: "absolute",
            bottom: 24,
            right: 24,
            fontSize: 14,
            color: "#7186a1",
            textAlign: "right",
            pointerEvents: "none",
            display: { xs: "none", md: "block" },
          }}
        >
          {t("companyName")}
        </Box>
      </Box>
    </Box>
  );
}
