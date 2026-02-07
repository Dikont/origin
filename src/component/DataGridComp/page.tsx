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
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import EmailIcon from "@mui/icons-material/Email";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useSnackbar } from "../SnackbarProvider";
import PdfSinglePage from "./pdfSinglePage";
import { useTranslations } from "next-intl";
import CssDataGridResponsive from "@/component/cssDataGridResponsive";
import FilterListIcon from "@mui/icons-material/FilterList"; // İsteğe bağlı ikon
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { alpha } from "@mui/material/styles";

export default function DataGridComp({ user, userRole }: any) {
  const t = useTranslations("followContracts");
  const { showSnackbar } = useSnackbar();
  const [data, setData] = useState(null) as any;
  const [loading, setLoading] = useState(true);
  const [routing, setRouting] = useState(false);
  const router = useRouter();

  // --- FİLTRELEME STATE'İ ---
  // "ALL", "COMPLETED", "WAITING", "IN_PROGRESS", "REJECTED"
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

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
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const columns: GridColDef[] = [
    {
      field: "creatorName",
      headerName: t("colCreatorName"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
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
      sortComparator: (_v1, _v2, param1, param2) => {
        const row1 = param1.api.getRow(param1.id);
        const row2 = param2.api.getRow(param2.id);

        const d1 = new Date(row1.createdDateRaw).getTime();
        const d2 = new Date(row2.createdDateRaw).getTime();

        return d1 - d2;
      },
    },
    {
      field: "sortValue",
      headerName: t("situation"),
      flex: 1,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params: any) => {
        const status = params.row.status;
        const rate = params.row.signatureStatus;

        if (status === 0) {
          return (
            <Chip
              icon={<DoNotDisturbOnIcon fontSize="small" />}
              label={t("table_status.rejected")}
              color="error"
              variant="filled"
              sx={{ fontWeight: 500, px: 0.5, borderRadius: "999px" }}
            />
          );
        }

        if (rate === 100) {
          return (
            <Chip
              icon={<CheckCircleIcon fontSize="small" />}
              label={t("table_status.completed")}
              color="success"
              variant="filled"
              sx={{ fontWeight: 500, px: 0.5 }}
            />
          );
        }

        if (rate === 0) {
          return (
            <Chip
              icon={<HourglassEmptyRoundedIcon fontSize="small" />}
              label={t("table_status.waiting")}
              color="warning"
              variant="filled"
              sx={{ fontWeight: 500, px: 0.5 }}
            />
          );
        }

        return (
          <Chip
            icon={<AutorenewIcon fontSize="small" />}
            label={t("table_status.in_progress")}
            color="info"
            variant="filled"
            sx={{ fontWeight: 500, px: 0.5 }}
          />
        );
      },
    },

    {
      field: "id",
      headerName: t("colActions"),
      flex: 1,
      align: "right",
      headerAlign: "center",
      renderCell: (params: any) => {
        const status = params.row.status;
        const rate = params.row.signatureStatus;

        const isRejected = status === 0;
        const isCompleted = rate === 100;

        return (
          <Box>
            {/* Preview HER DURUMDA VAR */}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                openPreview(params.row);
              }}
            >
              <VisibilityIcon sx={{ fontSize: 24, color: "#0629c5ff" }} />
            </IconButton>

            {/* TAMAMLANMIŞ veya REDDEDİLMİŞ ise sadece Preview + Silme */}
            {!(isRejected || isCompleted) && (
              <>
                {/* Mail Gönderme butonu sadece AKTİF / TAMAMLANMAMIŞ durumlarda */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handelSendMail(Number(params.row.documentGroupId));
                  }}
                >
                  <EmailIcon sx={{ fontSize: 24, color: "#4666f7ff" }} />
                </IconButton>

                {/* Edit sadece RED olmadığında ve hiç imza yokken (0%) */}
                {rate === 0 && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRouteCreateDoc(Number(params.row.documentGroupId));
                    }}
                  >
                    <EditSquareIcon sx={{ fontSize: 24, color: "#117e23ff" }} />
                  </IconButton>
                )}
              </>
            )}

            {/* Silme HER DURUMDA VAR */}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                askDelete(Number(params.row.documentGroupId));
              }}
            >
              <DeleteIcon sx={{ fontSize: 24, color: "#972e2eff" }} />
            </IconButton>
          </Box>
        );
      },
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
        "error",
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
            (x: any) => String(x.documentGroupId) !== String(pendingId),
          ),
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

  // -----------------------------------------------------------------
  // 1. ADIM: VERİYİ FİLTRELEME
  // -----------------------------------------------------------------
  const filteredData = safeData.filter((item: any) => {
    const rate = item.signCompletionRate ?? 0;
    const status = item.status;

    // Tümü seçiliyse hepsini göster
    if (filterStatus === "ALL") return true;

    // Reddedilenleri göster
    if (filterStatus === "REJECTED") return status === 0;

    // --- Diğer durumlar için: Eğer statüsü Red (0) ise bunları listeden çıkar ---
    // Çünkü "Bekliyor" veya "Tamamlandı" listesinde reddedilenlerin işi yok.
    if (status === 0) return false;

    // Tamamlandı
    if (filterStatus === "COMPLETED") return rate === 100;

    // Bekliyor
    if (filterStatus === "WAITING") return rate === 0;

    // Devam Ediyor
    if (filterStatus === "IN_PROGRESS") return rate > 0 && rate < 100;

    return true;
  });

  // -----------------------------------------------------------------
  // 2. ADIM: FİLTRELENMİŞ VERİDEN ROWS OLUŞTURMA
  // -----------------------------------------------------------------
  const rows = filteredData.map((item: any) => {
    const rate = item.signCompletionRate ?? 0;
    const status = item.status;

    let sortValue = 0;
    if (status === 0)
      sortValue = 0; // REDDEDİLDİ
    else if (rate === 100)
      sortValue = 3; // TAMAMLANDI
    else if (rate === 0)
      sortValue = 1; // BEKLİYOR
    else sortValue = 2; // DEVAM EDİYOR

    return {
      id: String(item.documentGroupId),
      documentGroupId: item.documentGroupId,
      documentS3Path: item.documentS3Path,
      sozlesme_name: item.documentGroupName,
      creatorName: item.creatorName,
      template_name:
        item.documentGroupDesc.length > 0
          ? item.documentGroupDesc
          : t("notProvided"),

      createdDateRaw: item.firstSentDate,
      createdDate: formatTR(item.firstSentDate),

      signatureStatus: rate,
      status: status,
      sortValue,
    };
  });

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
          `data:image/png;base64,${normalizePdfBase64(data.documentS3Path)}`,
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
    setRouting(true);

    const status = params.row.signatureStatus;
    const rejectStatus = params.row.status;
    router.push({
      pathname: `/followContracts/${params.id}`,
      query: {
        signatureStatus: status,
        rejectStatus: rejectStatus,
      },
    });
  };

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLocaleLowerCase("tr-TR");
    if (!q) return rows;

    return rows.filter((row: any) => {
      const haystack = [
        row.creatorName,
        row.sozlesme_name,
        row.template_name,
        row.createdDate,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return haystack.includes(q);
    });
  }, [rows, searchText]);

  const localeText = {
    MuiTablePagination: {
      labelRowsPerPage: t("table.rowsPerPage"), // "Sayfa başına satır"
      labelDisplayedRows: ({ from, to, count }: any) =>
        `${from}-${to} / ${count !== -1 ? count : `>${to}`}`,
    },

    noRowsLabel: t("table.noRows"), // "Kayıt bulunamadı"
    noResultsOverlayLabel: t("table.noResults"), // arama sonrası da buna düşebilir
  };
  return (
    <Box sx={{ width: "100%" }}>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}
      {routing && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}

      {/* --- FİLTRE BUTONLARI BURAYA EKLENDİ --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        {/* BUTONLAR */}
        <Box
          sx={{
            display: { xs: "grid", sm: "flex", md: "flex" },
            gridTemplateColumns: {
              xs: "repeat(2, max-content)",
              sm: "none",
              md: "none",
            },
            justifyContent: {
              xs: "flex-start",
              sm: "flex-start",
              md: "flex-start",
            },
            gap: 1,
            width: { xs: "100%", md: "auto" },
            flexWrap: { md: "wrap" },
            minWidth: 0,
          }}
        >
          <Button
            variant={filterStatus === "ALL" ? "contained" : "outlined"}
            onClick={() => setFilterStatus("ALL")}
            startIcon={<FilterListIcon />}
            disableRipple
            color="inherit"
            sx={{
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              transition: "none",
              boxShadow: "none",
              height: 40,
              "&:active": { boxShadow: "none" },
              "&:focus": { outline: "none" },
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {t("table_status.all")}
          </Button>

          <Button
            variant={filterStatus === "COMPLETED" ? "contained" : "outlined"}
            color="success"
            onClick={() => setFilterStatus("COMPLETED")}
            startIcon={<CheckCircleIcon />}
            disableRipple
            sx={{
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              transition: "none",
              boxShadow: "none",
              height: 40,
              "&:active": { boxShadow: "none" },
              "&:focus": { outline: "none" },
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {t("table_status.completed")}
          </Button>

          <Button
            variant={filterStatus === "WAITING" ? "contained" : "outlined"}
            color="warning"
            onClick={() => setFilterStatus("WAITING")}
            startIcon={<HourglassEmptyRoundedIcon />}
            disableRipple
            sx={{
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              transition: "none",
              boxShadow: "none",
              height: 40,
              "&:active": { boxShadow: "none" },
              "&:focus": { outline: "none" },
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {t("table_status.waiting")}
          </Button>

          <Button
            variant={filterStatus === "IN_PROGRESS" ? "contained" : "outlined"}
            color="info"
            onClick={() => setFilterStatus("IN_PROGRESS")}
            startIcon={<AutorenewIcon />}
            disableRipple
            sx={{
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              transition: "none",
              boxShadow: "none",
              height: 40,
              "&:active": { boxShadow: "none" },
              "&:focus": { outline: "none" },
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {t("table_status.in_progress")}
          </Button>

          <Button
            variant={filterStatus === "REJECTED" ? "contained" : "outlined"}
            color="error"
            onClick={() => setFilterStatus("REJECTED")}
            startIcon={<DoNotDisturbOnIcon />}
            disableRipple
            sx={{
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              transition: "none",
              boxShadow: "none",
              height: 40,
              "&:active": { boxShadow: "none" },
              "&:focus": { outline: "none" },
              justifyContent: "center",
              whiteSpace: "nowrap",
            }}
          >
            {t("table_status.rejected")}
          </Button>
        </Box>

        {/* SEARCH */}
        <TextField
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPaginationModel((p) => ({ ...p, page: 0 }));
          }}
          placeholder={t("table_status.searchPlaceholder")}
          size="small"
          sx={{
            // xs'de tam kaplasın
            width: { xs: "100%", md: 360 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "rgba(17,24,39,0.03)",
              height: 40,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {/* -------------------------------------- */}

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
            disableColumnMenu
            disableRowSelectionOnClick
            isRowSelectable={() => false}
            hideFooterSelectedRowCount
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            localeText={localeText}
            rowHeight={52}
            columnHeaderHeight={52}
            initialState={{
              sorting: { sortModel: [{ field: "createdDate", sort: "desc" }] },
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            onRowClick={goDetail}
            sx={{
              border: "none",
              minWidth: 900,
              height: "100%",
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(17, 24, 39, 0.03)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                color: "#111827",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                color: "#111827",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "rgba(17, 24, 39, 0.015)",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(59, 130, 246, 0.06)",
              },
              "--DataGrid-cellFocusOutline": "none",
              "--DataGrid-columnHeaderFocusOutline": "none",
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                { outline: "none" },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "1px solid rgba(0,0,0,0.06)",
                backgroundColor: "rgba(17, 24, 39, 0.02)",
                minHeight: 52,
              },
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

          {/* İstersen opsiyonel uyarı */}
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
              {t("deleteConfirmWarn")}
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
