"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Stack,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "../SnackbarProvider";
import { useRouter } from "next/navigation";
import CssDataGridResponsive from "@/component/cssDataGridResponsive";
type Row = {
  id: number;
  email: string;
  createdAt: string;
  notifiedAt: string | null;
  status: "Pending" | "Approved" | "Rejected" | "Completed" | string;
};

const STATUS_OPTIONS = [
  "Pending",
  "Approved",
  "Rejected",
  "Completed",
] as const;

export default function RegistrationRequestsGrid() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [rows, setRows] = useState<Row[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Row | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  // server-side pagination
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // 0-based
    pageSize: 10,
  });

  // filtreler
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("Pending");

  // debounce
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const columns = useMemo<GridColDef<Row>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 50,
        renderCell: (p: GridRenderCellParams<Row, number>) => (
          <span>{p?.value ?? p?.row?.id ?? "-"}</span>
        ),
      },
      {
        field: "email",
        headerName: "E-posta",
        flex: 1,
        renderCell: (p: GridRenderCellParams<Row, string>) => {
          const raw = (p?.value ?? p?.row?.email) as any;
          const str = typeof raw === "string" ? raw : String(raw ?? "");
          let decoded = str;
          try {
            decoded = decodeURIComponent(str);
          } catch {}
          return <span title={decoded}>{decoded}</span>;
        },
      },
      {
        field: "name",
        headerName: "İsim",
        flex: 1,
        renderCell: (p: any) => {
          return <span>{p.row.name}</span>;
        },
      },
      {
        field: "phoneNumber",
        headerName: "Telefon Numarası",
        flex: 1,
        renderCell: (p: any) => {
          return <span>{p.row.phoneNumber}</span>;
        },
      },
      {
        field: "createdAt",
        headerName: "Oluşturulma",
        flex: 1,
        renderCell: (p: GridRenderCellParams<Row, string>) => {
          const v = p?.value ?? p?.row?.createdAt;
          if (!v) return <span>-</span>;
          const d = new Date(String(v));
          return (
            <span>{isNaN(d.getTime()) ? "-" : d.toLocaleString("tr-TR")}</span>
          );
        },
      },
      {
        field: "notifiedAt",
        headerName: "Bildirme Tarihi",
        flex: 1,
        renderCell: (p: GridRenderCellParams<Row, string | null>) => {
          const v = p?.value ?? p?.row?.notifiedAt;
          if (!v) return <span>-</span>;
          const d = new Date(String(v));
          return (
            <span>{isNaN(d.getTime()) ? "-" : d.toLocaleString("tr-TR")}</span>
          );
        },
      },
      {
        field: "note",
        headerName: "Not",
        flex: 1,
        renderCell: (p: any) => {
          return <span>{p.row.note}</span>;
        },
      },
      {
        field: "status",
        headerName: "Durum",
        flex: 1,
        renderCell: (p: GridRenderCellParams<Row, Row["status"]>) => {
          const s = String(p?.value ?? p?.row?.status ?? "");
          const color =
            s === "Approved"
              ? "primary"
              : s === "Rejected"
              ? "error"
              : s === "warning"
              ? "warning"
              : s === "Completed"
              ? "success"
              : "info";
          return <Chip size="small" color={color as any} label={s || "-"} />;
        },
      },
    ],
    []
  );

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrationRequests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          search: debouncedSearch,
          status,
        }),
      });

      const json = await res.json();
      const items: Row[] = json?.items ?? json ?? [];

      // 1) Header veya body'den total'ı yakala
      let totalFromHeader =
        Number(res.headers.get("x-total-count")) ||
        Number(res.headers.get("X-Total-Count")) ||
        undefined;

      let total =
        (typeof json?.totalCount === "number" && json.totalCount) ||
        totalFromHeader;

      // 2) Total yoksa tahmini total (next page varmış gibi göster)
      if (!total) {
        const hasNext = items.length === paginationModel.pageSize;
        total = hasNext
          ? (paginationModel.page + 1) * paginationModel.pageSize + 1 // bir sonrakine geçişi mümkün kıl
          : paginationModel.page * paginationModel.pageSize + items.length; // son sayfa
      }

      setRows(items);
      setRowCount(total);
    } catch (e) {
      console.error(e);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // sayfa, pageSize, filtreler değişince fetch
  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch, status]);
  const patchRow = (id: number, partial: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...partial } : r))
    );
  };

  const doApprove = async () => {
    if (!activeItem) return;
    setLoadingApprove(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeItem.id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || JSON.stringify(data));
      if (data.message == "İstek onaylandı.") {
        showSnackbar("İstek onaylandı", "success");
        patchRow(activeItem.id, { status: "Approved" });
      } else {
        showSnackbar("İstek onaylanamadı veya hata oluştu", "error");
      }
      setStatusModalOpen(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingApprove(false);
    }
  };

  const doReject = async () => {
    if (!activeItem) return;
    const v = note.trim();

    setLoadingReject(true);
    try {
      const res = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: v,
          id: activeItem.id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || JSON.stringify(data));
      if (data.message == "İstek reddedildi.") {
        showSnackbar("İstek reddedildi", "success");
        patchRow(activeItem.id, { status: "Rejected" });
      } else {
        showSnackbar("İstek reddedilemedi veya hata oluştu", "error");
      }
      setStatusModalOpen(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingReject(false);
    }
  };
  const handleCloseModal = () => {
    setNote("");
    setNoteError(null);
    setStatusModalOpen(false);
  };
  const handleModalControl = (item: any) => {
    setActiveItem(item);

    if (item.status === "Pending") {
      setStatusModalOpen(true);
    }
    if (item.status === "Approved") {
      router.push(`/admin/createAccount?id=${item.id}&email=${item.email}`);
    }
  };
  return (
    <Stack gap={2}>
      {/* Filtreler */}
      <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          label="Ara (e-posta)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            endAdornment: search ? (
              <Tooltip title="Temizle">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null,
          }}
        />

        <TextField
          size="small"
          select
          label="Durum"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: 200 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Grid */}

      <CssDataGridResponsive>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          isRowSelectable={() => false}
          onRowClick={(p) => handleModalControl(p.row)}
          paginationMode="server"
          sx={{
            minWidth: "900px",
            height: "100%",
            border: "none",
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

      <Dialog
        open={statusModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Talep İşlemi</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ fontWeight: 600 }}>{activeItem?.email}</Box>
              <Chip
                size="small"
                label={activeItem?.status ?? "-"}
                color="info"
                sx={{ ml: "auto" }}
              />
            </Stack>

            {/* Reject notu */}
            <TextField
              label="Not"
              placeholder="Örn: Geçersiz e-posta / yinelenen başvuru vb."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (noteError) setNoteError(null);
              }}
              error={!!noteError}
              helperText={noteError ?? "Approve için boş bırakabilirsin."}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal}>Kapat</Button>

          <Button
            onClick={doReject}
            color="error"
            variant="outlined"
            disabled={loadingReject || loadingApprove}
            startIcon={loadingReject ? <CircularProgress size={18} /> : null}
          >
            Reject
          </Button>

          <Button
            onClick={doApprove}
            variant="contained"
            disabled={loadingApprove || loadingReject}
            startIcon={loadingApprove ? <CircularProgress size={18} /> : null}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
