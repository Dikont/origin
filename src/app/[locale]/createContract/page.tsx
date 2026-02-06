"use client";

import AddMassage from "@/component/CreateContractComponent/addMassage";
import AddRecipients from "@/component/CreateContractComponent/addRecipients";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FileOperations from "@/component/CreateContractComponent/fileOperations";
import { useSnackbar } from "@/component/SnackbarProvider";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import {
  setDocs,
  setDocumentNameAndDesc,
  setRecipients,
  setSignerTabs,
} from "@/store/slices/formSlice";
import { useTranslations } from "next-intl";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type TPageImage = string; // Blob URL

function base64ToUint8Array(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function normalizeB64(s: string) {
  const i = s.indexOf("base64,");
  return i !== -1 ? s.slice(i + 7) : s.trim();
}
function b64ToBlobUrl(b64: string, mime = "image/png") {
  const bytes = base64ToUint8Array(normalizeB64(b64));
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

export default function PdfCanvasPage() {
  const t = useTranslations("createContract");
  const dispatch = useDispatch();
  const qs = useSearchParams();
  const { showSnackbar } = useSnackbar();
  const [stepCount, setStepCount] = useState(1);
  const canvasRef = useRef<any>(null);
  const modalCanvasRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [modalPage, setModalPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrls, setImageUrls] = useState<TPageImage[]>([]);
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const revokeAll = (urls: string[]) =>
    urls.forEach((u) => URL.revokeObjectURL(u));

  useEffect(() => {
    const tmpl = qs.get("template");
    const followCard = qs.get("followCard");
    if (!tmpl && !followCard) return;
    // if come from template
    if (tmpl) {
      setIsLoading(true);
      (async () => {
        const res = await fetch("/api/getAllPagesOfTemplate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docGId: Number(tmpl) }),
          cache: "no-store",
        });
        if (!res.ok) {
          console.error("getAllPagesOfTemplate failed");
          return;
        }
        const list: Array<{ id: number; documentS3Path: string }> =
          await res.json();
        list.sort((a, b) => a.id - b.id);
        const raws = list.map((x) => normalizeB64(x.documentS3Path));
        const urls = raws.map((b64) => b64ToBlobUrl(b64, "image/png"));
        revokeAll(imageUrls);
        setImageBase64s(raws);
        setImageUrls(urls);
        setPdfDoc(null);
        setNumPages(urls.length || 0);
        setPageNumber(1);
        setIsUploaded(true);
        setIsLoading(false);
        setStepCount(2);
      })();
    }
    // if come from followCard
    if (followCard) {
      setIsLoading(true);
      (async () => {
        const resDoc = await fetch("/api/getGroupInfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ DocumentGroupId: Number(followCard) }),
          cache: "no-store",
        });
        if (!resDoc.ok) {
          console.error("getAllPagesOfTemplate failed");
          return;
        }
        const resDocPayload: any = await resDoc.json();
        dispatch(
          setDocumentNameAndDesc({
            DocumentName: resDocPayload.documentGroupName,
            DocumentDesc: resDocPayload.documentGroupDesc,
          }),
        );

        const res = await fetch("/api/getPagesForDocTakip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentGroup: followCard }),
          cache: "no-store",
        });
        if (!res.ok) {
          console.error("getAllPagesOfTemplate failed");
          return;
        }

        const payload: any = await res.json();

        const docs = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.docs)
            ? payload.docs!
            : [];

        const signerTabs = Array.isArray((payload as any)?.vw_SignerTabs)
          ? (payload as any).vw_SignerTabs
          : [];

        const colorList = [
          "#4F6D7A",
          "#00897B",
          "#CE93D8",
          "#E64A19",
          "#0288D1",
        ];
        const isFilled = (v?: string | null) =>
          !!v && v.trim() !== "" && v.trim() !== "-";

        const uniqMap = signerTabs
          .filter((x: any) => isFilled(x.signerMail))
          .reduce((map: Map<string, any>, x: any) => {
            const key = x.signerMail!.trim().toLowerCase();
            if (!map.has(key)) {
              map.set(key, {
                Signer: x.signerMail!.trim(),
                SignerName: x.signerName || "",
                label: x.label,
                phoneNumber: x.phoneNumber || "",
              });
            }
            return map;
          }, new Map<string, any>());

        const signerIds = Array.from(uniqMap.values()).map((row: any, i) => ({
          ...row,
          color: colorList[i % colorList.length],
        }));

        dispatch(setRecipients(signerIds));
        dispatch(setSignerTabs(payload.vw_SignerTabs));

        docs.sort((a: any, b: any) => a.id - b.id);
        const raws = docs.map((x: any) => normalizeB64(x.documentS3Path));
        const urls = raws.map((b64: any) => b64ToBlobUrl(b64, "image/png"));
        dispatch(setDocs(payload.docs));
        revokeAll(imageUrls);
        setImageBase64s(raws);
        setImageUrls(urls);
        setPdfDoc(null);
        setPageNumber(1);
        setIsLoading(false);
        setStepCount(4);
      })();
    }
  }, [qs]);

  useEffect(() => {
    import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      setPdfjs(mod);
    });
  }, []);

  useEffect(() => {
    if (stepCount !== 1) return;
    if (!isUploaded) return;
    if (!pdfDoc && !imageUrls.length) return;

    const raf = requestAnimationFrame(() => {
      renderPage(pageNumber, canvasRef);
    });

    return () => cancelAnimationFrame(raf);
  }, [stepCount, isUploaded, pdfDoc, imageUrls, pageNumber]);

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        renderPage(modalPage, modalCanvasRef);
      }, 100);
    }
  }, [modalOpen, modalPage]);

  const renderPage = async (
    num: number,
    ref: React.RefObject<HTMLCanvasElement>,
  ) => {
    if (!ref.current) return;
    setIsLoading(true);
    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;

    if (pdfDoc) {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: 1.2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
    } else if (imageUrls.length) {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const ratio = img.width / img.height;
        const w = maxW;
        const h = Math.round(maxW / ratio);
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        setIsLoading(false);
      };
      img.src = imageUrls[num - 1];
      return;
    }
    setIsLoading(false);
  };

  const handleFile = async (file: File) => {
    if (!pdfjs) return;

    try {
      let pdfBlob: Blob;

      if (file.type !== "application/pdf") {
        showSnackbar(t("convertingToPdf"), "info");
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/convert-to-pdf", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          showSnackbar(t("convertFailed"), "error");
          return;
        }
        pdfBlob = await res.blob();
      } else {
        pdfBlob = file;
      }

      const url = URL.createObjectURL(pdfBlob);
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNumber(1);
      setModalPage(1);
      setIsUploaded(true);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Dosya işlenemedi:", err);
      showSnackbar(t("fileProcessFailed"), "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const goToPrevModalPage = () => {
    if (modalPage > 1) setModalPage((prev) => prev - 1);
  };
  const goToNextModalPage = () => {
    if (modalPage < numPages) setModalPage((prev) => prev + 1);
  };

  const resetUpload = () => {
    // modal açıksa kapat
    setModalOpen(false);

    // PDF state reset
    setPdfDoc(null);
    setNumPages(0);
    setPageNumber(1);
    setModalPage(1);

    // Template/FollowCard image state reset + blob url cleanup
    revokeAll(imageUrls);
    setImageUrls([]);
    setImageBase64s([]);

    // Upload state reset
    setIsUploaded(false);
    setIsDragging(false);

    // file input reset (aynı dosyayı tekrar seçebilmek için)
    if (fileInputRef.current) fileInputRef.current.value = "";

    // canvas temizle (önizleme + modal)
    const c1 = canvasRef.current;
    if (c1) c1.getContext("2d")?.clearRect(0, 0, c1.width, c1.height);

    const c2 = modalCanvasRef.current;
    if (c2) c2.getContext("2d")?.clearRect(0, 0, c2.width, c2.height);

    // (Opsiyonel ama temiz) Redux form datasını da sıfırla
    dispatch(setDocs([] as any));
    dispatch(setRecipients([] as any));
    dispatch(setSignerTabs([] as any));
    dispatch(
      setDocumentNameAndDesc({ DocumentName: "", DocumentDesc: "" } as any),
    );
  };

  useEffect(() => {
    return () => {
      revokeAll(imageUrls);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrls]);

  return (
    <>
      {isLoading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        key={stepCount}
      >
        <Grid container>
          {stepCount === 1 && (
            <Grid size={12}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                {t("uploadTitle")}
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
                      border: "4px dashed #646E9F",
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
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#000000",
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {t("dropOrUpload")}
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleUploadClick}
                      sx={{
                        py: 1,
                        px: 3,
                        borderRadius: 2,
                        color: "#fff",
                        fontWeight: 600,
                        textTransform: "none",
                        background:
                          "linear-gradient(135deg, #5C2230 0%, #453562 100%)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #796171 0%, #646E9F 100%)",
                        },
                      }}
                    >
                      {t("start")}
                    </Button>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    <Box
                      sx={{
                        height: 150,
                        width: "200px",
                        padding: "20px",
                        position: "relative",
                        overflow: "hidden",
                        border: "2px solid #646E9F",
                        borderRadius: 2,
                        "&:hover .previewOverlay": { opacity: 1 },
                      }}
                      className="prev12312312321iewContainer"
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
                              "linear-gradient(135deg, #5C2230 0%, #453562 100%)",
                            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #796171 0%, #646E9F 100%)",
                            },
                          }}
                        >
                          {t("preview")}
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
                        backgroundColor: isDragging ? "#e0f7fa" : "#f9f9f9",
                        border: "3px dashed #646E9F",
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
                      <Typography
                        fontSize={"14px"}
                        sx={{
                          color: "#000000",
                          fontWeight: 300,
                        }}
                      >
                        {t("dropOrUpload")}
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
                          background:
                            "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
                          },
                        }}
                      >
                        {t("upload")}
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </Box>
                  </Grid>
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

              <Divider sx={{ mt: 5, mb: 3 }} />
              {pdfDoc || imageUrls?.length ? (
                <Box display={"flex"} justifyContent={"flex-end"} my="20px">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setStepCount(2)}
                    sx={{
                      py: 1,
                      px: 3,
                      borderRadius: 2,
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      background:
                        "linear-gradient(135deg, #025f4d 0%, #01775f 100%)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #01775f 0%, #025f4d 100%)",
                      },
                    }}
                  >
                    {t("continue")}
                  </Button>
                </Box>
              ) : null}
            </Grid>
          )}

          {stepCount === 2 && (
            <Box width={"100%"}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                {t("addRecipientsTitle")}
              </Typography>
              <AddRecipients setStepCount={setStepCount} />
            </Box>
          )}

          {stepCount === 3 && (
            <Box width={"100%"}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                {t("addDescriptionTitle")}
              </Typography>
              <AddMassage setStepCount={setStepCount} />
            </Box>
          )}

          {stepCount === 4 && (
            <Box width={"100%"}>
              <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                {t("addSignatureTitle")}
              </Typography>
              <FileOperations
                pdfDoc={pdfDoc}
                imageUrls={imageUrls}
                pageBase64s={imageBase64s}
              />
            </Box>
          )}
        </Grid>
      </motion.div>
    </>
  );
}
