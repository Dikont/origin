"use client";
import { Box } from "@mui/material";
export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "600px",
        position: "relative",
        overflow: "hidden",
        transform: "translateZ(0)", // YENİ STACKING CONTEXT
        isolation: "isolate", // CSS İZOLASYON
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflowX: "scroll", // auto yerine scroll
          overflowY: "hidden",
          // Mobil scroll aktif etme
          WebkitOverflowScrolling: "touch", // iOS smooth scroll
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            height: "10px", // Scroll bar yüksekliği
            backgroundColor: "#f5f5f5",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "10px",
            border: "2px solid #f5f5f5",
            "&:hover": {
              backgroundColor: "#a8a8a8",
            },
            "&:active": {
              backgroundColor: "#888",
            },
          },
          // Mobil için touch scroll
          "@media (max-width: 768px)": {
            "&::-webkit-scrollbar": {
              height: "14px", // Mobilde daha kalın
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#666", // Daha koyu renk
            },
            // Touch scroll indicator
            scrollbarWidth: "thin", // Firefox
            scrollbarColor: "#666 #f5f5f5", // Firefox
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
