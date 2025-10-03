"use client";

import {
  Backdrop,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import EmailIcon from "@mui/icons-material/Email";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useSnackbar } from "../SnackbarProvider";
import PdfSinglePage from "./pdfSinglePage";
import { useTranslations } from "next-intl";
import CssDataGridResponsive from "@/component/cssDataGridResponsive";
export default function DataGridComp({ user, userRole }: any) {
  const t = useTranslations("followContracts");
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState(null) as any;
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // delete modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // preview modal state
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIsPdf, setPreviewIsPdf] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rendering, setRendering] = useState(false);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const columns: GridColDef[] = [
    {
      field: "sozlesme_name",
      headerName: t("colContractName"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "template_name",
      headerName: t("colTemplateName"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "signatureStatus",
      headerName: t("colSignatureStatus"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: renderSignatureStatus,
    },
    {
      field: "createdDate",
      headerName: t("colCreatedDate"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "id",
      headerName: t("colActions"),
      flex: 1,
      align: "right",
      headerAlign: "center",
      renderCell: (params: any) => (
        <Box>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              openPreview(params.row);
            }}
          >
            <VisibilityIcon sx={{ fontSize: 24, color: "#0629c5ff" }} />
          </IconButton>

          {params.row.signatureStatus != 100 && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handelSendMail(Number(params.row.documentGroupId));
              }}
            >
              <EmailIcon sx={{ fontSize: 24, color: "#4666f7ff" }} />
            </IconButton>
          )}
          {params.row.signatureStatus == 0 && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleRouteCreateDoc(Number(params.row.documentGroupId));
              }}
            >
              <EditSquareIcon sx={{ fontSize: 24, color: "#117e23ff" }} />
            </IconButton>
          )}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              askDelete(Number(params.row.documentGroupId));
            }}
          >
            <DeleteIcon sx={{ fontSize: 24, color: "#972e2eff" }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handelSendMail = async (id: number) => {
    const res = await fetch("/api/resendReminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docGroupId: id }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      showSnackbar(
        data?.error || t("snackErrorWithStatus", { status: res.status }),
        "error"
      );
      return;
    }

    if (typeof data?.count === "number") {
      if (data.count > 0)
        showSnackbar(t("snackReminderSent", { mail: data.mail }), "success");
      else showSnackbar(t("snackNoRecipients"), "info");
    } else {
      showSnackbar(t("snackDone"), "success");
    }
  };

  const askDelete = (id: string | number) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingId == null) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/DeleteSignProcess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docGId: Number(pendingId) }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        console.error("Silme hatası:", json);
      } else {
        setData((prev: any) =>
          prev.filter(
            (x: any) => String(x.documentGroupId) !== String(pendingId)
          )
        );
      }
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingId(null);
    }
  };

  const handleRouteCreateDoc = (id: number) => {
    router.push({ pathname: `/createContract?followCard=${id}` });
  };

  const formatTR = (iso: any) =>
    iso
      ? new Date(iso).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";

  const safeData = Array.isArray(data) ? data : [];
  const rows = safeData.map((item: any) => ({
    id: String(item.documentGroupId),
    documentGroupId: item.documentGroupId,
    documentS3Path: item.documentS3Path,
    sozlesme_name: item.documentGroupName,
    template_name:
      item.documentGroupDesc.length > 0
        ? item.documentGroupDesc
        : t("notProvided"),
    createdDate: formatTR(item.firstSentDate),
    signatureStatus: item.signCompletionRate ?? 0,
  }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/getDocumentTakip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, userRole }),
      });
      const json = await res.json();
      setData(json);
      setLoading(false);
    })();
  }, [user, userRole]);

  // ---- Preview aç ----
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
  function base64ToBlobUrl(b64: string, mime = "application/pdf") {
    const bytes = base64ToUint8Array(b64);
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  }
  let lastObjectUrl: string | null = null;
  function revokeLastUrl() {
    if (lastObjectUrl) {
      URL.revokeObjectURL(lastObjectUrl);
      lastObjectUrl = null;
    }
  }

  const openPreview = async (row: any) => {
    setLoading(true);
    setSelectedDocId(row.id);
    try {
      const docGId = row.documentGroupId;
      const signatureStatus = row.signatureStatus;

      if (signatureStatus === 100) {
        const res = await fetch("/api/getSignedPdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docGId }),
        });
        if (!res.ok) throw new Error("GetSignedPdf başarısız");

        const pdfBase64Raw = normalizePdfBase64(await res.text());

        // @ts-ignore
        const pdfjs = await import("pdfjs-dist/build/pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({
          data: base64ToUint8Array(pdfBase64Raw),
        }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setPageNum(1);
        await renderPage(doc, 1, scale);

        revokeLastUrl();
        const url = base64ToBlobUrl(pdfBase64Raw, "application/pdf");
        lastObjectUrl = url;

        setPreviewIsPdf(true);
        setPreviewSrc(url);
        setPreviewOpen(true);
      } else {
        const res = await fetch("/api/getDocumentTakipSinglePage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docGId }),
        });
        if (!res.ok) throw new Error("getDocumentTakipSinglePage başarısız");

        const data = await res.json();
        setPdfDoc(null);
        setTotalPages(1);
        setPageNum(1);
        setPreviewIsPdf(false);
        setPreviewSrc(
          `data:image/png;base64,${normalizePdfBase64(data.documentS3Path)}`
        );
        setPreviewOpen(true);
      }
    } catch (err) {
      console.error("openPreview error:", err);
    } finally {
      setLoading(false);
    }
  };

  async function renderPage(doc: any, num: number, scl: number) {
    if (!doc || !canvasRef.current) return;
    const page = await doc.getPage(num);
    const viewport = page.getViewport({ scale: scl });
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  const goDetail = (params: any) => {
    const status = params.row.signatureStatus;
    router.push({ pathname: `/followContracts/${params.id}?status=${status}` });
  };

  return (
    <Box sx={{ width: "100%" }}>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        key={data}
        style={{ width: "100%", overflow: "auto" }}
      >
        <CssDataGridResponsive>
          <DataGrid
            disableRowSelectionOnClick
            isRowSelectable={() => false}
            hideFooterSelectedRowCount
            pageSizeOptions={[5, 10, 25]}
            rows={rows}
            columns={columns}
            onRowClick={goDetail}
            sx={{
              minWidth: "850px",
              "& .MuiDataGrid-row": { cursor: "pointer" },
              "--DataGrid-cellFocusOutline": "none",
              "--DataGrid-columnHeaderFocusOutline": "none",
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                { outline: "none" },
              "& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover":
                { backgroundColor: "transparent" },
            }}
          />
        </CssDataGridResponsive>
      </motion.div>

      {/* Delete Onay Modali */}
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
            {deleting ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              t("yes")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Modali */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        scroll="paper"
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {previewIsPdf ? (
            <PdfSinglePage
              pdfDoc={pdfDoc}
              page={pageNum}
              onPageChange={setPageNum}
              totalPages={totalPages}
              selectedDocId={selectedDocId}
            />
          ) : (
            <Box
              borderRadius={"8px"}
              boxShadow={
                "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.40)"
              }
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
    </Box>
  );
}

// Yardımcı: yüzdeye göre tema
function getStatusMeta(pct: number) {
  if (pct >= 100) {
    return {
      label: "Tamamlandı",
      color: "success" as const,
      Icon: CheckCircleIcon,
    };
  }
  if (pct > 0) {
    return {
      label: "Devam Ediyor",
      color: "info" as const,
      Icon: AutorenewIcon,
    };
  }
  return {
    label: "Başlamadı",
    color: "error" as const,
    Icon: DoNotDisturbOnIcon,
  };
}

// Hücre render’ı
function renderSignatureStatus(params: any) {
  const pct = Number(params.row.signatureStatus ?? 0);
  const signed = params.row.signedCount;
  const total = params.row.totalCount;
  const { color } = getStatusMeta(pct);
  const showFraction = Number.isFinite(signed) && Number.isFinite(total);

  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      justifyContent="center"
      display="flex"
      height="100%"
    >
      {showFraction && (
        <Chip
          label={`${signed}/${total}`}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, borderColor: (t) => t.palette.grey[300] }}
        />
      )}
      <Tooltip title={`${pct}%`}>
        <Box sx={{ minWidth: 92 }}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, pct))}
              color={color}
              sx={{
                height: 10,
                borderRadius: 999,
                flex: 1,
                bgcolor: (t) => t.palette.grey[200],
                "& .MuiLinearProgress-bar": { borderRadius: 999 },
              }}
            />
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, minWidth: 28 }}
              align="right"
            >
              {Math.round(pct)}%
            </Typography>
          </Box>
        </Box>
      </Tooltip>
    </Stack>
  );
}
