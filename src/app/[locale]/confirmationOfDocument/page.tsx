"use client";

import { useSnackbar } from "@/component/SnackbarProvider";
import {
  Box,
  Button,
  Grid,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const fileToPdfBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result as string; // "data:application/pdf;base64,...."
      resolve(dataUrl.replace(/^data:application\/pdf;base64,/, ""));
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

export default function ConfirmationOfDocumentPage() {
  const t = useTranslations("confirmationOfDocument");
  const { showSnackbar } = useSnackbar();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    if (!pdfDoc) return;
    renderPage(pageNumber, canvasRef, 800);
  }, [pdfDoc, pageNumber]);

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
    maxW: number
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
    setIsDragging(false);
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

      if (data?.redirectUrl) {
        // router.push(data.redirectUrl)
      }
    } catch (err) {
      console.error(err);
      showSnackbar(t("snackOperationError"), "error", 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ width: "100%", height: "100vh" }}>
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
            <Typography variant="h4" sx={{ mb: 3 }} textAlign={"center"}>
              {t("title")}
            </Typography>

            <Box>
              {!isUploaded ? (
                <Box
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  sx={{
                    height: 300,
                    border: "2px dashed #aaa",
                    borderRadius: 2,
                    backgroundColor: isDragging ? "#e0f7fa" : "#f9f9f9",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 2,
                  }}
                  onDrop={handleDrop}
                >
                  <Typography variant="h6">{t("dropHintPrimary")}</Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleUploadClick}
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
                        <Button variant="contained" color="warning">
                          {t("previewButton")}
                        </Button>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        height: 150,
                        border: "2px dashed #aaa",
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: isDragging ? "#e0f7fa" : "#f9f9f9",
                        p: 2,
                        width: "200px",
                      }}
                      onDrop={handleDrop}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                    >
                      <Typography fontSize={"14px"}>
                        {t("dropHintPrimary")}
                      </Typography>
                      <Button variant="contained" onClick={handleUploadClick}>
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
                      color="success"
                      onClick={handleCheckDocument}
                      disabled={loading}
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
      </Box>
    </Box>
  );
}
