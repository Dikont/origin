"use client";

import {
  Paper,
  Typography,
  Box,
  Divider,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CssDataGridResponsive from "@/component/cssDataGridResponsive";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";

type Signer = { isSigned?: boolean };

type ApiItem = {
  documentGroupId: string | number;
  documentGroupName: string;
  documentGroupDesc?: string;
  totalDocuments: number;
  totalSigners: number;
  signedCount: number;
  signCompletionRate: number | null;
  firstSentDate: string | null;
  lastSignDate: string | null;
  groupCreator: string;
  signerDetails?: Signer[];
  status: number;
};

type StatusKey = "pending" | "inProgress" | "completed" | "rejected";

const STATUS_META: Record<
  StatusKey,
  { color: "warning" | "info" | "success" | "error"; Icon: any }
> = {
  pending: { color: "warning", Icon: HourglassEmptyRoundedIcon },
  inProgress: { color: "info", Icon: AutorenewRoundedIcon },
  completed: { color: "success", Icon: CheckCircleRoundedIcon },
  rejected: { color: "error", Icon: DoNotDisturbOnIcon },
};

function getStatus(i: ApiItem): StatusKey {
  if (i.status === 0) return "rejected";
  if (i.signCompletionRate === 100) return "completed";
  if ((i.signedCount ?? 0) > 0) return "inProgress";
  return "pending";
}

const makeRenderStatusChip =
  (t: ReturnType<typeof useTranslations>) => (params: GridRenderCellParams) => {
    const key = (params.value as StatusKey) || "pending";
    const meta = STATUS_META[key] ?? STATUS_META.pending;
    const Icon = meta.Icon;

    return (
      <Chip
        size="small"
        color={meta.color}
        icon={<Icon fontSize="small" />}
        label={t(`status.${key}`)}
        sx={{
          fontWeight: 700,
          borderRadius: "999px",
          py: 2,
          px: 0.5,
          "& .MuiChip-icon": { ml: "6px" },
        }}
      />
    );
  };

export default function DataGridComponent({ data }: { data: ApiItem[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

  const fmtDate = (v?: string | null) => {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: GridColDef[] = [
    {
      field: "documentGroupId",
      headerName: t("colContractNo"),
      flex: 0.7,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "documentGroupName",
      headerName: t("colContractName"),
      flex: 1.4,
      minWidth: 220,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: t("colStatus"),
      flex: 0.8,
      minWidth: 160,
      align: "center",
      headerAlign: "center",
      renderCell: makeRenderStatusChip(t),
      sortable: false,
      filterable: false,
    },
    {
      field: "createdAt",
      headerName: t("colFirstSentDate"),
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "updatedAt",
      headerName: t("colLastSignDate"),
      flex: 1,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
    },
  ];

  const rows = useMemo(() => {
    return (data ?? []).map((i) => ({
      id: String(i.documentGroupId),
      documentGroupId: i.documentGroupId,
      documentGroupName: i.documentGroupName || "-",
      status: getStatus(i),
      createdAt: fmtDate(i.firstSentDate),
      updatedAt: fmtDate(i.lastSignDate),
    }));
  }, [data, locale]);

  const filteredRows = useMemo(() => {
    const q = searchText.trim().toLocaleLowerCase("tr-TR");
    if (!q) return rows;

    return rows.filter((row) => {
      // istersen id alanını dahil etmeyebilirsin
      const haystack = Object.values(row).join(" ").toLocaleLowerCase("tr-TR");

      return haystack.includes(q);
    });
  }, [rows, searchText]);

  const handleSearch = (v: string) => {
    setSearchText(v);
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

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
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      {/* Modern header bar */}
      <Box
        sx={{
          px: 2.25,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
            {t("recentContractsTitle")}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "#6B7280" }}>
            {filteredRows.length}/{rows.length}
          </Typography>
        </Box>

        <TextField
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          size="small"
          sx={{
            width: { xs: "100%", sm: 360 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "rgba(17,24,39,0.03)",
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

      <Divider />

      <CssDataGridResponsive>
        <DataGrid
          disableColumnMenu
          disableRowSelectionOnClick
          isRowSelectable={() => false}
          hideFooterSelectedRowCount
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          rows={filteredRows}
          columns={columns}
          localeText={localeText}
          rowHeight={52}
          columnHeaderHeight={52}
          sx={{
            border: "none",
            minWidth: 900,
            height: "100%",
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
    </Paper>
  );
}
