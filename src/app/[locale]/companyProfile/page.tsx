import { getBaseUrl } from "@/utils/getUrl";
import {
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { cookies } from "next/headers";
import { Paper } from "@mui/material";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Şirket Profili - Lisans ve Paket Bilgileri | Dikont",
  description:
    "Şirketin aktif durumu, lisans süresi, doğrulama tipi ve mevcut abonelik paketi gibi bilgileri görüntüleyin. Dikont ile kurumsal dijital sözleşme yönetimini yönetin.",
  keywords: [
    "şirket profili",
    "kurumsal hesap",
    "lisans süresi",
    "paket bilgileri",
    "abonelik tipi",
    "dikont şirket yönetimi",
    "e-posta doğrulama",
    "dijital kontrat paketi",
  ],
  alternates: {
    canonical: "https://www.dikont.com/tr/companyProfile",
    languages: {
      "tr-TR": "https://www.dikont.com/tr/companyProfile",
      "en-US": "https://www.dikont.com/en/companyProfile",
    },
  },
};

type CompanyInfo = {
  companyId: number;
  compName: string;
  compDescription: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  totalUsers: number;
  totalDocumentRights: number;
  totalAITokens: number; // kalan AI kullanım hakkı
  totalDocumentGroups: number;
  totalSignedGroups: number;
  groupCompletionRate: number; // %
  totalDocumentPages: number;
  totalSignedPages: number;
  pageCompletionRate: number; // %
  firstDocumentSent: string;
  lastDocumentSigned: string;
};
const nf = (v: number | string) =>
  typeof v === "number" ? new Intl.NumberFormat("tr-TR").format(v) : v;

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
}) {
  const nf = (v: number | string) =>
    typeof v === "number" ? new Intl.NumberFormat("tr-TR").format(v) : v;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        transition: "box-shadow .2s ease",
        "&:hover": {
          boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Typography fontSize={13} color="text.secondary">
        {label}
      </Typography>

      <Typography fontWeight={800} fontSize={24} lineHeight={1.1}>
        {nf(value)}
      </Typography>

      {sublabel ? (
        <Typography fontSize={12} color="text.secondary">
          {sublabel}
        </Typography>
      ) : null}
    </Paper>
  );
}

function ProgressStat({
  label,
  percent,
  detail,
  color = "primary",
}: {
  label: string;
  percent: number;
  detail?: string;
  color?: "primary" | "success" | "warning" | "info";
}) {
  const safe = Number.isFinite(percent)
    ? Math.max(0, Math.min(100, percent))
    : 0;
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography fontWeight={700}>{label}</Typography>
        <Chip
          color={color}
          variant="outlined"
          label={`${safe.toFixed(2)}%`}
          size="small"
        />
      </Stack>
      <LinearProgress
        variant="determinate"
        value={safe}
        color={color}
        sx={{
          height: 8,
          borderRadius: 99,
          backgroundColor: "grey.100",
          "& .MuiLinearProgress-bar": { borderRadius: 99 },
        }}
      />
      {detail ? (
        <Typography fontSize={12} color="text.secondary" mt={1}>
          {detail}
        </Typography>
      ) : null}
    </Paper>
  );
}

function formatDate(s?: string) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    // TR format (GG.AA.YYYY SS:dd)
    return d.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

