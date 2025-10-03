import Template from "@/component/template";
import { cookies } from "next/headers";

export default async function ResponsiveCards() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  const user = userCookie
    ? JSON.parse(decodeURIComponent(userCookie.value))?.user?.id
    : null;
  return <Template user={user} />;
}
export const metadata = {
  title: "Şablonlar - Hazır Kontrat Taslakları | Dikont",
  description:
    "Oluşturduğunuz sözleşme şablonlarını yönetin ve dilediğiniz zaman uygulayın. Hızlı ve tekrarlanabilir sözleşme süreçleri için özelleştirilmiş şablonlar kullanın.",
  keywords: [
    "şablonlar",
    "sözleşme şablonu",
    "kontrat şablonları",
    "hazır taslaklar",
    "dikont şablon yönetimi",
    "dijital sözleşme şablonu",
    "kontrat taslağı",
  ],
  alternates: {
    canonical: "https://www.dikont.com/tr/templates",
    languages: {
      "tr-TR": "https://www.dikont.com/tr/templates",
      "en-US": "https://www.dikont.com/en/templates",
    },
  },
  robots: {
    index: false,
    follow: true,
  },
};
