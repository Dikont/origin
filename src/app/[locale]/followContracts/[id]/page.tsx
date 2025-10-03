import { getBaseUrl } from "@/utils/getUrl";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { getTranslations } from "next-intl/server";
import HiddenDiv from "./hiddenDiv";
import { DownloadPdfButton } from "./downloadPdfButton";
import DownloadAllPdfButton from "./downloadAllPdfButton";
const UI = {
  primary: "#1976d2",
  headerBg: "#f3f8ff",
  successBg: "#e8f5e9",
  successBorder: "#2e7d32",
  warningBg: "#fff7e6",
  warningBorder: "#f59e0b",
};

function fmt(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtTR(dt?: string | null) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** userMetadataInfos: JSON veya "k=v|k=v" pipe-encoded string olabilir */
function parseMeta(raw: unknown): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "string" && /^[\s]*\{/.test(raw)) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  if (typeof raw === "string" && raw.includes("|") && raw.includes("=")) {
    const obj: Record<string, string> = {};
    raw.split("|").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) obj[k.trim()] = (v ?? "").trim();
    });
    return obj;
  }
  if (typeof raw === "object") return raw as any;
  return null;
}

function extractEmail(meta: any, fallbackEmail?: string | null): string | null {
  if (!meta) return fallbackEmail ?? null;
  if (meta.email) return meta.email;
  if (meta.to) return meta.to;
  if (typeof meta.lastReminderMeta === "string") {
    const m = meta.lastReminderMeta.match(/to:([^,\s]+)/i);
    if (m?.[1]) return m[1];
  }
  return fallbackEmail ?? null;
}

