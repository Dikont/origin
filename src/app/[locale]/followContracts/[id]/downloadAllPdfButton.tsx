"use client";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
export default function DownloadAllPdfButton() {
  const t = useTranslations("followContracts");
  const [downloading, setDownloading] = useState(false);
  const pathname = usePathname();
  const selectedDocId = pathname.split("/").pop();
  const handleDownload = async () => {
    if (!selectedDocId) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/getDownloadAblePdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docGId: selectedDocId }),
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || t("downloadFailed"));
      }

      // route JSON döndürüyor (düz string veya {result: "..."} olabilir)
      const data = await res.json();
      const b64 =
        typeof data === "string"
          ? data
          : data?.result ?? data?.pdf ?? data?.data;
      if (!b64) throw new Error(t("noPdfData"));

      const bin = atob(
        b64.indexOf("base64,") >= 0 ? b64.split("base64,")[1] : b64
      );
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${selectedDocId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Button
      variant="contained"
      onClick={handleDownload}
      sx={{ p: "8px 16px" }}
      disabled={downloading}
      startIcon={
        downloading ? <CircularProgress size={18} color="inherit" /> : undefined
      }
    >
      {downloading ? t("downloading") : t("downloadPDF")}
    </Button>
  );
}
