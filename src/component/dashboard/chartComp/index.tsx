"use client";
import { Grid, Paper, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTranslations } from "next-intl";

type Point = { day: string; count: number };

export default function ChartComp({
  data,
}: {
  data: { timeSeries: Point[]; timeSeriesSigned: Point[] };
}) {
  const t = useTranslations("dashboard");

  const ts = toBarProps(data.timeSeries, t);
  const signed = toBarProps(data.timeSeriesSigned, t);

  return (
    <Grid container rowSpacing={3} columnSpacing={4}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, borderRadius: "10px" }}>
          <Typography variant="h5" textAlign="center" color="#262626" mb="20px">
            {t("weeklyCompletedSignatures")}
          </Typography>
          <BarChart
            {...ts}
            height={400}
            sx={{
              "& .MuiBarElement-root": { rx: 6 },
              "& .MuiChartsAxis-line": { stroke: "#e0e0e0", strokeWidth: 1.5 },
              "& .MuiChartsAxis-tickLabel": {
                fill: "#666",
                fontSize: 12,
                fontWeight: 500,
              },
            }}
          />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, borderRadius: "10px" }}>
          <Typography variant="h5" textAlign="center" color="#262626" mb="20px">
            {t("weeklyInvites")}
          </Typography>
          <BarChart
            {...signed}
            height={400}
            sx={{
              "& .MuiBarElement-root": { rx: 6 },
              "& .MuiChartsAxis-line": { stroke: "#e0e0e0", strokeWidth: 1.5 },
              "& .MuiChartsAxis-tickLabel": {
                fill: "#666",
                fontSize: 12,
                fontWeight: 500,
              },
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

function toBarProps(arr: Point[], t: ReturnType<typeof useTranslations>) {
  const labels = (arr ?? [])
    .map((d) => ({ date: new Date(d.day), count: d.count ?? 0 }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const xLabels = labels.map((x) =>
    x.date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" })
  );
  const yValues = labels.map((x) => x.count);

  const max = Math.max(0, ...yValues);
  const niceMax = Math.max(10, Math.ceil(max / 10) * 10);

  return {
    xAxis: [{ data: xLabels }],
    series: [{ data: yValues }],
    yAxis: [
      {
        min: 0,
        max: niceMax,
        tickNumber: 5,
        valueFormatter: (v: number) => t("signatures", { count: v }),
      },
    ],
    grid: { horizontal: true, vertical: false },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };
}