export default async function CompanyProfile() {
  const t = await getTranslations("companyProfile");

  const cookieStore = cookies();
  const userCookie = (await cookieStore).get("user");
  const token = (await cookieStore).get("token")?.value ?? "";

  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;
  const userRole = user?.userRoles?.[0];
  const userId = user?.user?.id;

  const res = await fetch(getBaseUrl("/api/analytics/getCompanyInfo"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ role: userRole, userId }),
    cache: "no-store",
  });

  if (res.status !== 200) {
    redirect("/api/auth/logout?next=/login");
  }
  const data: CompanyInfo | null = res.ok ? await res.json() : null;

  if (!data) {
    return (
      <Box bgcolor="white" p={2} border="1px solid #E0E0E0" borderRadius="8px">
        <Typography>{t("errorLoadFailed")}</Typography>
      </Box>
    );
  }

  const {
    compName,
    compDescription,
    isActive,
    totalUsers,
    totalDocumentGroups,
    totalSignedGroups,
    groupCompletionRate,
    totalDocumentPages,
    totalSignedPages,
    pageCompletionRate,
    totalDocumentRights,
    totalAITokens,
    firstDocumentSent,
    lastDocumentSigned,
    createdAt,
    updatedAt,
  } = data;

  return (
    <Box bgcolor="white" p="20px">
      <Grid container spacing={2}>
        {/* SOL: Şirket Kartı */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            border="1px solid #E0E0E0"
            borderRadius="8px"
            p="24px"
            height={{ xs: "auto", md: "100%" }}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 2,
              p: 3,
              height: { xs: "auto", md: "100%" },
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.02) 100%)",
            }}
          >
            <Stack alignItems="center" gap={1.5}>
              <img
                src="/Dikont-Logo.svg"
                alt="logo"
                style={{ width: 120, height: "auto" }}
              />
              <Typography variant="h6" fontWeight={700} textAlign="center">
                {compName || t("companyNamePlaceholder")}
              </Typography>
              <Chip
                label={isActive ? t("statusActive") : t("statusInactive")}
                color={isActive ? "success" : "default"}
                variant="filled"
                size="small"
              />
              {compDescription ? (
                <Typography
                  fontSize={14}
                  color="text.secondary"
                  textAlign="center"
                >
                  {compDescription}
                </Typography>
              ) : null}
              <Divider flexItem sx={{ my: 1.5 }} />
              <Stack spacing={0.5} sx={{ width: "100%" }}>
                <Typography fontSize={12} color="text.secondary">
                  {t("createdAtLabel")}
                </Typography>
                <Typography fontSize={14}>{formatDate(createdAt)}</Typography>
              </Stack>
              <Stack spacing={0.5} sx={{ width: "100%" }}>
                <Typography fontSize={12} color="text.secondary">
                  {t("updatedAtLabel")}
                </Typography>
                <Typography fontSize={14}>{formatDate(updatedAt)}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>

        {/* SAĞ: Özet KPI’lar */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography mb={2} fontSize={18} fontWeight={700}>
              {t("titleStats")}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard label={t("totalUsers")} value={totalUsers ?? 0} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  label={t("totalGroups")}
                  value={totalDocumentGroups ?? 0}
                  sublabel={t("completedPrefix", {
                    count: nf(totalSignedGroups ?? 0),
                  })}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  label={t("aiRemaining")}
                  value={totalAITokens ?? 0}
                  sublabel={t("aiRemainingHelp")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  label={t("totalPages")}
                  value={totalDocumentPages ?? 0}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  label={t("signedPages")}
                  value={totalSignedPages ?? 0}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <StatCard
                  label={t("documentRights")}
                  value={totalDocumentRights ?? 0}
                  sublabel={t("documentRightsHelp")}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* ALT: İlerleme & Zaman Çizgisi */}
      <Grid container spacing={2} mt={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography mb={2} fontSize={18} fontWeight={700}>
              {t("progressTitle")}
            </Typography>

            <Stack gap={2}>
              <ProgressStat
                label={t("groupCompletion")}
                percent={groupCompletionRate ?? 0}
                detail={t("groupDetail", {
                  signed: nf(totalSignedGroups ?? 0),
                  total: nf(totalDocumentGroups ?? 0),
                })}
                color="info"
              />

              <ProgressStat
                label={t("pageCompletion")}
                percent={pageCompletionRate ?? 0}
                detail={t("pageDetail", {
                  signed: nf(totalSignedPages ?? 0),
                  total: nf(totalDocumentPages ?? 0),
                })}
                color="success"
              />
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component={Paper}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography mb={2} fontSize={18} fontWeight={700}>
              {t("timelineTitle")}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography fontSize={14} color="#8c8c8c">
                    {t("firstDocSent")}
                  </Typography>
                  <Typography fontSize={14}>
                    {formatDate(firstDocumentSent)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Typography fontSize={14} color="#8c8c8c">
                    {t("lastDocSigned")}
                  </Typography>
                  <Typography fontSize={14}>
                    {formatDate(lastDocumentSigned)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack gap={1}>
              <Typography fontSize={14} color="#8c8c8c">
                {t("packageTitle")}
              </Typography>

              <Stack direction="row" alignItems="center" gap={1}>
                <Typography fontSize={14}>{t("packageCurrent")}</Typography>
                <Chip
                  label={t("packageUnlimited")}
                  size="small"
                  sx={{
                    bgcolor: "info.50",
                    color: "info.dark",
                    border: "1px solid",
                    borderColor: "info.100",
                    borderRadius: "999px",
                    height: 28,
                    "& .MuiChip-label": { px: 1.5, fontWeight: 700 },
                  }}
                />
              </Stack>

              <Typography mt={1} fontSize={14} color="#8c8c8c">
                {t("licenseEnd")}
              </Typography>
              <Typography fontSize={14}>{t("notSpecified")}</Typography>

              <Typography mt={1} fontSize={14} color="#8c8c8c">
                {t("verificationType")}
              </Typography>
              <Typography fontSize={14}>{t("verificationEmail")}</Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* İnce şerit: AI & Haklar özet */}
      <Box
        mt={2}
        component={Paper}
        elevation={0}
        sx={{
          p: "12px",
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          bgcolor: "grey.50",
        }}
      >
        <Chip
          color="info"
          variant="outlined"
          label={t("summaryAiTokens", { count: nf(totalAITokens ?? 0) })}
        />
        <Chip
          color="default"
          variant="outlined"
          label={t("summaryDocumentRights", {
            count: nf(totalDocumentRights ?? 0),
          })}
        />
        <Chip
          color="info"
          variant="outlined"
          label={`${t("summaryGroupPercent")} ${(
            groupCompletionRate ?? 0
          ).toFixed(2)}%`}
        />
        <Chip
          color="success"
          variant="outlined"
          label={`${t("summaryPagePercent")} ${(
            pageCompletionRate ?? 0
          ).toFixed(2)}%`}
        />
      </Box>
    </Box>
  );
}
