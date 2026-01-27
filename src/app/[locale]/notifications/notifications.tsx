"use client";

import { Box, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Davet/Onay için
import WarningIcon from "@mui/icons-material/Warning"; // Hata/Red için
import LockIcon from "@mui/icons-material/Lock"; // AuthCode için
import BlockIcon from "@mui/icons-material/Block"; // Red için alternatif
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
};

// Gelen Veri Tipi
interface Notif {
  id: string | number;
  documentGroupName?: string | null;
  documentGroupId?: string | number | null;
  sentTo?: string | null;
  sentDate?: string | null;
  mailType?: string | null; // <-- Backendden gelen tip
  subject?: string | null; // <-- Backendden gelen başlık
}

export default function Page({ items }: { items: Notif[] }) {
  const t = useTranslations("notifications");

  // --- MANTIK FONKSİYONU ---
  // MailType'a göre İkon, Renk ve Etiket (Chip) metni döndürür
  const getStyle = (type: string | null | undefined) => {
    switch (type) {
      case "AuthCode":
        return {
          icon: <LockIcon sx={{ color: "#ed6c02" }} />, // Turuncu Kilit
          bgColor: "#fff4e5",
          textColor: "#663c00",
          label: "Doğrulama Kodu",
        };
      case "Rejection":
        return {
          icon: <BlockIcon sx={{ color: "#d32f2f" }} />, // Kırmızı Engel
          bgColor: "#ffebee",
          textColor: "#c62828",
          label: "Reddedildi",
        };
      case "Invitation":
        return {
          icon: <CheckCircleIcon sx={{ color: "#2e7d32" }} />, // Yeşil Tik
          bgColor: "#edf7ed",
          textColor: "#1e4620",
          label: "İmza Daveti",
        };
      case "Reminder":
        return {
          icon: <NotificationsActiveIcon sx={{ color: "#0288d1" }} />, // Mavi Zil
          bgColor: "#e1f5fe",
          textColor: "#01579b",
          label: "Hatırlatma",
        };
      default:
        // Tanımsız veya null ise (Eski loglar için)
        return {
          icon: <MailOutlineIcon sx={{ color: "#757575" }} />, // Gri Zarf
          bgColor: "#f5f5f5",
          textColor: "#616161",
          label: "Bildirim",
        };
    }
  };

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
          {items.map((n) => {
            // Her satır için stil hesapla
            const style = getStyle(n.mailType);

            return (
              <Paper
                key={n.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, borderColor: UI.cardBorder }}
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
                        label={style.label} // "Doğrulama Kodu", "Reddedildi" vs.
                        sx={{
                          bgcolor: style.bgColor,
                          color: style.textColor,
                          fontWeight: 600,
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
