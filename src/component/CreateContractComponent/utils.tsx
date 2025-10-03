"use client";
import DrawIcon from "@mui/icons-material/Draw";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import NoteIcon from "@mui/icons-material/Note";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { v4 as uuid } from "uuid";
import { useCallback, useEffect, useRef, useState } from "react";

export type DraggableFieldDef = {
  i18nKey: string;
  fieldType:
    | "signature"
    | "name"
    | "email"
    | "text"
    | "phone"
    | "date"
    | "checkbox";
  icon: any;
};

export const DRAGGABLE_FIELD_DEFS: DraggableFieldDef[] = [
  { i18nKey: "fieldSignature", fieldType: "signature", icon: DrawIcon },
  { i18nKey: "fieldFullName", fieldType: "name", icon: PersonIcon },
  { i18nKey: "fieldEmail", fieldType: "email", icon: EmailIcon },
  { i18nKey: "fieldText", fieldType: "text", icon: NoteIcon },
  { i18nKey: "fieldPhone", fieldType: "phone", icon: PhoneAndroidIcon },
  { i18nKey: "fieldDate", fieldType: "date", icon: NoteIcon },
  { i18nKey: "fieldCheckbox", fieldType: "checkbox", icon: DoneAllIcon },
];

export type Recipient = {
  color: string;
  Signer: string; // e-posta veya benzersiz anahtar
  SignerName: string;
  phoneNumber?: string;
};

export type PlacedItem = {
  id: string;
  x: number;
  y: number;
  page: number;
  color: string;
  label: string;
  tab_type:
    | "text"
    | "name"
    | "email"
    | "phone"
    | "signature"
    | "date"
    | "checkbox"
    | string;
  content_type: "text" | string;
  Font?: string;
  FontSize?: string;
  recipientKey: string;
  Signer: string;
  SignerName: string;
  phoneNumber?: string;
  checked?: string;
  date?: string;
};

export type DocNameDesc = {
  DocumentName: string;
  DocumentDesc: string;
};
export const labelByType: Record<string, string> = DRAGGABLE_FIELD_DEFS.reduce(
  (acc: any, f: any) => {
    acc[f.fieldType] = f.label;
    return acc;
  },
  {}
);
export function buildPageIndex(
  docs?: Array<{
    id: number;
    isFirstPage?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>
): Record<number, number> {
  if (!Array.isArray(docs) || docs.length === 0) return {};
  // 1) Önce ilk sayfayı (isFirstPage) başa al, sonra createdAt veya id ile sırala
  const sorted = [...docs].sort((a, b) => {
    const aFirst = a.isFirstPage ? 1 : 0;
    const bFirst = b.isFirstPage ? 1 : 0;
    if (aFirst !== bFirst) return bFirst - aFirst; // true önce
    // createdAt varsa ona göre, yoksa id'ye göre
    if (a.createdAt && b.createdAt) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return (a.id || 0) - (b.id || 0);
  });

  const map: Record<number, number> = {};
  sorted.forEach((d, i) => {
    map[d.id] = i + 1; // 1-based page no
  });
  return map;
}
export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v ?? 0));
}

export type SavedTab = {
  signerId: number;
  signerMail: string;
  signerName: string;
  phoneNumber?: string;
  tabId: number;
  documentId: number;
  tab_type: string;
  x_pos: number; // 0..1
  y_pos: number; // 0..1
  label?: string;
  isSignature?: boolean;
  content_type?: string;
  contents?: string; // text/date içeriği burada
  font?: string;
  fontsize?: number;
  page?: number; // yoksa 1 varsayıyoruz
};

