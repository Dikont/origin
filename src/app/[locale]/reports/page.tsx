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
import { CustomBannerCard } from "@/ui/Card/CustomCard";

export const metadata = {};

type Summary = {
  period: "today" | "week" | "month" | "allTime";
  total: number;
  signed: number;
  pending: number;
  rejected: number;
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
    let completed = 0;
    let pending = 0;
    let rejected = 0;
    const toBoolTR = (v: any): boolean => {
      if (typeof v === "boolean") return v;

      const s = String(v ?? "")
        .trim()
        .toLowerCase();

      // TR / EN / numeric ihtimaller
      if (["doğru", "dogru", "true", "yes", "evet"].includes(s)) return true;
      if (["yanlış", "yanlis", "false", "no", "hayır", "hayir"].includes(s))
        return false;

      return false;
    };

    const toStatus = (r: any): number | null => {
      const raw =
        r.Status ?? r.status ?? r["STATUS"] ?? r["Durum"] ?? r["durum"];

      if (raw === undefined || raw === null) return null;

      // number ise
      if (typeof raw === "number") return raw;

      // string ise ( "1", "0", " 1 " )
      const s = String(raw).trim();
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    };

    for (const r of rows) {
      total++;

      const st = toStatus(r);

      const isSignedRaw =
        r.IsSigned ?? r.isSigned ?? r.Signed ?? r["is_signed"] ?? r["İmzalı"];

      const isSigned = toBoolTR(isSignedRaw);

      // SENİN KURAL SETİ:
      // 1) İmzalı: IsSigned=true & Status=1
      if (st === 1 && isSigned === true) completed++;
      // 2) Bekleyen: IsSigned=false & Status=1
      else if (st === 1 && isSigned === false) pending++;
      // 3) Reddedilen: IsSigned=false & Status=0
      else if (st === 0 && isSigned === false) rejected++;
      // 4) diğerleri (garanti)
      else pending++;
    }

    const fileName = `sign-report-${period}-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;

    return { period, total, completed, pending, rejected, fileName };
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
        return {
          period: p,
          total: 0,
          completed: 0,
          pending: 0,
          rejected: 0,
          fileName: "",
        };
      }

      return parseReport(res, p);
    }),
  );

  return (
    <Box>
      <Box mb={5}>
        <CustomBannerCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",

              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: { xs: 18, sm: 22 },
                }}
              >
                {t("page_title")}
              </Typography>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: { xs: 13, sm: 14 },
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {t("page_subtitle")}
              </Typography>
            </Box>
            <Box
              component="img"
              src="/raporBanner.svg"
              alt="Sözleşme Listesi"
              sx={{
                width: { xs: 110, sm: 155 },
                height: "auto",
                flexShrink: 0, // sıkışmasın diye önemli
              }}
            />
          </CardContent>
        </CustomBannerCard>
      </Box>

      <Grid container spacing={3}>
        {results.map(
          ({ period, total, completed, pending, rejected, fileName }) => (
            <Grid key={period} size={12}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  border: 3,
                  borderColor: "#646E9F",
                  borderRadius: 4,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <BarChartIcon fontSize="large" />
                    <Typography variant="h6" fontWeight={700}>
                      {periodLabel[period]}
                    </Typography>
                    <Box flex={1} />
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      component="a"
                      href={`/api/analytics/dowloandExportSignReport?period=${period}${
                        shouldSendUserId && userId
                          ? `&userId=${encodeURIComponent(userId)}`
                          : ""
                      }&companyId=${encodeURIComponent(companyId)}`}
                      sx={{
                        py: 1,
                        px: 3,
                        borderRadius: 1,
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
                      {t("button_download_report")}
                    </Button>
                  </Stack>

                  <Divider sx={{ mb: 2, color: "#646E9F", border: 1 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box textAlign="center">
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="rgb(28, 148, 34)"
                        >
                          {total}
                        </Typography>
                        <Typography variant="body2" color="rgb(28, 148, 34)">
                          {t("label_total")}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box textAlign="center">
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="rgba(44, 23, 55, 1)"
                        >
                          {completed}
                        </Typography>
                        <Typography variant="body2" color="rgba(44, 23, 55, 1)">
                          {t("label_signed")}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box textAlign="center">
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="rgba(237, 108, 2, 1)"
                        >
                          {pending}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="rgba(237, 108, 2, 1)"
                        >
                          {t("label_pending")}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box textAlign="center">
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="rgba(211, 47, 47, 1)"
                        >
                          {rejected}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="rgba(211, 47, 47, 1)"
                        >
                          {t("label_rejected")}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2, color: "#646E9F", border: 1 }} />

                  <Stack direction="row" spacing={1} alignItems="center">
                    <InsertDriveFileIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {fileName}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ),
        )}
      </Grid>
    </Box>
  );
}
