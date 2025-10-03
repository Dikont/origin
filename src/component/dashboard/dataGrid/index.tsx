"use client";
import { Chip, Paper, Typography, Box } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useState } from "react";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useTranslations, useLocale } from "next-intl";
import CssDataGridResponsive from "@/component/cssDataGridResponsive";
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
};

// Kanonik durum anahtarları (i18n label bu anahtarlarla eşleşecek)
type StatusKey = "pending" | "inProgress" | "completed";

const STATUS_META: Record<
  StatusKey,
  { color: "warning" | "info" | "success"; Icon: any }
> = {
  pending: { color: "warning", Icon: HourglassEmptyRoundedIcon },
  inProgress: { color: "info", Icon: AutorenewRoundedIcon },
  completed: { color: "success", Icon: CheckCircleRoundedIcon },
};

function getStatus(i: ApiItem): StatusKey {
  if (Array.isArray(i.signerDetails)) {
    if (i.signerDetails.length === 0) return "pending";
    return i.signerDetails.every((s) => s?.isSigned === true)
      ? "completed"
      : "inProgress";
  }
  if (i.signCompletionRate === 100) return "completed";
  if ((i.signedCount ?? 0) > 0) return "inProgress";
  return "pending";
}

const makeRenderStatusChip =
  (t: ReturnType<typeof useTranslations>) => (params: GridRenderCellParams) => {
    const key = (params.row.status as StatusKey) || "pending";
    const meta = STATUS_META[key] ?? STATUS_META.pending;
    const Icon = meta.Icon;
    return (
      <Chip
        size="small"
        color={meta.color}
        icon={<Icon fontSize="small" />}
        label={t(`status.${key}`)}
        sx={{ fontWeight: 600 }}
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

  const fmtDate = (v?: string | null) => {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleString(locale);
  };

  const columns: GridColDef[] = [
    {
      field: "documentGroupId",
      headerName: t("colContractNo"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "documentGroupName",
      headerName: t("colContractName"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: t("colStatus"),
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      renderCell: makeRenderStatusChip(t),
    },
    {
      field: "createdAt",
      headerName: t("colFirstSentDate"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "updatedAt",
      headerName: t("colLastSignDate"),
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ];

  const rows =
    (data ?? []).map((i) => ({
      id: String(i.documentGroupId),
      documentGroupId: i.documentGroupId,
      documentGroupName: i.documentGroupName || "-",
      status: getStatus(i), // "pending" | "inProgress" | "completed"
      createdAt: fmtDate(i.firstSentDate),
      updatedAt: fmtDate(i.lastSignDate),
    })) ?? [];

  return (
    <Paper sx={{ p: 2, borderRadius: "10px" }}>
      <Typography variant="h5" color="#262626" mb="30px">
        {t("recentContractsTitle")}
      </Typography>
      <CssDataGridResponsive>
        <DataGrid
          disableRowSelectionOnClick
          isRowSelectable={() => false}
          hideFooterSelectedRowCount
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          rows={rows}
          columns={columns}
          sx={{
            minWidth: "700px",
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
    </Paper>
  );
}
