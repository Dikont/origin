"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Box, Button, Dialog, Typography } from "@mui/material";
import { useSnackbar } from "../SnackbarProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

/* =========================
   Types from your store
   ========================= */
type DocPage = {
  id: number;
  documentRelatedComp: number;
  documentGroupId: string;
  documentS3Path: string; // PNG base64 (no data: prefix)
  visibleTo: number;
  createdAt: string;
  updatedAt: string;
  isFirstPage: boolean;
  whoCreated: string;
};

type SignerTab = {
  signerId: number;
  compId: number;
  documentId: number; // page id
  signerMail: string | null;
  signerName: string | null;
  signerGeneratedAuthCode?: number;
  isSigned?: boolean;
  tabId: number;
  tab_type: "signature" | "name" | "date" | "text" | "checkbox" | string;
  x_pos: number; // either 0..1 percentage or A4 points
  y_pos: number;
  label?: string | null;
  isSignature?: boolean;
  content_type?: string;
  contents?: string | null;
  font?: string | "none";
  fontsize?: number;
  phoneNumber?: string | null;
};

/* =========================
   Constants & helpers
   ========================= */
const COORD_BASE = { width: 595, height: 842 }; // A4 points
const DEFAULT_SIZES: Record<string, { w: number; h: number }> = {
  signature: { w: 100, h: 30 },
  name: { w: 160, h: 20 },
  date: { w: 110, h: 20 },
  text: { w: 110, h: 20 },
  email: { w: 200, h: 20 },
  phone: { w: 150, h: 20 },
  checkbox: { w: 24, h: 24 },
  default: { w: 160, h: 28 },
};

const stripDataPrefix = (s: string) => s.replace(/^data:\w+\/\w+;base64,/, "");

const isPct = (x: number, y: number) =>
  x >= 0 && x <= 1.0001 && y >= 0 && y <= 1.0001;
/* =========================
   Helper function to check if field is editable
   ========================= */
const isEditableField = (tab: SignerTab) => {
  // Sadece content_type değeri "date" veya "text" olan alanlar düzenlenebilir
  const contentType = (tab.content_type || "").toLowerCase();
  return contentType === "date" || contentType === "text";
};

/* =========================
   Helper function to get display value for non-editable fields
   ========================= */
const getDisplayValue = (tab: SignerTab, signerInformation: any) => {
  const contentType = (tab.content_type || "").toLowerCase();

  switch (contentType) {
    case "email":
      return signerInformation?.signerMail || tab.contents || "";
    case "name":
      return (
        signerInformation?.userName || tab.signerName || tab.contents || ""
      );
    case "phoneNumber":
      return tab.phoneNumber || tab.contents || "";
    default:
      return tab.contents || "";
  }
};
/* =========================
   Helper function to check if user owns this tab
   ========================= */
const isUserTab = (tab: SignerTab, otpCode: number, signerInformation: any) => {
  // Önce otpCode ile kontrol et
  if (tab.signerGeneratedAuthCode === otpCode) {
    return true;
  }

  // signerMail varsa ve "-" değilse, signerMail ile kontrol et
  if (tab.signerMail && tab.signerMail !== "-") {
    return tab.signerMail === signerInformation?.signerMail;
  }

  // signerMail yoksa veya "-" ise, signerName ile kontrol et
  // signerName bazen email adresi de olabilir
  if (tab.signerName && tab.signerName !== "-") {
    return (
      tab.signerName === signerInformation?.userName ||
      tab.signerName === signerInformation?.signerMail
    );
  }

  return false;
};

