"use client";
import React from "react";
import ReactECharts from "echarts-for-react";

export default function LineChart({ data }: any) {
  const option = {
    title: {
      text: "ECharts Example",
    },
    tooltip: {},
    xAxis: {
      data: data.day,
    },
    yAxis: {},
    series: [
      {
        name: "Sales",
        type: "bar",
        data: data.count,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 400 }} />;
}
