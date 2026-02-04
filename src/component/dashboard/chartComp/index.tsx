"use client";

import { Grid, Paper, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTranslations } from "next-intl";

type Point = { day: string; count: number };

const commonSx = {
  "& .MuiChartsAxis-line": { stroke: "#000000", strokeWidth: 1.2 },

  // yatay grid dotted istersen:
  "& .MuiChartsGrid-horizontalLine": {
    stroke: "#e5e7eb",
    strokeDasharray: "3 4",
  },
} as const;

export default function ChartComp({
  data,
}: {
  data: { timeSeries: Point[]; timeSeriesSigned: Point[] };
}) {
  const t = useTranslations("dashboard");

  const ts = toLineProps(data.timeSeries, t);
  const signed = toLineProps(data.timeSeriesSigned, t);

  return (
    <Grid container rowSpacing={3} columnSpacing={4}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, borderRadius: "10px" }}>
          <Typography variant="h5" textAlign="start" mb="20px" ml="20px">
            {t("weeklyCompletedSignatures")}
          </Typography>
          <LineChart
            {...ts}
            height={400}
            series={ts.series.map((s) => ({
              ...s,
              area: true,
              curve: "natural",
              showMark: false,
              color: "#2e7d32",
            }))}
            sx={{
              ...commonSx,
              "& .MuiAreaElement-root": {
                fillOpacity: 0.2,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 3,
              },
            }}
          />
        </Paper>
      </Grid>

      {/* Haftalık İmza Daveti */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2, borderRadius: "10px" }}>
          <Typography variant="h5" textAlign="start" mb="20px" ml="20px">
            {t("weeklyInvites")}
          </Typography>

          <LineChart
            {...signed}
            height={400}
            series={signed.series.map((s) => ({
              ...s,
              area: true,
              curve: "natural",
              showMark: false,
              color: "#453562",
            }))}
            sx={{
              ...commonSx,
              "& .MuiAreaElement-root": {
                fillOpacity: 0.2,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 3,
              },
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

function toLineProps(arr: Point[], t: ReturnType<typeof useTranslations>) {
  const labels = (arr ?? [])
    .map((d) => ({ date: new Date(d.day), count: d.count ?? 0 }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const xLabels = labels.map((x) =>
    x.date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }),
  );
  const yValues = labels.map((x) => x.count);

  const max = Math.max(0, ...yValues);
  const niceMax = Math.max(10, Math.ceil(max / 10) * 10);

  const tickStyleX = {
    fontFamily: "Arial, sans-serif",
    fill: "#000000",
    fontSize: 12,
    fontWeight: 700,
  } as const;
  const tickStyleY = {
    fontFamily: "Arial, sans-serif",
    fill: "#000000",
    fontSize: 12,
    fontWeight: 700,
  } as const;
  return {
    xAxis: [
      {
        id: "bottom-axis",
        data: xLabels,
        scaleType: "point" as const,
        tickLabelStyle: tickStyleX,
      },
    ],
    series: [{ data: yValues }],
    yAxis: [
      {
        min: 0,
        max: niceMax,
        tickNumber: 5,
        tickLabelStyle: tickStyleY,

        label: t("signaturesLabel"),

        labelStyle: {
          fontFamily: "Arial, sans-serif",
          fill: "#000",
          fontSize: 20,
          fontWeight: 400,
        },
        valueFormatter: (v: number) => String(v),
      },
    ],

    grid: { horizontal: true, vertical: false },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  } as const;
}
