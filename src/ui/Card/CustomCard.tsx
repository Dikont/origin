"use client";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

interface CustomCardBlueProps {
  background?: string;
}

export const CustomBannerCard = styled(Box)(({ theme }) => ({
  padding: "20px",
  background: "linear-gradient(90deg, #00b16a 0%, #43e97b 100%)",
  color: "#FFF",
  borderRadius: "10px",
  boxShadow:
    "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  transition: "transform 0.6s ease, box-shadow 0.6s ease",
  transform: "scale(1)",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow:
      "0 0 0 0 rgba(0,0,0,0.3), 0px 10px 14px 1px rgba(0,0,0,0.22), 0 0 0 0 rgba(0,0,0,0.2)",
  },
}));

export const CustomCard = styled(Box)(({ theme }) => ({
  padding: "10px",
  background: "#FFF",
  borderRadius: "10px",
  boxShadow:
    "0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  transform: "scale(1)",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow:
      "0 0 0 0 rgba(0,0,0,0.3), 0px 10px 14px 1px rgba(0,0,0,0.22), 0 0 0 0 rgba(0,0,0,0.2)",
  },
  flex: 1,
  display: "flex",
  justifyContent: "center",
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
