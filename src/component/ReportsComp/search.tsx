"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Typography,
  Chip,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useState } from "react";

const timeOptions = ["Bugün", "Bu Hafta", "Bu Ay", "Son 3 Ay", "Bu Yıl"];

const categoryOptions = [
  "İmza Raporları",
  "Analiz Raporları",
  "Süreç Raporları",
  "Aktivite Raporları",
  "İstatistik Raporları",
];
const statusOptions = ["Tümü", "Tamamlanan", "Hazırlanıyor"];
export default function Index() {
  const [activeTime, setActiveTime] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>("Tümü");
  const resetFilters = () => {
    setActiveTime(null);
    setActiveCategory(null);
    setActiveStatus("Tümü");
  };
  return (
    <Grid size={{ xs: 12, md: 4, lg: 3 }}>
      <Box p={2} borderRadius="8px" bgcolor="white" boxShadow={2}>
        <Box
          display="flex"
          alignItems="center"
          border="1px solid #e0e0e0"
          borderRadius="8px"
          mb={3}
        >
          <IconButton>
            <SearchIcon />
          </IconButton>
          <InputBase
            placeholder="Rapor ara..."
            sx={{ flex: 1, fontSize: 14 }}
          />
        </Box>

        <Box
          display="flex"
          overflow="auto"
          justifyContent={"center"}
          mb={2}
          sx={{
            whiteSpace: "nowrap",
            scrollbarWidth: "thin",
            scrollbarColor: "#c1c1c1 transparent",

            "&::-webkit-scrollbar": {
              height: 6,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          {statusOptions.map((label) => (
            <Box
              key={label}
              onClick={() => setActiveStatus(label)}
              sx={{
                color: activeStatus === label ? "#1976d2" : "#000",
                fontWeight: activeStatus === label ? 700 : 500,
                minWidth: "fit-content",
                padding: "4px 8px",
                textTransform: "none",
                fontSize: 14,
                flexShrink: 0, // Kaymasını engeller
                cursor: "pointer",
                borderBottom:
                  activeStatus === label ? "2px solid #1976d2" : "none",
                mb: "10px",
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        <Typography fontSize={14} fontWeight={600} mb={1}>
          Zaman Aralığı
        </Typography>
        <Grid container direction="column" spacing={1} mb={3}>
          {timeOptions.map((label) => (
            <Grid key={label}>
              <Button
                fullWidth
                variant={activeTime === label ? "contained" : "outlined"}
                color={activeTime === label ? "primary" : "inherit"}
                startIcon={<CalendarTodayIcon />}
                onClick={() => setActiveTime(label)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 13,
                }}
              >
                {label}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Typography fontSize={14} fontWeight={600} mb={1}>
          Kategoriler
        </Typography>
        <Grid container direction="column" spacing={1}>
          {categoryOptions.map((label) => (
            <Grid key={label}>
              <Button
                fullWidth
                variant={activeCategory === label ? "contained" : "outlined"}
                color={activeCategory === label ? "primary" : "inherit"}
                startIcon={<FilterListIcon />}
                onClick={() => setActiveCategory(label)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 13,
                }}
              >
                {label}
              </Button>
            </Grid>
          ))}
        </Grid>

        {(activeTime || activeCategory || activeStatus != "Tümü") && (
          <Box mt={3}>
            <Button
              fullWidth
              onClick={resetFilters}
              variant="outlined"
              color="error"
            >
              Filtreleri Temizle
            </Button>
          </Box>
        )}
      </Box>
    </Grid>
  );
}
