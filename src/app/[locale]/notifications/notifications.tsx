"use client";
import { Box, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DescriptionIcon from "@mui/icons-material/Description";
import { Paper, Stack, Divider, Grid, Chip } from "@mui/material";
import { useTranslations } from "next-intl";

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
const UI = {
  cardBorder: "#E0E0E0",
  primary: "#1976d2",
  tagBg: "#e8f2ff",
  tagText: "#0b63c4",
};
interface Notif {
  id: string | number;
  documentGroupName?: string | null;
  documentGroupId?: string | number | null;
  sentTo?: string | null;
  sentDate?: string | null;
}

export default function Page({ items }: { items: Notif[] }) {
  const t = useTranslations("notifications");
  return (
    <div>
      <Box display={"flex"} justifyContent={"space-between"} my="50px">
        <Box display={"flex"} alignItems={"center"}>
          <Box mr="24px">
            <NotificationsIcon style={{ fontSize: 50 }} color="primary" />
          </Box>
          <Typography variant="h1" fontSize={"24px"} fontWeight={700}>
            {t("page_title")}
          </Typography>
        </Box>
      </Box>

      {items.length === 0 ? (
        <Box
          border={`1px solid ${UI.cardBorder}`}
          borderRadius="8px"
          py="64px"
          display={"flex"}
          flexDirection="column"
          alignItems="center"
        >
          <NotificationsIcon style={{ fontSize: 80, color: "#BFBFBF" }} />
          <Typography variant="body1" fontSize={"14px"} color="textSecondary">
            {t("empty_state_title")}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((n) => (
            <Paper
              key={n.id}
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, borderColor: UI.cardBorder }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Sol ikon + tür etiketi */}
                <Grid size={{ xs: 12, lg: 3 }}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <NotificationsActiveIcon sx={{ color: UI.primary }} />
                    <Chip
                      size="small"
                      label={t("chip_reminder_sent")}
                      sx={{
                        bgcolor: UI.tagBg,
                        color: UI.tagText,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                </Grid>

                {/* Orta: sözleşme bilgisi */}
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <DescriptionIcon
                        fontSize="small"
                        sx={{ color: "#6b7280" }}
                      />
                      <Typography variant="body2">
                        <strong>{t("contract_label")}</strong>{" "}
                        {n.documentGroupName || "-"}{" "}
                        <Typography
                          component="span"
                          variant="body2"
                          color="textSecondary"
                        >
                          ({t("contract_number_label")}{" "}
                          {n.documentGroupId || "-"})
                        </Typography>
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MailOutlineIcon
                        fontSize="small"
                        sx={{ color: "#6b7280" }}
                      />
                      <Typography variant="body2">
                        <strong>{t("recipient_label")}</strong>{" "}
                        {n.sentTo || "-"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                {/* Sağ: tarih */}
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Stack
                    direction={{ xs: "row", lg: "column" }}
                    justifyContent={{ xs: "space-between", lg: "flex-end" }}
                    alignItems={{ xs: "center", lg: "flex-end" }}
                    spacing={{ xs: 0, md: 0.5 }}
                    sx={{ height: "100%" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      <strong>{t("sent_label")}</strong> {fmt(n.sentDate)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              {/* Ayrıcı çizgi */}
              <Divider sx={{ mt: 2 }} />
            </Paper>
          ))}
        </Stack>
      )}
    </div>
  );
}
