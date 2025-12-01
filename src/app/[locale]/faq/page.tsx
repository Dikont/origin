import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Box, Typography } from "@mui/material";
import FaqList from "@/component/FaqList";
import { getTranslations } from "next-intl/server";
export const metadata = {
  title: "Sıkça Sorulan Sorular - Dikont Hakkında Merak Ettikleriniz",
  description:
    "Dikont hakkında en çok sorulan soruların yanıtlarını burada bulabilirsiniz. Kullanım, avantajlar, platform desteği ve kontrat işlemleri hakkında detaylı bilgi alın.",
  keywords: [
    "dikont nedir",
    "dikont nasıl çalışır",
    "dikont avantajları",
    "sözleşme nasıl imzalanır",
    "kontrat oluşturma",
    "dijital imza işlemleri",
    "dikont destek",
    "dikont SSS",
    "sıkça sorulan sorular",
    "dikont yardım sayfası",
  ],
  alternates: {
    canonical: "https://www.dikont.com/tr/faq",
    languages: {
      "tr-TR": "https://www.dikont.com/tr/faq",
      "en-US": "https://www.dikont.com/en/faq",
      "nl-NL": "https://www.dikont.com/nl/faq",
    },
  },
};

export default async function FAQPage() {
  const t = await getTranslations("faq");
  return (
    <>
      <Box
        display={"flex"}
        alignItems="center"
        flexDirection="column"
        my="50px"
      >
        <Box mb="30px">
          <HelpOutlineIcon style={{ fontSize: 50 }} color="primary" />
        </Box>
        <Typography variant="h1" fontSize={"28px"} fontWeight={700} mb="16px">
          {t("main_title")}
        </Typography>
        <Typography
          variant="body1"
          fontSize={"16px"}
          color="textSecondary"
          maxWidth="600px"
          textAlign="center"
        >
          {t("main_desc")}
        </Typography>
      </Box>
      <FaqList />
    </>
  );
}
