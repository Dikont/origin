import { CustomCardBlue } from "@/ui/Card/CustomCard";
import { CardContent, Grid, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import SecurityIcon from "@mui/icons-material/Security";
export default function ContractInfoTwo() {
  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomCardBlue background="#2196f333">
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <EditIcon sx={{ fontSize: "44px", color: "blue" }} />
            <Typography variant="subtitle1">Belge İmzalama</Typography>
            <Typography variant="subtitle2">Belgeyi İmzala</Typography>
          </CardContent>
        </CustomCardBlue>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomCardBlue background="#4caf5033">
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <HistoryIcon sx={{ fontSize: "44px", color: "green" }} />
            <Typography variant="subtitle1">İmza Listesi</Typography>
            <Typography variant="subtitle2">İmza Detayları</Typography>
          </CardContent>
        </CustomCardBlue>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <CustomCardBlue background="#f4433633">
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <SecurityIcon sx={{ fontSize: "44px", color: "red" }} />
            <Typography variant="subtitle1">Destek</Typography>
            <Typography variant="subtitle2">Destek ve Bilgilendirme</Typography>
          </CardContent>
        </CustomCardBlue>
      </Grid>
    </Grid>
  );
}
