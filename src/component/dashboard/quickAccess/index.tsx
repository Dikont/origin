"use client";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArchiveIcon from "@mui/icons-material/Archive";
import InsightsIcon from "@mui/icons-material/Insights";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { CustomCardQuickAccess } from "@/ui/Card/CustomCard";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function QuickAccess() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const cardItems = [
    {
      title: t("contractsTitle"),
      desc: t("contractsDesc"),
      icon: AddIcon,
      href: "/followContracts",
    },
    {
      title: t("newContractTitle"),
      desc: t("newContractDesc"),
      icon: TextSnippetIcon,
      href: "/createContract",
    },
    {
      title: t("verifyTitle"),
      desc: t("verifyDesc"),
      icon: CheckCircleIcon,
      href: "/confirmationOfDocument",
    },
    {
      title: t("aiEnhanceTitle"),
      desc: t("aiEnhanceDesc"),
      icon: InsightsIcon,
      href: "/aiSupport",
    },
    {
      title: t("archiveTitle"),
      desc: t("archiveDesc"),
      icon: ArchiveIcon,
      href: "/templates",
    },
    {
      title: t("reportsTitle"),
      desc: t("reportsDesc"),
      icon: AssessmentIcon,
      href: "/reports",
    },
  ];

  return (
    <>
      <Typography variant="h5">{t("quickAccessTitle")}</Typography>
      <Grid container rowSpacing={2} columnSpacing={2}>
        {cardItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <CustomCardQuickAccess
                onClick={() => router.push(`/${locale}${item.href}`)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Icon sx={{ fontSize: "36px", color: "blue" }} />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="subtitle1">{item.title}</Typography>
                    <Typography variant="subtitle2">{item.desc}</Typography>
                  </Box>
                </CardContent>
              </CustomCardQuickAccess>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
