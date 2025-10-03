// src/utils/menu.tsx
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SaveIcon from "@mui/icons-material/Save";
import PsychologyIcon from "@mui/icons-material/Psychology";
import InsightsIcon from "@mui/icons-material/Insights";
import ApartmentIcon from "@mui/icons-material/Apartment";
import QuizIcon from "@mui/icons-material/Quiz";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockResetIcon from "@mui/icons-material/LockReset";
export type MenuItem = {
  icon?: React.ReactNode;
  text: string;
  url?: string;
  type: "subheader" | "item";
};

export function getMenuItems(
  t: (k: string) => string,
  userRole: string | any
): MenuItem[] {
  const items: MenuItem[] = [
    {
      icon: <DashboardIcon />,
      text: t("home"),
      url: "/dashboard",
      type: "item",
    },
    { type: "subheader", text: t("contracts") },
    {
      icon: <ArticleIcon />,
      text: t("createContract"),
      url: "/createContract",
      type: "item",
    },
    {
      icon: <AssignmentTurnedInIcon />,
      text: t("followContracts"),
      url: "/followContracts",
      type: "item",
    },
    { icon: <SaveIcon />, text: t("drafts"), url: "/templates", type: "item" },
    {
      icon: <PsychologyIcon />,
      text: t("aiSupport"),
      url: "/aiSupport",
      type: "item",
    },
    {
      icon: <InsightsIcon />,
      text: t("reports"),
      url: "/reports",
      type: "item",
    },
    { type: "subheader", text: t("management") },
    {
      icon: <ApartmentIcon />,
      text: t("companyProfile"),
      url: "/companyProfile",
      type: "item",
    },
    { icon: <QuizIcon />, text: t("faq"), url: "/faq", type: "item" },
    {
      icon: <NotificationsActiveIcon />,
      text: t("notifications"),
      url: "/notifications",
      type: "item",
    },
    {
      icon: <InfoOutlinedIcon />,
      text: t("about"),
      url: "/about",
      type: "item",
    },
    {
      icon: <LockResetIcon />,
      text: t("changePassword"),
      url: "/changePassword",
      type: "item",
    },
  ];

  if (userRole === "Admin") {
    items.unshift({
      icon: <AdminPanelSettingsIcon />,
      text: "Admin Panel",
      url: "/admin",
      type: "item",
    });
  }

  return items;
}
