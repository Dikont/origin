"use client";
import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslations } from "next-intl";
import { Button } from "@mui/material";

export function DownloadPdfButton() {
  const t = useTranslations("menu");

  const handleDownloadPdf = useCallback(async () => {
    // 1. Ana wrapper'ı bul
    const wrapper = document.getElementById("pdf-wrapper");
    // 2. İçindeki sayfaları class ile bul
    const pages = document.getElementsByClassName("pdf-page-sheet");

    if (!wrapper || pages.length === 0) {
      console.error("PDF içeriği bulunamadı");
      return;
    }

    // Element'i geçici olarak görünür ve üstte yap
    const originalStyles = {
      opacity: wrapper.style.opacity,
      position: wrapper.style.position,
      left: wrapper.style.left,
      top: wrapper.style.top,
    };

    // Görünür hale getir (ekran dışı ama render edilebilir)
    wrapper.style.opacity = "1";
    wrapper.style.position = "fixed";
    wrapper.style.left = "0"; // Ekran içinde olması gerekebilir bazen ama z-index ile alta atalım
    wrapper.style.top = "0";
    wrapper.style.zIndex = "-9999"; // Kullanıcı görmesin

    // DOM'un render olması için kısa bir bekleme
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      // PDF nesnesi oluştur
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Her sayfayı (chunk) ayrı ayrı canvas'a çevir
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;

        const canvas = await html2canvas(pageEl, {
          scale: 2, // Kalite için 2x scale
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: 794, // Sabit A4 pixel genişliği
          height: 1123, // Sabit A4 pixel yüksekliği
        });

        const imgData = canvas.toDataURL("image/png");

        // İlk sayfa zaten var, sonrakilerde addPage yap
        if (i > 0) {
          pdf.addPage();
        }

        // Resmi tam sayfa olarak ekle
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      // PDF'i indir
      pdf.save(`sozlesme-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
    } finally {
      // Orijinal stilleri geri yükle
      wrapper.style.opacity = originalStyles.opacity;
      wrapper.style.position = originalStyles.position;
      wrapper.style.left = originalStyles.left;
      wrapper.style.top = originalStyles.top;
      wrapper.style.zIndex = "";
    }
  }, []);

  return (
    <Button
      variant="contained"
      onClick={handleDownloadPdf}
      sx={{ p: "8px 16px" }}
    >
      {t("downloadFollowing")}
    </Button>
  );
}
