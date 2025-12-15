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
  userRoles: string[] | undefined,
  locale: string
): MenuItem[] {
  const L = (url: string) => `/${locale}${url}`;

  const items: MenuItem[] = [
    {
      icon: <DashboardIcon />,
      text: t("home"),
      url: L("/dashboard"),
      type: "item",
    },
    { type: "subheader", text: t("contracts") },
    {
      icon: <ArticleIcon />,
      text: t("createContract"),
      url: L("/createContract"),
      type: "item",
    },
    {
      icon: <AssignmentTurnedInIcon />,
      text: t("followContracts"),
      url: L("/followContracts"),
      type: "item",
    },
    {
      icon: <SaveIcon />,
      text: t("drafts"),
      url: L("/templates"),
      type: "item",
    },
    {
      icon: <PsychologyIcon />,
      text: t("aiSupport"),
      url: L("/aiSupport"),
      type: "item",
    },
    {
      icon: <InsightsIcon />,
      text: t("reports"),
      url: L("/reports"),
      type: "item",
    },
    { type: "subheader", text: t("management") },

    {
      icon: <QuizIcon />,
      text: t("faq"),
      url: L("/faq"),
      type: "item",
    },
    {
      icon: <NotificationsActiveIcon />,
      text: t("notifications"),
      url: L("/notifications"),
      type: "item",
    },
    {
      icon: <InfoOutlinedIcon />,
      text: t("about"),
      url: L("/about"),
      type: "item",
    },
    {
      icon: <LockResetIcon />,
      text: t("changePassword"),
      url: L("/changePassword"),
      type: "item",
    },
  ];
  // 2. Company Profile Ekleme Mantığı (ARAYA EKLEME)
  // includes kullanarak kontrolü sağlama alıyoruz
  if (userRoles?.includes("Admin") || userRoles?.includes("CompanySuperUser")) {
    // "Create Contract" elemanının listedeki sırasını buluyoruz
    const targetIndex = items.findIndex((item) => item.url === L("/faq"));

    // Eğer bulursak, tam o sıraya splice ile ekleme yapıyoruz
    if (targetIndex !== -1) {
      items.splice(targetIndex, 0, {
        icon: <ApartmentIcon />,
        text: t("companyProfile"),
        url: L("/companyProfile"),
        type: "item",
      });
    } else {
      // Eğer Create Contract bulunamazsa (kod değişirse) en sona ekle
      items.push({
        icon: <ApartmentIcon />,
        text: t("companyProfile"),
        url: L("/companyProfile"),
        type: "item",
      });
    }
  }

  if (userRoles?.includes("Admin")) {
    items.unshift({
      icon: <AdminPanelSettingsIcon />,
      text: "Admin Panel",
      url: L("/admin"),
      type: "item",
    });
  }

  return items;
}
