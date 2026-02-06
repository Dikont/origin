"use client";

import { Box, CardContent, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import { Paper, Stack, Grid, Chip } from "@mui/material";
import { useTranslations } from "next-intl";
import { alpha } from "@mui/material/styles";
import { CustomBannerCard } from "@/ui/Card/CustomCard";

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
};

interface Notif {
  id: string | number;
  documentGroupName?: string | null;
  documentGroupId?: string | number | null;
  sentTo?: string | null;
  sentDate?: string | null;
  mailType?: "Invitation" | "Completed" | "Rejection" | null;
  subject?: string | null;
}

export default function Page({ items }: { items: Notif[] }) {
  const t = useTranslations("notifications");

  console.log(items);
  // MailType'a göre İkon, Renk ve Etiket (Chip) metni döndürür
  const getStyle = (type: string | null | undefined) => {
    switch (type) {
      case "Invitation": {
        const main = "#0288d1";
        return {
          icon: <NotificationsIcon sx={{ color: main }} />,
          chipText: "#01579b",
          label: "Yeni bir imza daveti yolladınız",
          cardBg: alpha(main, 0.06),
          cardBorder: alpha(main, 0.22),
        };
      }

      case "Completed": {
        const main = "#2e7d32";
        return {
          icon: <CheckCircleIcon sx={{ color: main }} />,
          chipText: "#1e4620",
          label: "Belge tüm taraflarca imzalandı",
          cardBg: alpha(main, 0.06),
          cardBorder: alpha(main, 0.22),
        };
      }

      case "Rejection": {
        const main = "#d32f2f";
        return {
          icon: <BlockIcon sx={{ color: main }} />,
          chipText: "#c62828",
          label: "Belge reddedildi",

          cardBg: alpha(main, 0.06),
          cardBorder: alpha(main, 0.22),
        };
      }

      default: {
        return {
          icon: <MailOutlineIcon sx={{ color: "#757575" }} />,
          chipText: "#616161",
          label: "Bildirim",
          cardBg: "#fff",
          cardBorder: UI.cardBorder,
        };
      }
    }
  };

  return (
    <div>
      <Box mb="20px">
        <CustomBannerCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            {/* SOL: Başlık */}
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 900,
              }}
            >
              {t("page_title")}
            </Typography>

            <NotificationsActiveIcon
              sx={{
                color: "#fff",
                fontSize: 36,
                opacity: 0.9,
              }}
            />
          </CardContent>
        </CustomBannerCard>
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
          <Typography variant="body1" fontSize={"14px"} fontWeight={600}>
            {t("empty_state_title")}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((n) => {
            // Her satır için stil hesapla
            const style = getStyle(n.mailType);

            return (
              <Paper
                key={n.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: style.cardBorder,
                  bgcolor: style.cardBg,
                  transition: "transform .15s ease, box-shadow .15s ease",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* SOL KISIM: İkon ve Chip */}
                  <Grid size={{ xs: 12, lg: 3 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      {/* Dinamik İkon */}
                      {style.icon}

                      {/* Dinamik Chip (Etiket) */}
                      <Chip
                        size="small"
                        label={style.label}
                        sx={{
                          color: style.chipText,
                          fontWeight: 700,
                          backgroundColor: "transparent",
                          borderRadius: 0,
                          fontSize: 14,
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* ORTA KISIM: Konu ve Detay */}
                  <Grid size={{ xs: 12, lg: 5 }}>
                    <Stack spacing={0.5}>
                      {/* BAŞLIK: Backend'den gelen SUBJECT */}
                      <Typography variant="body1" fontWeight={600}>
                        {n.subject || "Konu Belirtilmemiş"}
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <DescriptionIcon
                          fontSize="small"
                          sx={{ color: "#6b7280" }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {n.documentGroupName || "-"}
                          <span
                            style={{ fontSize: "0.85em", marginLeft: "4px" }}
                          >
                            (ID: {n.documentGroupId})
                          </span>
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <MailOutlineIcon
                          fontSize="small"
                          sx={{ color: "#6b7280" }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {n.sentTo || "-"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* SAĞ KISIM: Tarih */}
                  <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack
                      direction={{ xs: "row", lg: "column" }}
                      justifyContent={{ xs: "space-between", lg: "flex-end" }}
                      alignItems={{ xs: "center", lg: "flex-end" }}
                      sx={{ height: "100%" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        <strong>{t("sent_label")}</strong> {fmt(n.sentDate)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      )}
    </div>
  );
}
