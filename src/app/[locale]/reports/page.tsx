import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { getBaseUrl } from "@/utils/getUrl";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import * as XLSX from "xlsx"; // <-- yeni
import { redirect } from "next/navigation";

export const metadata = {};

type Summary = {
  period: "today" | "week" | "month" | "allTime";
  total: number;
  signed: number;
  unsigned: number;
  fileName: string;
};

export default async function Index() {
  const t = await getTranslations("reports");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;

  const companyId = user?.compOfUser?.id;
  const userId = user?.user?.id;
  const role = user?.userRoles?.[0]; // <-- ilk rol
  const shouldSendUserId = role !== "CompanySuperUser"; // kural

  const periods: Array<Summary["period"]> = [
    "today",
    "week",
    "month",
    "allTime",
  ];
  const periodLabel: Record<Summary["period"], string> = {
    today: t("period_today"),
    week: t("period_week"),
    month: t("period_month"),
    allTime: t("period_allTime"),
  };

  // XLSX veya CSV'yi parse et
  const parseReport = async (res: Response, period: Summary["period"]) => {
    const ab = await res.arrayBuffer();
    let rows: any[] = [];

    try {
      // 1) XLSX parse
      const wb = XLSX.read(new Uint8Array(ab), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
    } catch {
      // 2) CSV fallback
      const csv = Buffer.from(ab).toString("utf-8");
      const lines = csv.trim().split(/\r?\n/);
      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
      rows = lines.slice(1).map((line) => {
        const cols = line.split(",").map((v) => v.replace(/^"|"$/g, ""));
        const obj: any = {};
        headers.forEach((h, i) => (obj[h] = cols[i]));
        return obj;
      });
    }

    let total = 0;
    let signed = 0;
    let unsigned = 0;

    for (const r of rows) {
      const val =
        r.IsSigned ??
        r.Signed ??
        r["is_signed"] ??
        r["İmzalı"] ??
        r["isSigned"];
      const isSigned =
        typeof val === "boolean"
          ? val
          : typeof val === "string"
          ? val.trim().toLowerCase() === "true"
          : false;

      total++;
      if (isSigned) signed++;
      else unsigned++;
    }

    const fileName = `sign-report-${period}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;

    return { period, total, signed, unsigned, fileName };
  };

  const results = await Promise.all(
    periods.map(async (p) => {
      const body: any = {
        period: p,
        companyId,
      };
      if (shouldSendUserId) body.userId = userId;

      const res = await fetch(getBaseUrl("/api/analytics/exportSignReport"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (!res.ok) {
        redirect("/api/auth/logout?next=/login");
        return { period: p, total: 0, signed: 0, unsigned: 0, fileName: "" };
      }

      return parseReport(res, p);
    })
  );

  return (
    <Box p={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t("page_title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("page_subtitle")}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {results.map(({ period, total, signed, unsigned, fileName }) => (
          <Grid key={period} size={12}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <BarChartIcon color="primary" fontSize="large" />
                  <Typography variant="h6" fontWeight={600}>
                    {periodLabel[period]}
                  </Typography>
                  <Box flex={1} />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    component="a"
                    href={`/api/analytics/dowloandExportSignReport?period=${period}${
                      shouldSendUserId && userId
                        ? `&userId=${encodeURIComponent(userId)}`
                        : ""
                    }&companyId=${encodeURIComponent(companyId)}`}
                  >
                    {t("button_download_report")}
                  </Button>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("label_total")}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="success.main"
                      >
                        {signed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("label_signed")}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="warning.main"
                      >
                        {unsigned}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("label_pending")}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <InsertDriveFileIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {fileName}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