export function normalizeByDocumentId(rows: SavedTab[]): SavedTab[] {
  const infoMap = new Map<
    number,
    { mail?: string; name?: string; phone?: string }
  >();

  // İlk tur: dolu alanları yakala
  for (const r of rows) {
    if (!infoMap.has(r.documentId)) {
      infoMap.set(r.documentId, {});
    }
    const entry = infoMap.get(r.documentId)!;
    if (r.signerMail && r.signerMail !== "-") entry.mail = r.signerMail;
    if (r.signerName && r.signerName !== "-") entry.name = r.signerName;
    if (r.phoneNumber && r.phoneNumber !== "-") entry.phone = r.phoneNumber;
  }

  // İkinci tur: eksik olanları doldur
  return rows.map((r) => {
    const entry = infoMap.get(r.documentId);
    return {
      ...r,
      signerMail:
        r.signerMail && r.signerMail !== "-"
          ? r.signerMail
          : entry?.mail || "-",
      signerName:
        r.signerName && r.signerName !== "-"
          ? r.signerName
          : entry?.name || "-",
      phoneNumber:
        r.phoneNumber && r.phoneNumber !== "-" ? r.phoneNumber : entry?.phone,
    };
  });
}

export function mapSavedToPlaced(
  s: SavedTab,
  recipients: Recipient[]
): PlacedItem {
  let userMail: string;

  if (s.signerMail && s.signerMail !== "-") {
    // signerMail varsa kesinlikle onu kullan
    userMail = s.signerMail;
  } else {
    // signerMail yoksa signerName'e bak
    if (s.signerName === "-") {
      // signerName "-" ise ilk kullanıcıyı al
      userMail = recipients[0]?.Signer || "";
    } else {
      // signerName mail formatında ise onu kullan
      userMail = s.signerName;
    }
  }

  const rec = recipients.find((r) => r.Signer === userMail);
  const fallbackLabel =
    s.label || labelByType[s.tab_type] || s.tab_type || "Alan";

  return {
    id: uuid(), // yeni client id
    x: clamp01(s.x_pos),
    y: clamp01(s.y_pos),
    page: s.page && s.page > 0 ? s.page : 1,

    color: rec?.color || "#9CA3AF", // nötr gri
    label: fallbackLabel,

    tab_type: s.tab_type as any,
    content_type: (s.content_type || "text") as any,
    Font: s.font || "Arial",
    FontSize: String(s.fontsize ?? 24),

    recipientKey: rec?.Signer || userMail,
    Signer: userMail,
    SignerName: s.signerName,
    phoneNumber: rec?.phoneNumber || s.phoneNumber,
  };
}

// text/date olanlar için textFieldValues seed
// utils.ts dosyasında seedTextValueIfNeeded fonksiyonunu güncelle
export function seedTextValueIfNeeded(s: SavedTab, placedId: string) {
  const isTextLike = s.tab_type === "text" || s.tab_type === "date";
  if (!isTextLike) return null;

  // Tarih alanı için özel kontrol
  let textContent = s.contents || "";
  if (s.tab_type === "date" && textContent) {
    // Eğer içerik tarih formatında değilse, bugünün tarihini kullan
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD formatı
    if (!dateRegex.test(textContent)) {
      // Eski tarih formatlarını dönüştürmeye çalış (gg.aa.yyyy gibi)
      const turkishDateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      const match = textContent.match(turkishDateRegex);
      if (match) {
        const [, day, month, year] = match;
        textContent = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
      } else {
        // Format tanınamadıysa bugünün tarihini kullan
        textContent = new Date().toISOString().split("T")[0];
      }
    }
  } else if (s.tab_type === "date" && !textContent) {
    // Tarih alanı boşsa bugünün tarihini kullan
    textContent = new Date().toISOString().split("T")[0];
  }

  return {
    id: placedId,
    textField: textContent,
    font: s.font || "Arial",
    FontSize: String(s.fontsize ?? 24),
  };
}
export function usePdfRenderer(pdfDoc: any, imageUrls?: string[]) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const renderTaskRef = useRef<any>(null);

  const doRender = useCallback(
    async (pageNo: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      // PNG/görsel modu
      if (!pdfDoc && imageUrls?.length) {
        const img = new Image();
        img.onload = () => {
          const maxW = 595;
          const ratio = img.width / img.height;
          const w = maxW;
          const h = Math.round(maxW / ratio);
          canvas.width = w;
          canvas.height = h;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
        };
        img.src = imageUrls[pageNo - 1];
        return;
      }

      // PDF modu
      if (pdfDoc) {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
          renderTaskRef.current = null;
        }
        const page = await pdfDoc.getPage(pageNo);
        const viewport = page.getViewport({ scale: 1.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        try {
          await task.promise;
        } finally {
          renderTaskRef.current = null;
        }
      }
    },
    [pdfDoc, imageUrls]
  );

  useEffect(() => {
    setNumPages(pdfDoc?.numPages ?? imageUrls?.length ?? 0);
    doRender(pageNumber);
  }, [pdfDoc, imageUrls, pageNumber, doRender]);

  useEffect(
    () => () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    },
    []
  );

  return { canvasRef, numPages, pageNumber, setPageNumber };
}

