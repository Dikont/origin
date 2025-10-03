"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";

type Company = {
  id: number;
  compName: string;
  compDescription: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export default function CompaniesGrid() {
  const [rows, setRows] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/getAllCompanies", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = await res.json();
      const items: Company[] = Array.isArray(data) ? data : [];
      setRows(items);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.compName?.toLowerCase().includes(q) ||
        r.compDescription?.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const columns = useMemo<GridColDef<Company>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 90,
        renderCell: (p: GridRenderCellParams<Company, number>) => (
          <span>{p.value ?? p.row.id ?? "-"}</span>
        ),
      },
      {
        field: "compName",
        headerName: "Şirket Adı",
        flex: 1,
        minWidth: 200,
        renderCell: (p: GridRenderCellParams<Company, string>) => {
          const v = p.value ?? p.row.compName ?? "";
          return <span title={v}>{v}</span>;
        },
      },
      {
        field: "compDescription",
        headerName: "Açıklama",
        flex: 1,
        minWidth: 280,
        renderCell: (p: GridRenderCellParams<Company, string>) => {
          const v = p.value ?? p.row.compDescription ?? "";
          return <span title={v}>{v || "-"}</span>;
        },
      },
      {
        field: "createdAt",
        headerName: "Oluşturulma",
        width: 200,
        renderCell: (p: GridRenderCellParams<Company, string>) => {
          const v = p.value ?? p.row.createdAt;
          if (!v) return <span>-</span>;
          const d = new Date(String(v));
          return (
            <span>{isNaN(d.getTime()) ? "-" : d.toLocaleString("tr-TR")}</span>
          );
        },
      },
      {
        field: "updatedAt",
        headerName: "Güncellenme",
        width: 200,
        renderCell: (p: GridRenderCellParams<Company, string>) => {
          const v = p.value ?? p.row.updatedAt;
          if (!v) return <span>-</span>;
          const d = new Date(String(v));
          return (
            <span>{isNaN(d.getTime()) ? "-" : d.toLocaleString("tr-TR")}</span>
          );
        },
      },
      {
        field: "isActive",
        headerName: "Aktif",
        width: 120,
        align: "center",
        headerAlign: "center",
        renderCell: (p: GridRenderCellParams<Company, boolean>) => {
          const v = Boolean(p.value ?? p.row.isActive);
          return (
            <Chip
              size="small"
              label={v ? "Aktif" : "Pasif"}
              color={v ? "success" : "default"}
              variant={v ? "filled" : "outlined"}
            />
          );
        },
      },
    ],
    []
  );

  return (
    <Stack gap={2}>
      {/* Filtreler */}
      <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          label="Ara (ad/açıklama)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
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
        <Button
          onClick={fetchAll}
          startIcon={<RefreshIcon />}
          variant="outlined"
          size="small"
          disabled={loading}
        >
          Yenile
        </Button>
      </Stack>

      {/* Grid */}
      <Box sx={{ height: 560, width: "100%" }} display={"flex"}>
        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 20 } },
          }}
          disableRowSelectionOnClick
          isRowSelectable={() => false}
          hideFooterSelectedRowCount
          sx={{
            "& .MuiDataGrid-row": { cursor: "default" },
            "--DataGrid-cellFocusOutline": "none",
            "--DataGrid-columnHeaderFocusOutline": "none",
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
              { outline: "none" },
          }}
        />
      </Box>
    </Stack>
  );
}
