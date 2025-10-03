import { Box } from "@mui/material";
import { cookies } from "next/headers";
import QuickAccess from "@/component/dashboard/quickAccess";
import { getBaseUrl } from "@/utils/getUrl";
import ContractInfo from "@/component/dashboard/contractInfo";
import ContractInfoTwo from "@/component/dashboard/contractInfoTwo";
import ChartComp from "@/component/dashboard/chartComp";
import Banner from "@/component/dashboard/banner";
import DataGrid from "@/component/dashboard/dataGrid";
import * as XLSX from "xlsx";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Dikont Dashboard - Dijital Sözleşme ve İmza Takip Paneli",
  description:
    "Dikont dijital sözleşme yönetimi ve imzalama platformuna hoş geldiniz. Tüm sözleşmelerinizi ve imzalama işlemlerinizi bu panelden takip edebilirsiniz.",
  keywords: [
    "Dikont",
    "dijital sözleşme",
    "sözleşme imzalama",
    "imza takibi",
    "AI belge geliştirme",
    "dijital dönüşüm",
    "sözleşme arşivi",
    "imza doğrulama",
    "raporlama",
  ],
  alternates: {
    canonical: "/tr/dashboard",
    languages: {
      tr: "/tr/dashboard",
      en: "/en/dashboard",
    },
  },
};

export default async function Dashboard() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  const token = cookieStore.get("token")?.value ?? "";
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie?.value))
    : null;
  const userRole = userCookie
    ? JSON.parse(decodeURIComponent(userCookie?.value))?.userRoles[0]
    : null;
  const companyId = user?.compOfUser?.id;
  const userId = user?.user?.id;
  const role = user?.userRoles?.[0]; // <-- ilk rol
  const shouldSendUserId = role !== "CompanySuperUser";

  const body: any = {
    period: "allTime",
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

  const ab = await res.arrayBuffer();

  let rows: any[] | null = null;

  try {
    const wb = XLSX.read(new Uint8Array(ab), { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" }); // header'lı JSON
  } catch {
    // 2) XLSX parse edilemezse (eski ortam CSV olabilir), CSV'ye düş
    const csv = Buffer.from(ab).toString("utf-8");
    rows = csvToRows(csv); // aşağıda
  }

  const getSignatureAnalyticsData = rowsToStats(rows);
  const report = rowsToDetailedReport(rows);
  const getUserDocumentTakip = await fetch(
    getBaseUrl("/api/getDocumentTakip"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: user?.user.id,
        userRole: userRole,
      }),
    }
  );

  if (getUserDocumentTakip.status !== 200) {
    redirect("/api/auth/logout?next=/login");
  }
  const getUserDocumentTakipData = await getUserDocumentTakip.json();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Banner user={user.user} />
      <ContractInfo data={getSignatureAnalyticsData} />
      <QuickAccess />
      <ChartComp data={report} />
      {getUserDocumentTakipData.length > 0 && (
        <DataGrid data={getUserDocumentTakipData} />
      )}
    </Box>
  );
}

function csvToRows(csv: string) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((v) => v.replace(/^"|"$/g, ""));
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = cols[i]));
    return obj;
  });
}

function rowsToStats(rows: any[]) {
  let total = 0,
    signed = 0,
    pending = 0;

  for (const r of rows) {
    const isSigned =
      normBool(r.IsSigned) ??
      normBool(r.Signed) ??
      normBool(r["is_signed"]) ??
      false;

    total++;
    if (isSigned) signed++;
    else pending++;
  }
  return { total, signed, pending };
}

function rowsToDetailedReport(rows: any[]) {
  let delivered = 0,
    inviteOpened = 0,
    signed = 0,
    pending = 0;
  const byRole: Record<string, number> = {};
  const byRoleSigned: Record<string, number> = {};
  const timeSeries: Record<string, number> = {};
  const timeSeriesDelivered: Record<string, number> = {};
  const timeSeriesSigned: Record<string, number> = {};

  for (const r of rows) {
    const isSigned =
      normBool(r.IsSigned) ??
      normBool(r.Signed) ??
      normBool(r["is_signed"]) ??
      false;

    const createdAt =
      r.CreatedAt || r.createdAt || r.Date || r["Created At"] || "";
    const day =
      typeof createdAt === "string" && createdAt.includes("T")
        ? createdAt.split("T")[0] + "T00:00:00"
        : String(createdAt).slice(0, 10) + "T00:00:00";

    delivered++;
    if (isSigned) signed++;
    else pending++;

    const role = r.Role || r.role || "CompanySuperUser";
    byRole[role] = (byRole[role] || 0) + 1;
    if (isSigned) byRoleSigned[role] = (byRoleSigned[role] || 0) + 1;

    timeSeries[day] = (timeSeries[day] || 0) + 1;
    timeSeriesDelivered[day] = (timeSeriesDelivered[day] || 0) + 1;
    if (isSigned) timeSeriesSigned[day] = (timeSeriesSigned[day] || 0) + 1;
  }

  const toArr = (obj: Record<string, number>) =>
    Object.entries(obj).map(([day, count]) => ({ day, count }));

  return {
    delivered,
    inviteOpened,
    signed,
    pending,
    byRole,
    byRoleSigned,
    timeSeries: toArr(timeSeries),
    timeSeriesDelivered: toArr(timeSeriesDelivered),
    timeSeriesSigned: toArr(timeSeriesSigned),
  };
}

function normBool(v: any): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "evet"].includes(s)) return true;
    if (["false", "0", "no", "hayir", "hayır"].includes(s)) return false;
  }
  return null;
}
