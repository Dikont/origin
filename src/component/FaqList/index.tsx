"use client";

import { Box, IconButton, InputBase, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

/** Sadece KEY tutan kaynak (statik TR metinler kaldırıldı) */
const faqDataKeys = [
  {
    categoryKey: "category_general",
    content: [
      {
        titleKey: "q_what_is_dikont_title",
        contentKey: "q_what_is_dikont_content",
      },
      {
        titleKey: "q_how_to_start_title",
        contentKey: "q_how_to_start_content",
      },
      { titleKey: "q_advantages_title", contentKey: "q_advantages_content" },
      {
        titleKey: "q_supported_devices_title",
        contentKey: "q_supported_devices_content",
      },
    ],
  },
  {
    categoryKey: "category_contracts",
    content: [
      {
        titleKey: "q_create_contract_title",
        contentKey: "q_create_contract_content",
      },
      {
        titleKey: "q_signing_process_title",
        contentKey: "q_signing_process_content",
      },
      {
        titleKey: "q_use_templates_title",
        contentKey: "q_use_templates_content",
      },
      {
        titleKey: "q_archive_signed_title",
        contentKey: "q_archive_signed_content",
      },
    ],
  },
  {
    categoryKey: "category_security_privacy",
    content: [
      { titleKey: "q_security_title", contentKey: "q_security_content" },
      { titleKey: "q_kvkk_title", contentKey: "q_kvkk_content" },
      { titleKey: "q_2fa_title", contentKey: "q_2fa_content" },
      { titleKey: "q_backups_title", contentKey: "q_backups_content" },
    ],
  },
  {
    categoryKey: "category_ai",
    content: [
      { titleKey: "q_ai_analysis_title", contentKey: "q_ai_analysis_content" },
      {
        titleKey: "q_ai_reliability_title",
        contentKey: "q_ai_reliability_content",
      },
      {
        titleKey: "q_ai_summarization_title",
        contentKey: "q_ai_summarization_content",
      },
      { titleKey: "q_ai_compare_title", contentKey: "q_ai_compare_content" },
    ],
  },
  {
    categoryKey: "category_support_contact",
    content: [
      { titleKey: "q_support_title", contentKey: "q_support_content" },
      {
        titleKey: "q_pricing_info_title",
        contentKey: "q_pricing_info_content",
      },
      {
        titleKey: "q_training_consulting_title",
        contentKey: "q_training_consulting_content",
      },
      {
        titleKey: "q_request_demo_title",
        contentKey: "q_request_demo_content",
      },
    ],
  },
];

export default function Index() {
  const t = useTranslations("faq");
  const [searchQuery, setSearchQuery] = useState("");

  /** Çevirileri uygulayıp, aramayı da çeviri metinleri üzerinde yapalım */
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredData = useMemo(() => {
    // önce key'leri gerçek metne dönüştür
    const localized = faqDataKeys.map((cat) => ({
      category: t(cat.categoryKey),
      content: cat.content.map((c) => ({
        title: t(c.titleKey),
        content: t(c.contentKey),
        id: c.titleKey, // id olarak titleKey güvenli
      })),
    }));

    // arama filtresi
    if (!normalizedSearch) return localized;

    return localized
      .map((cat) => {
        const content = cat.content.filter((i) =>
          (i.title + " " + i.content).toLowerCase().includes(normalizedSearch)
        );
        return { ...cat, content };
      })
      .filter((cat) => cat.content.length > 0);
  }, [normalizedSearch, t]);

  return (
    <>
      <Box
        p="10px"
        bgcolor="white"
        borderRadius="8px"
        border="1px solid #e0e0e0"
        my="30px"
      >
        <Box
          border="1px solid #e0e0e0"
          borderRadius="8px"
          bgcolor="#f5f5f5"
          display="flex"
          alignItems="center"
        >
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder={t("search_placeholder")}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Box>

      <Box
        sx={{
          "& .MuiAccordionSummary-root.Mui-expanded .MuiTypography-root": {
            color: "primary.main",
          },
          ">div": { marginBottom: "36px" },
        }}
        pb="50px"
      >
        {filteredData.map((cat, idx) => (
          <Box key={idx}>
            {/* Kategori başlığı */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
              mb="24px"
            >
              <Box
                sx={{
                  width: "4px",
                  height: "24px",
                  backgroundColor: "#007bff",
                  borderRadius: 2,
                  mr: 1.5,
                }}
              />
              <Typography
                variant="h2"
                fontSize={"20px"}
                fontWeight={700}
                color="#007bff"
              >
                {cat.category}
              </Typography>
            </Box>

            {/* Sorular */}
            {cat.content.map((qa) => (
              <Accordion key={qa.id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${qa.id}-content`}
                  id={qa.id}
                >
                  <Typography
                    component="span"
                    fontWeight="700"
                    color="textSecondary"
                  >
                    {qa.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography component="span" color="textSecondary">
                    {qa.content}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))}
      </Box>

      {filteredData.length === 0 && (
        <Typography textAlign="center" color="textSecondary" mt={4}>
          {t("no_results")}
        </Typography>
      )}
    </>
  );
}