export async function pdfToBase64Pages(pdfDoc: any): Promise<string[]> {
  const out: string[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    out.push(canvas.toDataURL("image/png").split(",")[1]);
  }
  return out;
}

export function buildPayload(params: {
  documentNameAndDesc: DocNameDesc | null;
  userId: string | number | undefined;
  numPages: number;
  itemsByPage: Record<number, PlacedItem[]>;
  textFieldValues: Array<{
    id: string;
    textField: string;
    font: string;
    FontSize: string;
  }>;
  pdfDoc: any;
  compOfUser: any;
  pageBase64s?: string[]; // NEW
}) {
  const {
    documentNameAndDesc,
    userId,
    numPages,
    itemsByPage,
    textFieldValues,
    pdfDoc,
    compOfUser,
    pageBase64s, // NEW
  } = params;

  const toSignItems = (items: PlacedItem[]) =>
    items.map((item) => {
      if (item.tab_type === "text") {
        if (true) {
          return {
            ...item,
            content: "-",
            content_type: "text",
          };
        }
        return item;
      }
      if (item.tab_type === "date") {
        if (true)
          return {
            ...item,
            content: "-",
            content_type: "date",
          };
        return item;
      }
      if (item.tab_type === "checkbox") {
        return { ...item, content: "false", content_type: "checkbox" };
      }
      if (item.tab_type === "phone") {
        return {
          ...item,
          content: item.phoneNumber ?? "",
          content_type: "phoneNumber",
        };
      }
      if (item.tab_type === "email") {
        return { ...item, content: item.Signer ?? "", content_type: "email" };
      }
      if (item.tab_type === "name") {
        return {
          ...item,
          content: item.SignerName ?? "",
          content_type: "name",
        };
      }

      return item;
    });

  return (async () => {
    const pageBase64sArr =
      pageBase64s && pageBase64s.length
        ? pageBase64s // template → hazır base64 kullan
        : await pdfToBase64Pages(pdfDoc); // PDF → canvas’tan üret

    const pages = Array.from({ length: numPages }, (_, i) => {
      const pageNo = i + 1;
      const items = itemsByPage[pageNo] ?? [];
      const signs = toSignItems(items);

      const isItSigned = items.some((x) => x.tab_type === "signature");
      return {
        isFirstPage: pageNo === 1,
        filename: "",
        pdf_base64: pageBase64sArr[i] || "",
        isItSigned,
        signs,
      };
    });

    return {
      DocumentName: documentNameAndDesc?.DocumentName,
      DocumentDesc: documentNameAndDesc?.DocumentDesc,
      writer: userId,
      DocumentRelatedComp: compOfUser?.toString?.(),
      VisibilitySetting: "1",
      isTemplate: pageBase64s && pageBase64s.length ? "true" : "false",
      pages,
    };
  })();
}
export function hexToRgba(hex: string, alpha: number) {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" +
      [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
      "," +
      alpha +
      ")"
    );
  }
  return hex;
}
