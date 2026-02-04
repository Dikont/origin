"use client";

import { Box } from "@mui/material";
import React from "react";

export default function CssDataGridResponsive({
  children,
  height = 630,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: 520, md: height },
        overflow: "hidden",

        // Kart hissi
        borderRadius: 3,
        border: "1px solid rgba(17,24,39,0.08)",
        backgroundColor: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      {/* sol fade */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 28,
          zIndex: 2,
          background:
            "linear-gradient(90deg, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* sağ fade */}
      <Box
        sx={{
          pointerEvents: "none",
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 28,
          zIndex: 2,
          background:
            "linear-gradient(270deg, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 100%)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",

          // İç boşluk (grid kenarlara yapışmasın)
          p: 0, // DataGrid zaten full olsun istiyorsan 0 kalsın
          // istersen şöyle yap: p: { xs: 0, md: 0.25 },

          // Modern scrollbar
          "&::-webkit-scrollbar": { height: 10 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 999,
            backgroundColor: "rgba(17,24,39,0.18)",
            border: "2px solid rgba(255,255,255,0.9)",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(17,24,39,0.28)",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },

          // Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(17,24,39,0.25) transparent",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
