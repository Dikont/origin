import { CustomCard } from "@/ui/Card/CustomCard";
import { CardContent, Grid, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

type Props = {
  total: number;
  signed: number;
  pending: number;
  rejected: number;
};

export default function ContractInfo({ data }: { data: Props }) {
  const t = useTranslations("dashboard");

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomCard sx={{ borderLeft: "4px solid #2e7d32" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h5" color="#2e7d32">
              {data.total ?? 0}
            </Typography>
            <Typography variant="subtitle2">{t("totalContracts")}</Typography>
          </CardContent>
        </CustomCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomCard sx={{ borderLeft: "4px solid #2e7d32" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h5" color="#2e7d32">
              {data.signed ?? 0}
            </Typography>
            <Typography variant="subtitle2">{t("totalSigned")}</Typography>
          </CardContent>
        </CustomCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomCard sx={{ borderLeft: "4px solid #ed6c02" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h5" color="#ed6c02">
              {data.pending ?? 0}
            </Typography>
            <Typography variant="subtitle2">
              {t("pendingSignatures")}
            </Typography>
          </CardContent>
        </CustomCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CustomCard sx={{ borderLeft: "4px solid #d32f2f" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h5" color="#d32f2f">
              {data.rejected ?? 0}
            </Typography>
            <Typography variant="subtitle2">
              {t("rejectedContracts")}
            </Typography>
          </CardContent>
        </CustomCard>
      </Grid>
    </Grid>
  );
}