function SignaturePad({
  onSave,
  onClearRef,
  clear,
  handleSend,
  onEmpty,
  disabled = false, // YENİ PROP
}: {
  onSave: (dataUrl: string) => void;
  onClearRef?: (fn: () => void) => void;
  clear: () => void;
  handleSend: () => void;
  onEmpty?: (msg: string) => void;
  disabled?: boolean; // YENİ PROP
}) {
  const t = useTranslations("checkSignature");
  const cRef = React.useRef<HTMLCanvasElement | null>(null);
  const drawing = React.useRef(false);
  const hasInk = React.useRef(false); // track whether the user drew something

  // init pad
  React.useEffect(() => {
    const c = cRef.current;
    if (!c) return;
    c.width = 700;
    c.height = 260;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#e0e0e0";
    g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
    hasInk.current = false;
  }, []);

  // expose clear() upwards
  React.useEffect(() => {
    if (!onClearRef) return;
    onClearRef(() => {
      const c = cRef.current!;
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, c.width, c.height);
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      g.strokeStyle = "#e0e0e0";
      g.strokeRect(0.5, 0.5, c.width - 1, c.height - 1);
      hasInk.current = false;
    });
  }, [onClearRef]);

  // pointer helpers
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = cRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = cRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    drawing.current = true;
    g.lineWidth = 2.6;
    g.lineCap = "round";
    g.strokeStyle = "#111";
    g.beginPath();
    g.moveTo(x, y);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const g = cRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    g.lineTo(x, y);
    g.stroke();
    if (!hasInk.current) hasInk.current = true;
  };

  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" align="center" sx={{ mb: 1 }}>
        {t("signature_pad_title")}
      </Typography>
      <Box
        display="flex"
        gap="10px"
        justifyContent="center"
        flexDirection={{ xs: "column", sm: "row" }}
      >
        <Box>
          <canvas
            ref={cRef}
            onPointerDown={disabled ? undefined : down}
            onPointerMove={disabled ? undefined : move}
            onPointerUp={disabled ? undefined : up}
            onPointerLeave={disabled ? undefined : up}
            style={{
              width: "100%",
              height: "auto",
              background: "#fff",
              borderRadius: 8,
              touchAction: "none",
              cursor: disabled ? "not-allowed" : "crosshair",
              display: "block",
              boxShadow: "rgba(0,0,0,.25) 0 2px 8px",
              opacity: disabled ? 0.5 : 1,
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            {disabled
              ? t("signature_pad_hint_disabled")
              : t("signature_pad_hint_enabled")}
          </Typography>
        </Box>
        <Box>
          <Button
            onClick={() => {
              if (!hasInk.current) {
                onEmpty?.(t("error_signature_empty"));
                return;
              }
              const c = cRef.current!;
              const dataUrl = c.toDataURL("image/png");
              onSave(dataUrl);
            }}
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mb: "20px" }}
            disabled={disabled}
          >
            {t("save_button")}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={clear}
            color="inherit"
            sx={{ mb: "20px" }}
            disabled={disabled}
          >
            {t("clear_button")}
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleSend}
          >
            {t("send_button")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function PdfSigner({
  otpCode,
  signerInformation,
}: {
  otpCode: number;
  signerInformation: any;
}) {
  const t = useTranslations("checkSignature");
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [inputsByTab, setInputsByTab] = useState<Record<number, string>>({});
  const [editableRects, setEditableRects] = useState<
    Array<{
      tab: SignerTab;
      leftPct: number;
      topPct: number;
      widthPct: number;
      heightPct: number;
      kind: "text" | "date" | "display";
      displayValue?: string;
    }>
  >([]);
  const [activeSignatureTab, setActiveSignatureTab] = useState<number | null>(
    null
  );
  const [signaturePadEnabled, setSignaturePadEnabled] = useState(false);
  /* ----- read data from store ----- */
  const docs = useSelector((s: RootState) => s.signer.docs) as DocPage[];
  const signerTabs = useSelector(
    (s: RootState) => s.signer.vw_SignerTabs
  ) as SignerTab[];

  const pages = useMemo(() => {
    if (!docs?.length) return [];
    return [...docs].sort((a, b) => {
      if (a.isFirstPage && !b.isFirstPage) return -1;
      if (!a.isFirstPage && b.isFirstPage) return 1;
      return a.id - b.id;
    });
  }, [docs]);

  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const hitRectsRef = useRef<
    Array<{
      tab: SignerTab;
      x: number;
      y: number;
      w: number;
      h: number;
      kind: string;
    }>
  >([]);

  // signature images by tabId (data url). Only the current user's signature boxes are used.
  const [signaturesByTab, setSignaturesByTab] = useState<
    Record<number, { dataUrl: string; isSigned: boolean }>
  >({});

  // checkbox state by tabId
  const [checkboxByTab, setCheckboxByTab] = useState<Record<number, boolean>>(
    {}
  );

  // expose clear on pad if you need (kept for compatibility)
  const padClearRef = useRef<(() => void) | null>(null);

  /* ----- prime checkbox initial values from contents ----- */

  useEffect(() => {
    if (!signerTabs?.length) return;
    setCheckboxByTab((prev) => {
      const next = { ...prev };
      signerTabs.forEach((t) => {
        if ((t.tab_type || "").toLowerCase() === "checkbox") {
          if (next[t.tabId] === undefined) {
            next[t.tabId] = String(t.contents).toLowerCase() === "true";
          }
        }
      });
      return next;
    });
  }, [signerTabs]);

  /* ----- draw page + tabs on canvas ----- */
  useEffect(() => {
    if (!pages.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const page = pages[currentPage];
    const img = new Image();
    img.src = `data:image/png;base64,${page.documentS3Path}`;

    img.onload = () => {
      // Canvas'ı görüntü boyutuna sabitle (piksel-perf için)
      canvas.width = img.width;
      canvas.height = img.height;

      // Arka planı çiz
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // A4 → bitmap ölçekleri
      const scaleX = img.width / COORD_BASE.width;
      const scaleY = img.height / COORD_BASE.height;

      hitRectsRef.current = [];

      // >>> YÜZDE tabanlı overlay listesi
      const rectsForInputs: Array<{
        tab: SignerTab;
        leftPct: number;
        topPct: number;
        widthPct: number;
        heightPct: number;
        kind: "text" | "date" | "display";
        displayValue?: string;
      }> = [];

      const tabsForPage =
        signerTabs?.filter((t) => t.documentId === page.id) ?? [];
      tabsForPage.forEach((t) => {
        const kind = (t.tab_type || "default").toLowerCase();

        // --- koordinat dönüşümü (piksel) ---
        let x: number, y: number;
        if (isPct(t.x_pos, t.y_pos)) {
          x = Math.round(t.x_pos * img.width);
          y = Math.round(t.y_pos * img.height);
        } else {
          x = Math.round(t.x_pos * scaleX);
          y = Math.round(t.y_pos * scaleY);
        }

        /* ---------- CHECKBOX (sadece kullanıcının kendi alanları) ---------- */
        if (kind === "checkbox" && isUserTab(t, otpCode, signerInformation)) {
          const s = Math.round(
            DEFAULT_SIZES.checkbox.w * Math.min(scaleX, scaleY)
          );
          const cx = x;
          const cy = y;
          const checked = !!checkboxByTab[t.tabId];
          const stroke = "#000000ff";

          ctx.save();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = stroke;
          ctx.fillStyle = "#fff";

          const r = Math.max(2 * Math.min(scaleX, scaleY), 2);
          const right = cx + s,
            bottom = cy + s;
          ctx.beginPath();
          ctx.moveTo(cx + r, cy);
          ctx.lineTo(right - r, cy);
          ctx.quadraticCurveTo(right, cy, right, cy + r);
          ctx.lineTo(right, bottom - r);
          ctx.quadraticCurveTo(right, bottom, right - r, bottom);
          ctx.lineTo(cx + r, bottom);
          ctx.quadraticCurveTo(cx, bottom, cx, bottom - r);
          ctx.lineTo(cx, cy + r);
          ctx.quadraticCurveTo(cx, cy, cx + r, cy);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          if (checked) {
            const pad = Math.max(0.18 * s, 6);
            ctx.lineWidth = Math.max(2.8 * Math.min(scaleX, scaleY), 2);
            ctx.strokeStyle = "#2e7d32";
            ctx.beginPath();
            ctx.moveTo(cx + pad, cy + s * 0.55);
            ctx.lineTo(cx + s * 0.45, cy + s - pad);
            ctx.lineTo(cx + s - pad, cy + pad * 0.9);
            ctx.stroke();
          }
          ctx.restore();

          hitRectsRef.current.push({ tab: t, x: cx, y: cy, w: s, h: s, kind });
          return;
        }

        /* ---------- SIGNATURE (sadece kullanıcının kendi alanları) ---------- */
        if (
          (kind === "signature" || t.isSignature) &&
          isUserTab(t, otpCode, signerInformation)
        ) {
          const size = DEFAULT_SIZES.signature;
          const w = Math.round(size.w * scaleX);
          const h = Math.round(size.h * scaleY);
          const sigObj = signaturesByTab[t.tabId]; // <- obje

          const isActive = activeSignatureTab === t.tabId;
          const borderColor = sigObj?.isSigned
            ? "#4caf50" // imzalı: yeşil
            : isActive
            ? "#2196f3" // AKTİF: mavi
            : "#e21414ff"; // pasif: kırmızı
          const borderWidth = isActive ? 5 : 4;

          if (sigObj?.isSigned && sigObj.dataUrl) {
            const sImg = new Image();
            sImg.src = sigObj.dataUrl;
            sImg.onload = () => {
              ctx.drawImage(sImg, x, y, w, h);
              ctx.save();
              ctx.lineWidth = 3;
              ctx.setLineDash([6, 3]);
              ctx.strokeStyle = "#4caf50";
              ctx.strokeRect(x, y, w, h);
              ctx.restore();
            };
          } else {
            ctx.save();
            ctx.setLineDash([6, 3]);
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
          }

          hitRectsRef.current.push({ tab: t, x, y, w, h, kind: "signature" });
          return;
        }

        /* ---------- TEXT/NAME/DATE (sadece kullanıcının kendi alanları) ---------- */
        if (
          (kind === "text" ||
            kind === "name" ||
            kind === "date" ||
            kind === "email" ||
            kind === "phone") &&
          isUserTab(t, otpCode, signerInformation)
        ) {
          const size = DEFAULT_SIZES[kind] ?? DEFAULT_SIZES.default;
          const w = Math.round(size.w * scaleX);
          const h = Math.round(size.h * scaleY);

          // Düzenlenebilir mi kontrol et
          if (isEditableField(t)) {
            // Düzenlenebilir alan (date/text) - arka plan YOK
            const mapKind =
              (t.content_type || "").toLowerCase() === "date" ? "date" : "text";
            rectsForInputs.push({
              tab: t,
              leftPct: (x / img.width) * 100,
              topPct: (y / img.height) * 100,
              widthPct: (w / img.width) * 100,
              heightPct: (h / img.height) * 100,
              kind: mapKind,
            });
          } else {
            // Düzenlenemez alan (email/name/phone) - hafif arka plan EKLE
            ctx.save();
            ctx.fillStyle = "rgba(4, 7, 10, 0.15)";
            ctx.fillRect(x, y, w, h);
            ctx.restore();

            const displayValue = getDisplayValue(t, signerInformation);
            rectsForInputs.push({
              tab: t,
              leftPct: (x / img.width) * 100,
              topPct: (y / img.height) * 100,
              widthPct: (w / img.width) * 100,
              heightPct: (h / img.height) * 100,
              kind: "display",
              displayValue,
            });
          }
          return;
        }
      });

      setEditableRects(rectsForInputs);
    };
  }, [
    pages,
    currentPage,
    signerTabs,
    signaturesByTab,
    checkboxByTab,
    otpCode,
    signerInformation,
    activeSignatureTab,
  ]);

  /* ----- canvas click: only toggle checkbox (sadece kullanıcının kendi alanları) ----- */
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const xx = ((e.clientX - r.left) / r.width) * c.width;
    const yy = ((e.clientY - r.top) / r.height) * c.height;

    const hit = hitRectsRef.current.find(
      (h) => xx >= h.x && xx <= h.x + h.w && yy >= h.y && yy <= h.y + h.h
    );
    if (!hit) return;

    const kind = (hit.tab.tab_type || "").toLowerCase();

    // Checkbox toggle
    if (kind === "checkbox" && isUserTab(hit.tab, otpCode, signerInformation)) {
      const initial = String(hit.tab.contents).toLowerCase() === "true";
      setCheckboxByTab((prev) => ({
        ...prev,
        [hit.tab.tabId]: !(prev[hit.tab.tabId] ?? initial),
      }));
      return;
    }

    // Signature field activation
    if (
      kind === "signature" &&
      isUserTab(hit.tab, otpCode, signerInformation)
    ) {
      // Clear canvas when switching to different field
      if (activeSignatureTab !== hit.tab.tabId) {
        padClearRef.current?.();
      }
      setActiveSignatureTab(hit.tab.tabId);
      setSignaturePadEnabled(true);
      showSnackbar(t("info_signature_activated"), "info");
    }
  };

  /* ----- Save signature from pad: auto-place to my box ----- */
  const saveSignatureFromPad = (dataUrl: string) => {
    if (!activeSignatureTab) {
      showSnackbar(t("warning_click_signature_first"), "warning");
      return;
    }

    // Save signature to active tab
    setSignaturesByTab((prev) => ({
      ...prev,
      [activeSignatureTab]: { dataUrl, isSigned: true },
    }));

    // Clear canvas and disable pad
    padClearRef.current?.();
    setSignaturePadEnabled(false);
    setActiveSignatureTab(null);

    showSnackbar(t("success_signature_saved"), "success");
  };

  /* ----- Build payload & submit ----- */
  const handleSend = async () => {
    // Get all user's signature tabs
    const myTabs = signerTabs.filter(
      (t) =>
        (t.tab_type || "").toLowerCase() === "signature" &&
        isUserTab(t, otpCode, signerInformation)
    );

    if (!myTabs.length) {
      showSnackbar(t("error_no_signature_field"), "error");
      return;
    }

    // Check if all signature fields are filled
    const unsignedTabs = myTabs.filter(
      (t) => !signaturesByTab[t.tabId]?.isSigned
    );
    if (unsignedTabs.length > 0) {
      showSnackbar(t("warning_fill_all_signatures"), "warning");
      return;
    }

    // Check text/date fields
    const myEditableTabs = signerTabs.filter((t) => {
      const k = (t.tab_type || "").toLowerCase();
      const isTextLike = k === "text" || k === "date" || k === "name";
      return (
        isTextLike &&
        isUserTab(t, otpCode, signerInformation) &&
        isEditableField(t)
      );
    });

    const empties = myEditableTabs.filter((t) => {
      const val = (inputsByTab[t.tabId] ?? "").trim();
      return val.length === 0;
    });

    if (empties.length > 0) {
      showSnackbar(t("warning_fill_all_text_date"), "warning");
      const first = empties[0];
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          `[data-tab-id="${first.tabId}"]`
        );
        el?.focus();
      }, 50);
      return;
    }

    // Prepare signatures array

    const signaturesArray = myTabs.map((t) => ({
      signatureBase64: stripDataPrefix(signaturesByTab[t.tabId].dataUrl),
      documentId: String(t.documentId),
      signerCode: String(t.signerGeneratedAuthCode),
    }));

    // Prepare checkboxes
    const myCheckboxTabs = signerTabs.filter(
      (t) =>
        (t.tab_type || "").toLowerCase() === "checkbox" &&
        isUserTab(t, otpCode, signerInformation)
    );

    const checkboxes = myCheckboxTabs.map((t) => {
      const initial = String(t.contents).toLowerCase() === "true";
      const checked = checkboxByTab[t.tabId] ?? initial;
      return {
        signerId: t.signerId.toString(),
        content: checked ? "true" : "false",
        checkboxDocId: t.documentId.toString(),
      };
    });

    const texts = myEditableTabs.map((t) => ({
      signerId: t.signerId.toString(),
      tabId: String(t.tabId),
      type: (t.content_type || t.tab_type || "").toLowerCase(),
      content: String(inputsByTab[t.tabId] ?? "").trim(),
      textboxDocId: t.documentId.toString(),
    }));

    const payload = {
      documentGroup: String(signerInformation?.documentGroupId ?? ""),
      signerMail: String(signerInformation?.signerMail ?? ""),
      signerName: String(signerInformation?.userName ?? ""),
      signerCode: String(otpCode),
      documentId: String(signerInformation?.documentId ?? ""),
      signatures: signaturesArray, // NEW: Array of signatures with tabId
      metadataInfo: await getMetadataInfo(),
      checkboxes,
      isThereCheckBox: checkboxes.length > 0 ? "true" : "false",
      textboxes: texts,
      isThereText: texts.length > 0 ? "true" : "false",
    };

    try {
      const res = await fetch("/api/signDocument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showSnackbar(data?.error || t("error_sign_failed"), "error");
      } else {
        showSnackbar(t("success_sign_ok"), "success", 5000);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
      showSnackbar(t("error_network"), "error");
    }
  };

  /* ----- UI ----- */
  if (!pages.length) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        {t("no_pages_message")}
      </Box>
    );
  }

  return (
    <Dialog open fullWidth onClose={() => {}} maxWidth="md">
      <Box sx={{ p: { xs: "20px", md: "50px" } }} className="scrollbar">
        {/* PAGE CANVAS */}
        <Box sx={{ width: "100%", mb: 1.5, position: "relative" }}>
          <canvas
            ref={canvasRef}
            onClick={onCanvasClick}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 8,
              boxShadow: "rgba(0,0,0,.25) 0 2px 8px",
              cursor: "pointer",
            }}
          />

          {/* Overlay Text Inputs - Sadece kullanıcının kendi alanları */}
          {editableRects
            .filter((r) => r.tab.documentId === pages[currentPage]?.id)
            .map(
              ({
                tab,
                leftPct,
                topPct,
                widthPct,
                heightPct,
                kind,
                displayValue,
              }) => {
                // Taşma kontrolü - maksimum genişlik hesapla
                const maxWidthPct = 100 - leftPct - 2; // 2% margin bırak
                const currentText = inputsByTab[tab.tabId] ?? "";

                // Text uzunluğuna göre genişlik hesapla (sadece text alanları için)
                let dynamicWidth = widthPct;
                if (kind === "text" && currentText.length > 0) {
                  // Her karakter için yaklaşık 0.6em genişlik
                  const estimatedWidth = Math.max(
                    widthPct,
                    currentText.length * 0.8 + 5
                  );
                  dynamicWidth = Math.min(estimatedWidth, maxWidthPct);
                }

                return (
                  <Box
                    key={tab.tabId}
                    sx={{
                      position: "absolute",
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${dynamicWidth}%`, // Dinamik genişlik
                      height: `${heightPct}%`,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      pointerEvents: kind === "display" ? "none" : "auto",
                      transition: "width 0.2s ease", // Yumuşak geçiş
                    }}
                  >
                    {kind === "display" ? (
                      // Düzenlenemez alan - sadece text göster
                      <Box
                        border={"none"}
                        sx={{
                          width: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {displayValue}
                      </Box>
                    ) : (
                      // Düzenlenebilir alan - input göster
                      <input
                        data-tab-id={tab.tabId}
                        type={kind === "date" ? "date" : "text"}
                        value={currentText}
                        onChange={(e) =>
                          setInputsByTab((prev) => ({
                            ...prev,
                            [tab.tabId]: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 6,
                          border: "1px solid rgba(0,0,0,0.3)",
                          padding: "6px 10px",
                          fontSize: "14px",
                          outline: "none",
                          background: "rgba(255,255,255,0.96)",
                          boxSizing: "border-box",
                          whiteSpace: "nowrap", // Tek satırda tut
                          overflow: "hidden", // Taşma durumunda gizle
                        }}
                        placeholder={
                          tab.label ||
                          (kind === "date"
                            ? "yyyy-mm-dd"
                            : t("text_area_placeholder"))
                        }
                      />
                    )}
                  </Box>
                );
              }
            )}
        </Box>

        {/* PAGINATION */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Button
            variant="text"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            {t("pagination_back")}
          </Button>
          <Typography>
            {t("page_label_prefix")} {currentPage + 1} / {pages.length}
          </Typography>
          <Button
            variant="text"
            disabled={currentPage === pages.length - 1}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            {t("pagination_next")}
          </Button>
        </Box>

        {/* SIGNATURE PAD (your updated one) */}
        <SignaturePad
          onSave={saveSignatureFromPad}
          onClearRef={(fn) => (padClearRef.current = fn)}
          clear={() => padClearRef.current?.()}
          handleSend={handleSend}
          onEmpty={(msg) => showSnackbar(msg, "warning")}
          disabled={!signaturePadEnabled} // YENİ PROP
        />
      </Box>
    </Dialog>
  );
}

/* =========================
   Metadata helper (IP, UA, tz, coords)
   ========================= */
async function getMetadataInfo() {
  // IP
  let ip = "unknown";
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const j = await r.json();
    ip = j.ip || "unknown";
  } catch {}

  // Geolocation
  const coords = await new Promise<{ lat: string; lon: string }>((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: String(pos.coords.latitude),
            lon: String(pos.coords.longitude),
          }),
        () => resolve({ lat: "unknown", lon: "unknown" }),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else resolve({ lat: "unknown", lon: "unknown" });
  });

  return [
    `ip=${ip}`,
    `userAgent=${navigator.userAgent}`,
    `language=${navigator.language}`,
    `platform=${navigator.platform}`,
    `timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `lat=${coords.lat}`,
    `lon=${coords.lon}`,
  ].join("|");
}