function extractSentAt(
  meta: any,
  signerUpdated?: string | null,
  docUpdated?: string | null
): string | null {
  return (
    meta?.sentAt || meta?.lastReminderAt || signerUpdated || docUpdated || null
  );
}
export const dynamic = "force-dynamic";
export default async function Page({ params, searchParams }: any) {
  const t = await getTranslations("followContracts");

  const { id } = await params;

  const statusRaw = await searchParams;
  const status = statusRaw.status;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? ({ value: "" } as any);

  const getDetailData = await fetch(getBaseUrl("/api/getDocDetail"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ docGId: id }),
  });

  const data = await getDetailData.json();

  const signers: Array<any> = Array.isArray(data?.documentSigners)
    ? data.documentSigners
    : [];
  const signedDocs: Array<any> = Array.isArray(data?.signedDocuments)
    ? data.signedDocuments
    : [];
  const docMeta = signedDocs[0] ?? null;

  const onlySigners = signers.filter((s) => s?.isSignature === true);

  const coverSrc = docMeta?.temporalStageDocumentPath
    ? `data:image/png;base64,${docMeta.temporalStageDocumentPath}`
    : null;

  const contractNo = docMeta?.documentGroupId ?? id;
  const createdAt = fmt(docMeta?.createdAt);
  const updatedAt = fmt(docMeta?.updatedAt);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      {/* Geri */}

      <Box sx={{ mb: 2 }} display={"flex"} justifyContent={"space-between"}>
        <Button
          LinkComponent={Link}
          href="/followContracts"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="primary"
          size="small"
        >
          {t("back")}
        </Button>
        <Box display={"flex"} gap={"20px"}>
          <DownloadPdfButton />
          {Number(status) === 100 && <DownloadAllPdfButton />}
        </Box>
      </Box>

      {/* Üst başlık */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderLeft: `4px solid ${UI.primary}`,
          background: UI.headerBg,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: UI.primary }}
          gutterBottom
        >
          {t("headerTitle")}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>{t("contractNo")}:</strong> {contractNo}
          </Typography>
          {docMeta?.documentHash && (
            <Typography variant="body2" color="text.secondary">
              <strong>{t("hash")}:</strong> {docMeta.documentHash}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            <strong>{t("createdAt")}:</strong> {createdAt}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{t("updatedAt")}:</strong> {updatedAt}
          </Typography>
        </Stack>
      </Paper>

      {/* İmzacı listesi */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: UI.primary, mb: 1 }}
        >
          {t("signersTitle")}
        </Typography>

        <Stack spacing={2}>
          {onlySigners.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t("noSigners")}
            </Typography>
          )}

          {onlySigners.map((s) => {
            const metaObj = parseMeta(s?.userMetadataInfos);

            const sentAt = extractSentAt(
              metaObj,
              s?.updatedAt,
              docMeta?.updatedAt
            );
            const emailFromMeta = extractEmail(
              metaObj,
              s?.signerMail && s.signerMail !== "-" ? s.signerMail : null
            );

            const ip =
              metaObj?.ip || metaObj?.ipAddress || metaObj?.clientIp || null;

            const ua = metaObj?.userAgent || metaObj?.ua || null;
            const platform = metaObj?.platform || null;
            const language = metaObj?.language || null;
            const tz = metaObj?.timezone || null;
            const device =
              [ua, platform, language, tz].filter(Boolean).join(" | ") || null;

            const phone =
              s?.phoneNumber && s.phoneNumber !== "-" ? s.phoneNumber : "—";

            const isDone = !!s?.isSigned;

            const status = isDone ? (
              <Chip
                label={t("status.signed")}
                color="success"
                size="small"
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                variant="filled"
              />
            ) : (
              <Chip
                label={t("status.pending")}
                size="small"
                icon={<ScheduleRoundedIcon fontSize="small" />}
                variant="filled"
                sx={{
                  bgcolor: UI.warningBg,
                  border: `1px solid ${UI.warningBorder}`,
                  color: "#8a5800",
                  fontWeight: 700,
                }}
              />
            );

            return (
              <Paper
                key={s.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderLeft: `4px solid ${
                    isDone ? UI.successBorder : UI.warningBorder
                  }`,
                  background: isDone ? UI.successBg : UI.warningBg,
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Üst kısım */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.2}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t("fieldName")}:
                      </Typography>
                      <Typography variant="subtitle1">
                        {s?.signerName && s.signerName !== "-"
                          ? s.signerName
                          : "—"}
                      </Typography>
                      {status}
                    </Stack>

                    <Grid container spacing={1.2}>
                      <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                        <Typography variant="body2">
                          <strong>{t("email")}:</strong>{" "}
                          {s?.signerMail && s.signerMail !== "-"
                            ? s.signerMail
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                        <Typography variant="body2">
                          <strong>{t("phone")}:</strong> {phone}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                        <Typography variant="body2">
                          <strong>{t("createdAt")}:</strong> {fmt(s?.createdAt)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="body2">
                          <strong>{t("updatedAt")}:</strong> {fmt(s?.updatedAt)}
                        </Typography>
                      </Grid>

                      {/* (Opsiyonel) Eski hatırlatma alanları JSON gelirse gösterilir */}
                      {metaObj &&
                        typeof metaObj.reminderCount !== "undefined" && (
                          <>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Typography variant="body2">
                                <strong>{t("reminderCount")}:</strong>{" "}
                                {typeof metaObj.reminderCount === "number"
                                  ? metaObj.reminderCount
                                  : "—"}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <Typography variant="body2">
                                <strong>{t("lastReminder")}:</strong>{" "}
                                {fmt(metaObj.lastReminderAt)}
                              </Typography>
                            </Grid>
                            {typeof metaObj.lastReminderMeta === "string" && (
                              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                                <Typography variant="body2">
                                  <strong>{t("reminderMeta")}:</strong>{" "}
                                  {metaObj.lastReminderMeta}
                                </Typography>
                              </Grid>
                            )}
                          </>
                        )}
                    </Grid>
                  </Grid>

                  {/* Detay Bilgisi */}
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed #E0E0E0" }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 0.5, sm: 3 }}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Typography variant="body2">
                          <strong>{t("sentAt")}:</strong> {fmt(sentAt)}
                        </Typography>

                        <Typography variant="body2">
                          <strong>{t("trTimestamp")}:</strong> {fmtTR(sentAt)}
                        </Typography>

                        <Typography variant="body2">
                          <strong>{t("ipAddress")}:</strong> {ip || "—"}
                        </Typography>

                        <Typography variant="body2">
                          <strong>{t("deviceInfo")}:</strong> {device || "—"}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      </Box>

      {/* İçerik (kapak görsel) */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: UI.primary, mb: 1 }}
        >
          {t("contentTitle")}
        </Typography>

        {coverSrc ? (
          <Box
            sx={{
              maxWidth: 900,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <img
              src={coverSrc}
              alt={t("coverAlt")}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("coverMissing")}
          </Typography>
        )}
      </Box>
      <HiddenDiv
        t={t}
        contractNo={contractNo}
        docMeta={docMeta}
        onlySigners={onlySigners}
      />
    </Box>
  );
}
