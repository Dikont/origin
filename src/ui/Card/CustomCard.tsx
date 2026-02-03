"use client";
import Box from "@mui/material/Box";
import { styled, alpha } from "@mui/material/styles";

interface CustomCardBlueProps {
  background?: string;
}

export const CustomBannerCard = styled(Box)(({ theme }) => ({
  padding: 20,
  borderRadius: 18,
  position: "relative",
  overflow: "hidden",

  // dark glass
  background: `linear-gradient(135deg, ${alpha("#5C2230", 0.92)} 0%, ${alpha(
    "#5C2230",
    0.88,
  )} 60%, ${alpha("#5C2230", 0.9)} 100%)`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
  boxShadow:
    "0px 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",

  transition: "transform 240ms ease, box-shadow 240ms ease",
  transform: "translateY(0px)",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow:
      "0 0 0 0 rgba(0,0,0,0.3), 0px 10px 14px 1px rgba(0,0,0,0.22), 0 0 0 0 rgba(0,0,0,0.2)",
  },

  // soft glow accents (sol alt yeşil, sağ üst mavi)
  "&::before": {
    content: '""',
    position: "absolute",
    inset: -120,
    background:
      "radial-gradient(circle at 15% 70%, rgb(44 23 55), transparent 45%), radial-gradient(circle at 85% 25%, rgb(44 23 55), transparent 45%)",
    filter: "blur(10px)",
    pointerEvents: "none",
  },
}));

export const CustomCard = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  // gradient bg
  backgroundImage: "linear-gradient(135deg, #646E9F 0%, #453562 100%)",
  color: theme.palette.common.white,

  // subtle border (dark temada güzel duruyor)
  border: "1px solid rgba(255,255,255,0.10)",

  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  transform: "translateY(0)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",

  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
  },
}));

export const CustomCardBlue = styled(Box, {
  shouldForwardProp: (prop) => prop !== "background",
})<CustomCardBlueProps>(({ theme, background }) => ({
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  borderRadius: "10px",
  boxShadow:
    "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  transition: "transform 0.7s ease, box-shadow 0.7s ease",
  transform: "scale(1)",
  "&:hover": {
    background: `linear-gradient(135deg, ${background} 0%, #fff 100%)`,
    transform: "scale(1.02)",
    boxShadow:
      "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
  },
}));

export const CustomCardQuickAccess = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  borderRadius: "10px",
  boxShadow:
    "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
  background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
  transition: "transform 0.7s ease, box-shadow 0.7s ease",
  transform: "scale(1)",
  "&:hover": {
    boxShadow:
      "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
    background: "linear-gradient(120deg, #cfdef3 0%, #e0eafc 100%)",
    transform: "scale(1.02)",
    cursor: "pointer",
  },
}));

export const TeamMemberCard = styled(Box)(({ theme }) => ({
  borderRadius: "10px",
  boxShadow:
    "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  transition: "transform 0.6s ease, box-shadow 0.6s ease",
  transform: "scale(1)",
  border: "2px solid transparent",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow:
      "0 0 0 0 rgba(0,0,0,0.3), 0px 10px 14px 1px rgba(0,0,0,0.22), 0 0 0 0 rgba(0,0,0,0.2)",
    borderColor: "#1976d2",
    borderRadius: "10px",
  },
}));
