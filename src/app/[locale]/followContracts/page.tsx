import { CustomBannerCard } from "@/ui/Card/CustomCard";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import DataGridComp from "@/component/DataGridComp/page";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Sözleşme Takip Listesi - İmza ve Durum Takibi | Dikont",
  description:
    "Oluşturduğunuz sözleşmelerin imza durumlarını, şablon bilgilerini ve oluşturulma tarihlerini kolayca takip edin. Dijital sözleşme sürecinizi yönetin.",
  keywords: [
    "sözleşme takibi",
    "imza durumu",
    "sözleşme listesi",
    "dijital sözleşme yönetimi",
    "imzalanan sözleşmeler",
    "şablon sözleşmeler",
    "dikont sözleşme takibi",
  ],
  alternates: {
    canonical: "/tr/followContracts",
    languages: {
      tr: "/tr/followContracts",
      en: "/en/followContracts",
    },
  },
};

export default async function FollowContracts() {
  const t = await getTranslations("followContracts");

  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))?.user?.id
    : null;
  const userRole = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))?.userRoles[0]
    : null;

  return (
    <Grid container rowSpacing={2} columnSpacing={2}>
      <Grid size={12}>
        <CustomBannerCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "10px",
            }}
          >
            <Box>
              <Typography variant="h5">{t("bannerTitle")}</Typography>
              <Typography>{t("bannerDesc")}</Typography>
            </Box>
            <Box></Box>
          </CardContent>
        </CustomBannerCard>
      </Grid>
      <Grid size={12}>
        <DataGridComp user={user} userRole={userRole} />
      </Grid>
    </Grid>
  );
}
