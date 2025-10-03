"use client";
import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslations } from "next-intl";
import { Button } from "@mui/material";
export function DownloadPdfButton() {
  const t = useTranslations("menu");
  const handleDownloadPdf = useCallback(async () => {
    const el = document.getElementById("pdf-sheet");
    if (!el) {
      return;
    }

    // Element'i geçici olarak görünür yap
    const originalStyles = {
      opacity: el.style.opacity,
      position: el.style.position,
      left: el.style.left,
      top: el.style.top,
    };

    // Geçici olarak tamamen görünür yap
    el.style.opacity = "1";
    el.style.position = "fixed";
    el.style.left = "-99999px";
    el.style.top = "0";
    el.style.zIndex = "9999";

    // Bir frame bekle (DOM'un render olması için)
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Canvas'a çevir
      const canvas = await html2canvas(el, {
        scale: 1, // Önce 1 ile dene
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true, // Debug için aç
        width: el.scrollWidth,
        height: el.scrollHeight,
      });

      // Canvas'ı kontrol et - boş mu?
      const ctx = canvas.getContext("2d");
      //@ts-ignore
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((pixel, index) => {
        // Alpha channel'ı kontrol etme, sadece RGB
        if (index % 4 === 3) return false;
        return pixel !== 255; // Beyaz olmayan pixel var mı?
      });

      if (!hasContent) {
        alert("PDF içeriği boş görünüyor. Lütfen konsolu kontrol edin.");
        return;
      }

      // Canvas'ı resim olarak al
      const imgData = canvas.toDataURL("image/png");

      // A4 boyutlu PDF hazırla
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Gerçek içeriği kontrol et (boş alanları çıkar)
      const actualContentHeight = Math.min(imgHeight, pageHeight * 1.1); // %10 tolerans

      if (actualContentHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, actualContentHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;

        // İlk sayfa
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Ek sayfalar (sadece gerekirse)
        while (heightLeft > 20) {
          // 20mm'den fazla kalan varsa yeni sayfa
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      // PDF'i indir
      pdf.save(`sozlesme-${new Date().getTime()}.pdf`);
    } catch (error) {
    } finally {
      // Orijinal stilleri geri yükle
      el.style.opacity = originalStyles.opacity;
      el.style.position = originalStyles.position;
      el.style.left = originalStyles.left;
      el.style.top = originalStyles.top;
      el.style.zIndex = "";
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
