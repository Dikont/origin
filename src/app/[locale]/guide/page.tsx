import {
  Box,
  Button,
  Card,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import DownloadIcon from "@mui/icons-material/Download";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
export const metadata = {
  title: "Kullanıcı Kılavuzu - Dikont'u Adım Adım Keşfedin",
  description:
    "Dikont'u en verimli şekilde kullanmak için hazırlanan kullanıcı kılavuzunu inceleyin. Hesap oluşturma, sözleşme yönetimi, e-posta entegrasyonu ve raporlama adımlarını öğrenin.",
  keywords: [
    "dikont kılavuz",
    "dikont kullanıcı rehberi",
    "nasıl hesap oluştururum",
    "sözleşme yönetimi nasıl yapılır",
    "e-posta entegrasyonu dikont",
    "dikont kullanımı",
    "dikont onboarding",
    "dikont eğitim",
    "adım adım dijital sözleşme",
  ],
  alternates: {
    canonical: "https://www.dikont.com/tr/guide",
    languages: {
      "tr-TR": "https://www.dikont.com/tr/guide",
      "en-US": "https://www.dikont.com/en/guide",
      "nl-NL": "https://www.dikont.com/nl/guide",
    },
  },
};

const steps = [
  "Başlangıç",
  "Sözleşme Yönetimi",
  "E-posta Entegrasyonu",
  "Raporlama",
];
const contents = ["Hesap Oluşturma", "Giriş Yapma", "Profil Ayarları"];

export default function UserGuideStep() {
  return (
    <Box sx={{ p: "20px", borderRadius: 2 }} bgcolor="white">
      {/* Başlık ve Progress */}
      <Card sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Dikont Kullanıcı Kılavuzu
        </Typography>
        <Typography mb={2}>
          Adım adım Dikont'u keşfedin ve en iyi şekilde kullanın.
        </Typography>
        <LinearProgress variant="determinate" value={25} />
        <Typography textAlign="right" fontSize="0.875rem" mt={1}>
          %0 Tamamlandı
        </Typography>
      </Card>

      {/* Stepper */}
      <Stepper activeStep={0} alternativeLabel sx={{ mb: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* İçerik ve İçindekiler */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              height: {
                xs: "100%",
                lg: "200px",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography fontWeight="bold">Başlangıç</Typography>
              <Chip label="1/3" color="primary" size="small" />
            </Box>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Hesap Oluşturma
            </Typography>
            <Typography mb={2}>
              Dikont’a nasıl kayıt olunur ve hesap oluşturulur.
            </Typography>
            <Box display="flex" gap={2}>
              <IconButton color="primary">
                <PlayCircleIcon />
              </IconButton>
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
              <IconButton color="primary">
                <HelpOutlineIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              height: {
                xs: "100%",
                lg: "200px",
              },
            }}
          >
            <Typography fontWeight="bold" mb={2}>
              İçindekiler
            </Typography>
            <List dense>
              {contents.map((item, index) => (
                <ListItem key={item}>
                  <ListItemIcon>
                    {index === 0 ? (
                      <RadioButtonCheckedIcon color="primary" />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </ListItemIcon>
                  {/* <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      color: index === 0 ? "primary" : "text.primary",
                      fontWeight: index === 0 ? "bold" : "normal",
                    }}
                  /> */}
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation */}
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button startIcon={<ArrowBackIcon />} disabled>
          Geri
        </Button>
        <Button variant="contained" endIcon={<ArrowForwardIcon />}>
          İleri
        </Button>
      </Box>
    </Box>
  );
}
