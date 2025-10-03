import { CustomCard } from "@/ui/Card/CustomCard";
import { CardContent, Grid, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

type Props = {
  total: number;
  signed: number;
  pending: number;
};

export default function ContractInfo({ data }: { data: Props }) {
  const t = useTranslations("dashboard");

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" color="#00b16a">
              {data.total ?? 0}
            </Typography>
            <Typography variant="subtitle2">{t("totalContracts")}</Typography>
          </CardContent>
        </CustomCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" color="#00b16a">
              {data.signed ?? 0}
            </Typography>
            <Typography variant="subtitle2">{t("totalSigned")}</Typography>
          </CardContent>
        </CustomCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomCard>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" color="#00b16a">
              {data.pending ?? 0}
            </Typography>
            <Typography variant="subtitle2">
              {t("pendingSignatures")}
            </Typography>
          </CardContent>
        </CustomCard>
      </Grid>
    </Grid>
  );
}
