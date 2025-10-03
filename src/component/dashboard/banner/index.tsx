import { CustomBannerCard } from "@/ui/Card/CustomCard";
import { Box, CardContent, Grid, Typography } from "@mui/material";
import { formatDateFunc } from "@/utils/common";
import { useTranslations } from "next-intl";

type Props = {
  firstName: string;
  lastName: string;
};

export default function Banner({ user }: { user: Props }) {
  const t = useTranslations("dashboard");

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
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
              <Typography variant="h5">{t("title")}</Typography>
              <Typography variant="h6">
                {t("subtitle", {
                  firstName: user.firstName,
                  lastName: user.lastName,
                })}
              </Typography>
              <Typography>{t("text")}</Typography>
              <Typography>{formatDateFunc(new Date())}</Typography>
            </Box>
            <Box></Box>
          </CardContent>
        </CustomBannerCard>
      </Grid>
    </Grid>
  );
}
