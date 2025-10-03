import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Paper,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";

const reports = [
  {
    type: "pdf",
    title: "Monthly Signature Report",
    subtitle: "Monthly summary report of signed contracts",
    category: "Signature Reports",
    date: "March 21, 2024",
    size: "2.4 MB",
    stats: [
      { label: "Total Contracts", value: 156 },
      { label: "Signed Contracts", value: 142 },
      { label: "Pending Contracts", value: 14 },
    ],
  },
  {
    type: "doc",
    title: "Departmental Analysis",
    subtitle: "Analysis of contract usage by departments",
    category: "Analysis Reports",
    date: "March 20, 2024",
    size: "1.8 MB",
    stats: [
      { label: "Department Count", value: 8 },
      { label: "Total Usage", value: 324 },
      { label: "Active Users", value: 45 },
    ],
  },
  {
    type: "pdf",
    title: "Contract Process Report",
    subtitle: "Detailed report of contract approval processes",
    category: "Process Reports",
    date: "March 19, 2024",
    size: "3.1 MB",
    stats: [
      { label: "Avg. Approval Time", value: "2.3 days" },
      { label: "Completed Processes", value: 89 },
      { label: "Active Processes", value: 12 },
    ],
  },
];

export default function Index() {
  return (
    <Grid size={{ xs: 12, md: 8, lg: 9 }}>
      <Grid container spacing={2}>
        {reports.map((report, idx) => (
          <Grid key={idx} size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexWrap="wrap"
                >
                  <Box>
                    <Typography variant="h6">{report.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {report.subtitle}
                    </Typography>
                    <Box
                      mt={1}
                      display="flex"
                      gap={1}
                      flexWrap="wrap"
                      sx={{
                        // first divs
                        "& > *": {
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                        },
                      }}
                    >
                      <Chip
                        icon={
                          report.type === "pdf" ? (
                            <PictureAsPdfIcon />
                          ) : (
                            <InsertDriveFileIcon />
                          )
                        }
                        label={report.category}
                        color="default"
                      />
                      <Chip label={report.date} />
                      <Chip label={report.size} />
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <IconButton>
                      <DownloadIcon color="primary" />
                    </IconButton>
                    <IconButton>
                      <ShareIcon color="action" />
                    </IconButton>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {report.stats.map((stat, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 4 }}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography fontSize={14} color="text.secondary">
                          {stat.label}
                        </Typography>
                        <Typography fontWeight="bold">{stat.value}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
