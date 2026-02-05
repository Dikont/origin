"use client";

import { useSnackbar } from "@/component/SnackbarProvider";
import { Box, Button, Modal, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Yeni eklenen navigasyon hookları
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const fileToPdfBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result as string;
      resolve(dataUrl.replace(/^data:application\/pdf;base64,/, ""));
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

type LangCode = "tr" | "en" | "nl";
type Lang = { code: LangCode; label: string; flag?: string };

export default function ConfirmationOfDocumentPage() {
  const t = useTranslations("confirmationOfDocument");
  const { showSnackbar } = useSnackbar();

  // --- HEADER VE DİL İÇİN GEREKLİ HOOKLAR ---
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
    // /tr/xxx -> /en/xxx
    const segments = pathname.split("/");
    segments[1] = lng;
    const newPath = segments.join("/");

    const qs = searchParams.toString();
    router.push(qs ? `${newPath}?${qs}` : newPath);
  };

  const [isUploaded, setIsUploaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- PDF state ---
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [modalPage, setModalPage] = useState(1);
  const [pdfBase64, setPdfBase64] = useState<string>("");

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | any>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | any>(null);

  // pdfjs worker yükle
  useEffect(() => {
    let mounted = true;
    import("pdfjs-dist").then((mod) => {
      if (!mounted) return;
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setPdfjs(mod);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // küçük kart önizleme render
  useEffect(() => {
    if (!pdfDoc || !isUploaded) return;

    const raf = requestAnimationFrame(() => {
      renderPage(pageNumber, canvasRef, 800);
    });

    return () => cancelAnimationFrame(raf);
  }, [pdfDoc, pageNumber, isUploaded]);

  // modal açıldığında sayfayı çiz
  useEffect(() => {
    if (!modalOpen || !pdfDoc) return;
    const tmo = setTimeout(() => {
      renderPage(modalPage, modalCanvasRef, 800);
    }, 100);
    return () => clearTimeout(tmo);
  }, [modalOpen, modalPage, pdfDoc]);

  async function renderPage(
    pageNum: number,
    ref: React.RefObject<HTMLCanvasElement>,
    maxW: number,
  ) {
    if (!ref.current || !pdfDoc) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;
    const page = await pdfDoc.getPage(pageNum);

    const unscaled = page.getViewport({ scale: 1 });
    const width = Math.min(maxW, unscaled.width);
    const scale = width / unscaled.width;
    const viewport = page.getViewport({ scale });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  // sadece PDF kabul et
  const handleFile = async (file: File) => {
    if (!pdfjs) return;
    if (file.type !== "application/pdf") {
      showSnackbar(t("snackOnlyPdf"), "info");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      const b64 = await fileToPdfBase64(file);
      setPdfBase64(b64);
      setNumPages(pdf.numPages);
      setPageNumber(1);
      setModalPage(1);
      setIsUploaded(true);
    } catch (e) {
      console.error(e);
      showSnackbar(t("snackPdfLoadError"), "error");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const goToPrevModalPage = () => modalPage > 1 && setModalPage((p) => p - 1);
  const goToNextModalPage = () =>
    modalPage < numPages && setModalPage((p) => p + 1);

  // --- İstek: /api/analytics/sendDocumentForCheck ---
  const handleCheckDocument = async () => {
    setLoading(true);
    try {
      if (!pdfDoc || !numPages || !pdfBase64) {
        showSnackbar(t("snackUploadFirst"), "warning");
        return;
      }

      showSnackbar(t("snackProcessing"), "info", 6000);

      const payload = { pdf: pdfBase64 };

      const res = await fetch("/api/analytics/sendDocumentForCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("sendDocumentForCheck error:", data);
        showSnackbar(t("snackCheckFailed"), "error", 5000);
        return;
      }

      if (data?.isValid) {
        showSnackbar(data?.message || t("snackValidated"), "success", 5000);
      } else {
        showSnackbar(data?.message || t("snackInvalid"), "warning", 5000);
      }
    } catch (err) {
      console.error(err);
      showSnackbar(t("snackOperationError"), "error", 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    // modal açıksa kapat
    setModalOpen(false);

    // state reset
    setIsUploaded(false);
    setPdfDoc(null);
    setPdfBase64("");
    setNumPages(0);
    setPageNumber(1);
    setModalPage(1);

    // file input reset (aynı dosyayı tekrar seçebilmek için)
    if (fileInputRef.current) fileInputRef.current.value = "";

    // canvas temizle
    const c1 = canvasRef.current;
    if (c1) c1.getContext("2d")?.clearRect(0, 0, c1.width, c1.height);

    const c2 = modalCanvasRef.current;
    if (c2) c2.getContext("2d")?.clearRect(0, 0, c2.width, c2.height);
  };

  const year = new Date().getFullYear();

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      {/* ---- FIXED HEADER BAŞLANGIÇ ---- */}
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
      {/* ---- FIXED HEADER BİTİŞ ---- */}

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
              border: "2px solid rgb(4, 153, 199)",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h4"
              textAlign={"center"}
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 3,
              }}
            >
              {t("title")}
            </Typography>

            <Box>
              {!isUploaded ? (
                <Box
                  onDragEnter={(e) => {
                    e.preventDefault();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                  }}
                  sx={{
                    height: 300,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(6px)",
                    border: "3px dashed rgba(255,255,255,0.5)",

                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 2,
                  }}
                  onDrop={handleDrop}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {t("dropHintPrimary")}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleUploadClick}
                    sx={{
                      py: 1,
                      px: 3,
                      borderRadius: 2,
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
                    {t("startButton")}
                  </Button>

                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </Box>
              ) : (
                <Box>
                  <Box
                    display={"flex"}
                    gap={"20px"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <Box
                      sx={{
                        height: 150,
                        width: "200px",
                        padding: "20px",
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid #ccc",
                        borderRadius: 2,
                        "&:hover .previewOverlay": {
                          opacity: 1,
                        },
                      }}
                    >
                      <IconButton
                        onClick={resetUpload}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 5,
                          color: "#fff",
                          backgroundColor: "rgba(0,0,0,0.35)",
                          backdropFilter: "blur(6px)",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.55)" },
                        }}
                      >
                        <CloseRoundedIcon fontSize="small" />
                      </IconButton>

                      <canvas
                        ref={canvasRef}
                        style={{ width: "100%", height: "100%" }}
                      />
                      <Box
                        className="previewOverlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          bgcolor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "opacity 0.3s ease",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => setModalOpen(true)}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            py: 1,
                            px: 2,
                            borderRadius: 2,
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
                          {t("previewButton")}
                        </Button>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        height: 150,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(6px)",
                        border: "3px dashed rgba(255,255,255,0.5)",
                        p: 2,
                        width: "200px",
                      }}
                      onDrop={handleDrop}
                      onDragEnter={(e) => {
                        e.preventDefault();
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Typography
                        fontSize={"14px"}
                        sx={{
                          color: "#fff",
                          fontWeight: 300,
                        }}
                      >
                        {t("dropHintPrimary")}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleUploadClick}
                        sx={{
                          py: 1,
                          px: 2,
                          borderRadius: 2,
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
                        {t("uploadButton")}
                      </Button>
                      <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </Box>
                  </Box>

                  <Box display={"flex"} justifyContent={"center"} mt={"50px"}>
                    <Button
                      variant="contained"
                      onClick={handleCheckDocument}
                      disabled={loading}
                      sx={{
                        py: 1,
                        px: 2,
                        borderRadius: 2,
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
                      {t("checkButton")}
                    </Button>
                  </Box>
                </Box>
              )}

              <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 3,
                    outline: "none",
                    maxHeight: "90vh",
                    overflow: "auto",
                  }}
                >
                  <canvas ref={modalCanvasRef} style={{ maxWidth: "100%" }} />

                  <Stack
                    direction="row"
                    spacing={2}
                    mt={2}
                    justifyContent="center"
                  >
                    <Button
                      onClick={goToPrevModalPage}
                      disabled={modalPage === 1}
                    >
                      {t("back")}
                    </Button>
                    <Button
                      onClick={goToNextModalPage}
                      disabled={modalPage === numPages}
                    >
                      {t("next")}
                    </Button>
                  </Stack>

                  <Typography align="center" mt={1}>
                    {t("pageCounter", { page: modalPage, total: numPages })}
                  </Typography>
                </Box>
              </Modal>
            </Box>
          </Paper>
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
    </Box>
  );
}
