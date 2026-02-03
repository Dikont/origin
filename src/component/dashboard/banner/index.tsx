"use client";

import { CustomBannerCard } from "@/ui/Card/CustomCard";
import {
  Box,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import { formatDateFunc } from "@/utils/common";
import { useTranslations } from "next-intl";

type Props = {
  firstName: string;
  lastName: string;
};

type StatCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent?: "green" | "blue" | "amber";
};

function StatCard({ icon, value, label, accent = "green" }: StatCardProps) {
  const accentColor =
    accent === "green" ? "#43e97b" : accent === "blue" ? "#38bdf8" : "#fbbf24";

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: 180 },
        p: 1.5,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha("#ffffff", 0.06)} 0%, ${alpha(
          "#ffffff",
          0.03,
        )} 100%)`,
        border: `1px solid ${alpha("#ffffff", 0.08)}`,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "999px",
          display: "grid",
          placeItems: "center",
          background: `radial-gradient(circle at 30% 30%, ${alpha(
            accentColor,
            0.35,
          )} 0%, ${alpha(accentColor, 0.12)} 40%, transparent 70%)`,
          border: `1px solid ${alpha(accentColor, 0.25)}`,
          color: alpha("#ffffff", 0.92),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: alpha("#ffffff", 0.95),
            fontWeight: 800,
            fontSize: 18,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            color: alpha("#ffffff", 0.7),
            fontWeight: 600,
            fontSize: 12,
            mt: 0.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={label}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

type SustainabilityReport = {
  totalDocuments: number;
  totalPagesSaved: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  woodSavedKg: number;
  treesSaved: number;
  equivalentCarKm: string;
};

export default function Banner({
  user,
  report,
}: {
  user: Props;
  report?: SustainabilityReport | null;
}) {
  const t = useTranslations("dashboard");

  const docCount = report?.totalDocuments ?? 0;
  const waterSavedLiters = report?.waterSavedLiters ?? 0;
  const preventedKm = report?.equivalentCarKm;

  console.log(report);

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid size={12}>
        <CustomBannerCard>
          <CardContent
            sx={{
              p: 0,
              pt: 0,
              pb: 0,
              "&:last-child": {
                pb: 0, // MUI'nin ekstra bottom padding'i
              },
              position: "relative",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.25}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              {/* SOL */}
              <Box sx={{ minWidth: 280 }}>
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      sx={{
                        color: alpha("#fff", 1),
                        fontWeight: 900,
                        fontSize: { xs: 18, sm: 22 },
                      }}
                    >
                      {t("title")}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      color: alpha("#fff", 0.85),
                      fontWeight: 600,
                      fontSize: { xs: 14, sm: 16 },
                    }}
                  >
                    {t("subtitle", {
                      firstName: user.firstName,
                      lastName: user.lastName,
                    })}
                  </Typography>

                  <Typography
                    sx={{
                      color: alpha("#fff", 0.65),
                      fontSize: 13,
                      maxWidth: 450,
                    }}
                  >
                    {t("text")}
                  </Typography>

                  <Typography
                    sx={{
                      color: alpha("#fff", 0.75),
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {formatDateFunc(new Date())}
                  </Typography>
                </Stack>
              </Box>

              {/* ORTA BÖLÜCÜ */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  display: { xs: "none", md: "block" },
                  borderColor: alpha("#ffffff", 1),
                  m: 1,
                }}
              />

              {/* SAĞ KPI */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <StatCard
                  accent="green"
                  icon={<DescriptionOutlinedIcon fontSize="small" />}
                  value={`${docCount} ${t("documentBanner")}`}
                  label={t("documentBannerDesc")}
                />
                <StatCard
                  accent="blue"
                  icon={<WaterDropOutlinedIcon fontSize="small" />}
                  value={`${waterSavedLiters}L`}
                  label={t("waterBannerDesc")}
                />
                <StatCard
                  accent="amber"
                  icon={<DirectionsCarOutlinedIcon fontSize="small" />}
                  value={`${preventedKm}`}
                  label={t("carBannerDesc")}
                />
              </Stack>
            </Stack>

            {/* Alt ince çizgi */}
            <Box
              sx={{
                mt: 2,
                height: 1,
              }}
            />
          </CardContent>
        </CustomBannerCard>
      </Grid>
    </Grid>
  );
}
