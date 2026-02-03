import { CustomCard } from "@/ui/Card/CustomCard";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

import TimerIcon from "@mui/icons-material/Timer";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DrawIcon from "@mui/icons-material/Draw";

type Props = {
  total: number;
  signed: number;
  pending: number;
  rejected: number;
};

type BadgeColor = "green" | "orange" | "red" | "dark";

const badgeSx: Record<BadgeColor, any> = {
  green: {
    backgroundColor: "rgba(46, 125, 50, 0.6)",
    border: "1px solid rgba(46, 125, 50, 0.6)",
    color: "rgb(255, 255, 255)",
    boxShadow: "0 10px 22px rgba(46,125,50,0.18)",
  },
  orange: {
    backgroundColor: "rgba(237, 108, 2, 0.6)",
    border: "1px solid rgba(237, 108, 2, 0.6)",
    color: "rgb(255, 255, 255)",
    boxShadow: "0 10px 22px rgba(237,108,2,0.18)",
  },
  red: {
    backgroundColor: "rgba(211, 47, 47, 0.6)",
    border: "1px solid rgba(211, 47, 47, 0.6)",
    color: "rgb(255, 255, 255)",
    boxShadow: "0 10px 22px rgba(211,47,47,0.18)",
  },
  dark: {
    backgroundColor: "rgba(44, 23, 55, 0.75)", // #2C1737
    border: "1px solid rgba(44, 23, 55, 0.6)",
    color: "#fff",
    boxShadow: "0 10px 22px rgba(44,23,55,0.35)",
  },
};

type Item = {
  key: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  badge: BadgeColor;
};

export default function ContractInfo({ data }: { data: Props }) {
  const t = useTranslations("dashboard");

  const items: Item[] = [
    {
      key: "total",
      label: t("totalContracts"),
      value: data.total ?? 0,
      icon: <EditDocumentIcon sx={{ fontSize: 25 }} />,
      badge: "green",
    },
    {
      key: "signed",
      label: t("totalSigned"),
      value: data.signed ?? 0,
      icon: <DrawIcon sx={{ fontSize: 25 }} />,
      badge: "dark",
    },
    {
      key: "pending",
      label: t("pendingSignatures"),
      value: data.pending ?? 0,
      icon: <TimerIcon sx={{ fontSize: 25 }} />,
      badge: "orange",
    },
    {
      key: "rejected",
      label: t("rejectedContracts"),
      value: data.rejected ?? 0,
      icon: <UnpublishedIcon sx={{ fontSize: 25 }} />,
      badge: "red",
    },
  ];

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      {items.map((it) => (
        <Grid key={it.key} size={{ xs: 12, sm: 6, md: 3 }}>
          <CustomCard>
            <CardContent
              sx={{
                // kartın içinde dengeli "tam ortada" dursun
                minHeight: 88,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 1.2,
                py: 2,
                px: 2.2,
              }}
            >
              {/* ÜST: Başlık */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "rgb(255, 255, 255)",
                }}
              >
                {it.label}
              </Typography>

              {/* ALT: Sol sayı + sağ icon (aynı hizada) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1,
                    color: "rgb(255, 255, 255)",
                  }}
                >
                  {it.value}
                </Typography>

                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "999px",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 auto",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    ...badgeSx[it.badge],
                  }}
                >
                  {it.icon}
                </Box>
              </Box>
            </CardContent>
          </CustomCard>
        </Grid>
      ))}
    </Grid>
  );
}
