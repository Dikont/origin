import { Box, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { getBaseUrl } from "@/utils/getUrl";
import { cookies } from "next/headers";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DescriptionIcon from "@mui/icons-material/Description";
import { Paper, Stack, Divider, Grid, Chip } from "@mui/material";
import { useTranslations } from "next-intl";
import Notifications from "./notifications";

type Notif = {
  id: number;
  documentGroupId: string;
  documentGroupName: string;
  sentTo: string;
  sentDate: string;
};

export const metadata = {
  title: "Bildirimler - Dikont",
  description:
    "Sözleşme süreçleri ve sistemle ilgili bildirimlerinizi bu ekranda görüntüleyin.",
  keywords: [
    "dikont bildirimler",
    "sözleşme bildirimi",
    "kullanıcı bildirimi",
    "e-imza hatırlatması",
    "dijital kontrat bildirimi",
  ],
  alternates: {
    canonical: "https://www.dikont.com/tr/notifications",
    languages: {
      "tr-TR": "https://www.dikont.com/tr/notifications",
      "en-US": "https://www.dikont.com/en/notifications",
      "nl-NL": "https://www.dikont.com/nl/notifications",
    },
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  const token = cookieStore.get("token")?.value ?? "";
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))
    : null;
  const getNotifications = await fetch(
    getBaseUrl("/api/analytics/getNotifications"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user?.user.id,
      }),
    },
  );
  const data = await getNotifications.json();
  const items: Notif[] = (Array.isArray(data) ? data : []).filter(Boolean);
  items.sort(
    (a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime(),
  );

  return (
    <>
      <Notifications items={items} />
    </>
  );
}
