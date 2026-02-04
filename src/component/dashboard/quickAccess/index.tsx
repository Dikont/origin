"use client";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
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
      href: "/followContracts",
    },
    {
      title: t("newContractTitle"),
      desc: t("newContractDesc"),
      href: "/createContract",
    },
    {
      title: t("verifyTitle"),
      desc: t("verifyDesc"),
      href: "/confirmationOfDocument",
    },
    {
      title: t("aiEnhanceTitle"),
      desc: t("aiEnhanceDesc"),
      href: "/aiSupport",
    },
    {
      title: t("archiveTitle"),
      desc: t("archiveDesc"),
      href: "/templates",
    },
    {
      title: t("reportsTitle"),
      desc: t("reportsDesc"),
      href: "/reports",
    },
  ];

  return (
    <>
      <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 700, mb: -1.5 }}>
        {t("quickAccessTitle")}
      </Typography>

      <Grid container rowSpacing={2} columnSpacing={2}>
        {cardItems.map((item, index) => {
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <CustomCardQuickAccess
                onClick={() => router.push(`/${locale}${item.href}`)}
              >
                <CardContent
                  sx={{
                    position: "relative",
                    zIndex: 1, // overlay üstünde kalsın
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 2.5,
                    width: "100%",
                    "&:last-child": { pb: 2.5 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* metinler */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                          lineHeight: 1.2,
                          fontSize: 18,
                          mb: 0.4,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "rgba(255,255,255,0.78)",
                          lineHeight: 1.35,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>

                  {/* sağ: ok */}
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "rgba(0,0,0,0.14)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      flex: "0 0 auto",
                      transition: "transform 220ms ease",
                      ".MuiBox-root:hover &": { transform: "translateX(2px)" }, // ufak his
                    }}
                  >
                    <ChevronRightRoundedIcon sx={{ color: "#fff" }} />
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
