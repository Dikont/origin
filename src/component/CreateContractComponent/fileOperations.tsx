"use client";

import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { v4 as uuid } from "uuid";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "../SnackbarProvider";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearSignerTabs } from "@/store/slices/formSlice";
import {
  buildPageIndex,
  buildPayload,
  DocNameDesc,
  DRAGGABLE_FIELD_DEFS,
  hexToRgba,
  mapSavedToPlaced,
  normalizeByDocumentId,
  PlacedItem,
  Recipient,
  SavedTab,
  seedTextValueIfNeeded,
  usePdfRenderer,
} from "./utils";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
export default function Index({
  pdfDoc,
  imageUrls,
  pageBase64s,
}: {
  pdfDoc?: any;
  imageUrls?: string[];
  pageBase64s?: string[];
}) {
  const qs = useSearchParams();
  const followCard = qs.get("followCard");
  const t = useTranslations("createContract");
  const draggableFields = useMemo(
    () =>
      DRAGGABLE_FIELD_DEFS.map((d) => ({
        label: t(d.i18nKey),
        fieldType: d.fieldType,
        icon: d.icon,
      })),
    [t],
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const didHydrateFromSaved = useRef(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });

  const { showSnackbar } = useSnackbar();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const router = useRouter();
  const documentNameAndDesc = useSelector(
    (s: RootState) => s.form.documentNameAndDesc,
  ) as DocNameDesc | null;

  const recipients = useSelector(
    (s: RootState) => s.form.recipients,
  ) as Recipient[];
  const savedsignerTabDatas = useSelector(
    (s: RootState) => s.form.signerTabs,
  ) as Recipient[];

  type SavedDoc = {
    id: number;
    isFirstPage?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  const savedDocs = useSelector((s: RootState) => s.form.docs) as SavedDoc[];
  const pageIndex = useMemo(() => buildPageIndex(savedDocs), [savedDocs]);
  const [selectedKey, setSelectedKey] = useState<string>(
    recipients?.[0]?.Signer || "",
  );
  const selectedRecipient = useMemo(
    () => recipients.find((r) => r.Signer === selectedKey),
    [recipients, selectedKey],
  );

  const [userId, setUserId] = useState<string | number | undefined>(undefined);
  const [compOfUser, setCompOfUser] = useState<number | null>(null);
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  type DragState = {
    id: string;
    page: number;
    grabDX: number;
    grabDY: number;
  } | null;

  const [dragging, setDragging] = useState<DragState>(null);
  const [isActuallyDragging, setIsActuallyDragging] = useState(false);
  const DRAG_THRESHOLD = 3;
  const dragStartXY = useRef<{ x: number; y: number } | null>(null);
  const [itemsByPage, setItemsByPage] = useState<Record<number, PlacedItem[]>>(
    {},
  );
  const lastDragRef = useRef<{ id: string; at: number } | null>(null);

  useEffect(() => {
    if (didHydrateFromSaved.current) return;
    if (!Array.isArray(savedsignerTabDatas) || savedsignerTabDatas.length === 0)
      return;
    if (!Array.isArray(recipients) || recipients.length === 0) return;

    const byPage: Record<number, PlacedItem[]> = {};
    const seededTexts: Array<{
      id: string;
      textField: string;
      font: string;
      FontSize: string;
    }> = [];

    const normalized = normalizeByDocumentId(savedsignerTabDatas as any[]);
    normalized.forEach((raw) => {
      const s = raw as SavedTab;
      const placed = mapSavedToPlaced(s, recipients);
      const docId = s.documentId;
      if (docId && pageIndex[docId]) {
        placed.page = pageIndex[docId];
      } else if (typeof s.page === "number" && s.page > 0) {
        placed.page = s.page;
      } else {
        placed.page = 1;
      }
      if (!byPage[placed.page]) byPage[placed.page] = [];
      byPage[placed.page].push(placed);

      const seed = seedTextValueIfNeeded(s, placed.id);
      if (seed) seededTexts.push(seed);
    });

    setItemsByPage((prev) => {
      const next = { ...prev };
      Object.entries(byPage).forEach(([p, arr]) => {
        const pageNo = Number(p);
        next[pageNo] = (next[pageNo] || []).concat(arr as any);
      });
      return next;
    });

    if (seededTexts.length) {
      setTextFieldValues((prev) => {
        const prevMap = new Map(prev.map((t) => [t.id, t]));
        seededTexts.forEach((t) => prevMap.set(t.id, t));
        return Array.from(prevMap.values());
      });
    }

    didHydrateFromSaved.current = true;
    dispatch(clearSignerTabs());
  }, [savedsignerTabDatas, recipients, savedDocs, pageIndex, dispatch]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!dragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (!isActuallyDragging && dragStartXY.current) {
        const dx0 = Math.abs(e.clientX - dragStartXY.current.x);
        const dy0 = Math.abs(e.clientY - dragStartXY.current.y);
        if (dx0 > DRAG_THRESHOLD || dy0 > DRAG_THRESHOLD) {
          setIsActuallyDragging(true);
        } else {
          return;
        }
      }

      const xPx = cx - dragging.grabDX;
      const yPx = cy - dragging.grabDY;

      const xPct = clamp01(xPx / rect.width);
      const yPct = clamp01(yPx / rect.height);

      setItemsByPage((prev) => {
        const list = prev[dragging.page] ?? [];
        const next = list.map((it) =>
          it.id === dragging.id ? { ...it, x: xPct, y: yPct } : it,
        );
        return { ...prev, [dragging.page]: next };
      });
    };

    const handleUp = () => {
      if (isActuallyDragging && dragging?.id) {
        lastDragRef.current = { id: dragging.id, at: Date.now() };
        setTimeout(() => {
          if (
            lastDragRef.current &&
            Date.now() - lastDragRef.current.at > 180
          ) {
            lastDragRef.current = null;
          }
        }, 200);
      }
      setDragging(null);
      setIsActuallyDragging(false);
      dragStartXY.current = null;
    };

    if (dragging) {
      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      document.body.style.cursor = "grabbing";
    }
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      document.body.style.cursor = "";
    };
  }, [dragging, isActuallyDragging, clamp01]);

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)user=([^;]+)/);
    if (!m) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(m[1]));
      setUserId(parsed?.user?.id);
      setCompOfUser(parsed?.compOfUser.id);
    } catch {}
  }, []);

  const { canvasRef, numPages, pageNumber, setPageNumber } = usePdfRenderer(
    pdfDoc,
    imageUrls,
  );

  const [textFieldValues, setTextFieldValues] = useState<
    Array<{ id: string; textField: string; font: string; FontSize: string }>
  >([]);

  const fieldRefs = useRef<HTMLDivElement[]>([]);
  useEffect(() => {
    setDragging(null);
    setIsActuallyDragging(false);
    dragStartXY.current = null;
  }, [pageNumber]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedRecipient) {
      showSnackbar(t("selectRecipientFirst"), "error");
      return;
    }
    const canvasEl = canvasRef.current!;
    const canvasRect = canvasEl.getBoundingClientRect();

    const dx = e.clientX - canvasRect.left;
    const dy = e.clientY - canvasRect.top;

    const xPct = Math.max(0, Math.min(1, dx / canvasRect.width));
    const yPct = Math.max(0, Math.min(1, dy / canvasRect.height));

    const dragged = JSON.parse(e.dataTransfer.getData("application/json"));

    // Tarih alanı için bugünün tarihini al
    const getTodayDate = () => {
      const today = new Date();
      return today.toISOString().split("T")[0]; // YYYY-MM-DD formatı
    };

    const item: PlacedItem = {
      id: uuid(),
      x: xPct,
      y: yPct,
      page: pageNumber,
      color: selectedRecipient.color,
      label: dragged.label,
      tab_type: dragged.fieldType,
      content_type: "text",
      Font: "Arial",
      FontSize: "24",
      recipientKey: selectedRecipient.Signer,
      Signer: selectedRecipient.Signer,
      SignerName: selectedRecipient.SignerName,
      phoneNumber: selectedRecipient.phoneNumber,
      Language: selectedRecipient.Language,
      date: dragged.fieldType === "date" ? getTodayDate() : undefined,
    };

    // Eğer tarih alanıysa, textFieldValues'a da bugünün tarihini ekle
    if (dragged.fieldType === "date") {
      setTextFieldValues((prev) => [
        ...prev,
        {
          id: item.id,
          textField: getTodayDate(),
          font: "Arial",
          FontSize: "24",
        },
      ]);
    }

    setItemsByPage((prev) => {
      const arr = prev[pageNumber] ? [...prev[pageNumber], item] : [item];
      return { ...prev, [pageNumber]: arr };
    });
  };

  const handleRemoveItem = (page: number, id: string) => {
    setItemsByPage((prev) => ({
      ...prev,
      [page]: (prev[page] ?? []).filter((x) => x.id !== id),
    }));
    setTextFieldValues((prev) => prev.filter((x) => x.id !== id));
  };

  const handleSave = async (control: 1 | 2) => {
    if (Object.values(itemsByPage).flat().length === 0) {
      showSnackbar(t("fillAllFields"), "error");
      return;
    }

    setLoading(true);
    try {
      const payload = await buildPayload({
        documentNameAndDesc,
        userId,
        numPages,
        itemsByPage,
        textFieldValues,
        pdfDoc,
        compOfUser,
        pageBase64s,
      });

      const getCookie = (name: string): string | null => {
        const match = document.cookie.match(
          new RegExp(`(?:^|; )${name}=([^;]*)`),
        );
        return match ? decodeURIComponent(match[1]) : null;
      };

      const token = getCookie("token");
      if (followCard) {
        try {
          await fetch("/api/DeleteSignProcess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ docGId: Number(followCard) }),
          });
        } catch {}
      }
      const url = control == 1 ? "/api/sendMailForSign" : "/api/upload";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        setLoading(false);
        showSnackbar(
          control == 1 ? t("createdAndMailed") : t("createdAndSaved"),
          "success",
        );
      } else {
        setLoading(false);
        showSnackbar(t("createFailedLimit"), "error");
      }

      control == 1
        ? router.push("/dashboard")
        : router.push("/followContracts");
    } catch (err) {
      console.error(err);
      showSnackbar(t("createFailedGeneric"), "error");
    } finally {
      setLoading(false);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const getTextMeta = useCallback(
    (id: string) => {
      const m = textFieldValues.find((t) => t.id === id);
      return {
        text: m?.textField ?? "",
        font: m?.font ?? "Arial",
        size: m?.FontSize ?? "24",
      };
    },
    [textFieldValues],
  );

  const commitEdit = () => {
    if (!editingId) return;
    const next = {
      id: editingId,
      textField: editingValue,
      font: getTextMeta(editingId).font,
      FontSize: getTextMeta(editingId).size,
    };
    setTextFieldValues((prev) => {
      const others = prev.filter((x) => x.id !== editingId);
      return [...others, next];
    });
    setEditingId(null);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  useLayoutEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      setCanvasSize({ w, h });
      setCanvasReady(w > 10 && h > 10);
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    setCanvasReady(false);
  }, [pageNumber]);

  return (
    <Box>
      {loading && (
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open>
          <CircularProgress sx={{ color: "#2e7d32" }} size={100} />
        </Backdrop>
      )}

      <Grid container spacing={3}>
        {/* Sol panel */}
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <Select
              value={selectedKey}
              onChange={(e) => setSelectedKey(String(e.target.value))}
              sx={{
                backgroundColor: "#fff",
                color: selectedRecipient?.color || "#000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: selectedRecipient?.color || "#ccc",
                },
              }}
            >
              {recipients.map((r) => (
                <MenuItem
                  key={r.Signer}
                  value={r.Signer}
                  sx={{ color: r.color }}
                >
                  {r.SignerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h5" fontWeight={600} mt={2} mb={1}>
            {t("standardFields")}
          </Typography>
          <Box>
            {draggableFields.map((item: any, idx: number) => {
              const Icon = item.icon;
              return (
                <Box
                  key={idx}
                  ref={(el: HTMLDivElement | null) => {
                    if (el) fieldRefs.current[idx] = el;
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify(item),
                    );
                    const img = fieldRefs.current[idx];
                    if (img) e.dataTransfer.setDragImage(img, 0, 0);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: selectedRecipient?.color || "#ccc",
                    cursor: "grab",
                    userSelect: "none",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                      p: 0.5,
                      display: "flex",
                    }}
                  >
                    <Icon
                      fontSize="small"
                      sx={{ color: selectedRecipient?.color || "#000" }}
                    />
                  </Box>

                  <Typography variant="body2" fontWeight={700} color="white">
                    {item.label}
                  </Typography>
                </Box>
              );
            })}
            <Divider sx={{ my: 2 }} />
          </Box>
        </Grid>

        {/* Orta panel */}
        <Grid
          size={{ xs: 12, md: 6 }}
          justifyContent={"center"}
          display={"flex"}
        >
          <Box
            sx={{
              border: "3px dashed #646E9F",
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "#fafafa",
              overflowY: "auto",
              maxWidth: 595,
            }}
          >
            <Box
              ref={overlayRef}
              sx={{ position: "relative" }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <canvas
                ref={canvasRef}
                style={{
                  border: "1px solid #f0f0f0",
                  width: "100%",
                  maxWidth: 595,
                  height: "auto",
                  maxHeight: 842,
                }}
              />

              {(itemsByPage[pageNumber] ?? []).map((item) => {
                const c = canvasRef.current;
                const dispW = c?.clientWidth ?? 1;
                const dispH = c?.clientHeight ?? 1;
                const offL = c?.offsetLeft ?? 0;
                const offT = c?.offsetTop ?? 0;

                const leftPx = offL + item.x * dispW;
                const topPx = offT + item.y * dispH;

                const isTextLike =
                  item.tab_type === "text" || item.tab_type === "date";
                const meta = getTextMeta(item.id);
                const isEditing = editingId === item.id;
                const isCheckbox = item.tab_type == "checkbox";

                return (
                  <Box
                    key={item.y + item.x}
                    sx={{
                      position: "absolute",
                      top: topPx,
                      left: leftPx,
                      px: isCheckbox ? 0 : 1,
                      py: isCheckbox ? 0 : 0.5,
                      backgroundColor: hexToRgba(item.color, 0.5),
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      minWidth: isCheckbox ? 20 : 90,
                      fontWeight: 700,
                      userSelect: "none",
                      touchAction: "none",
                      cursor: isTextLike && isEditing ? "text" : "grab",
                    }}
                    onPointerDown={(e) => {
                      if (isTextLike && isEditing) return;
                      const target = e.target as HTMLElement;
                      if (target.tagName === "INPUT" || target.closest("input"))
                        return;
                      e.preventDefault();

                      const rect = c?.getBoundingClientRect();
                      if (!rect) return;
                      const leftAbs = rect.left + item.x * rect.width;
                      const topAbs = rect.top + item.y * rect.height;
                      const grabDX = e.clientX - leftAbs;
                      const grabDY = e.clientY - topAbs;

                      setDragging({
                        id: item.id,
                        page: item.page,
                        grabDX,
                        grabDY,
                      });
                      dragStartXY.current = { x: e.clientX, y: e.clientY };
                      setIsActuallyDragging(false);
                    }}
                    onClick={(e) => {
                      if (isActuallyDragging) return;
                      const sup = lastDragRef.current;
                      if (
                        sup &&
                        sup.id === item.id &&
                        Date.now() - sup.at < 200
                      )
                        return;
                      if (item?.tab_type === "checkbox") return;
                      // if (isTextLike) {
                      //   setEditingId(item.id);
                      //   setEditingValue(getTextMeta(item.id).text);
                      // }
                    }}
                    ref={(el) => {
                      //@ts-ignore
                      itemRefs.current[item.id] = el;
                    }}
                  >
                    {!isTextLike && !isCheckbox && item.label}

                    {isTextLike && !isEditing && (
                      <span
                        style={{
                          fontFamily: meta.font,
                          fontSize: `14px`,
                          lineHeight: 1.2,
                          display: "inline-block",
                          minWidth: 80,
                          color: "#000",
                        }}
                      >
                        {item.label}
                      </span>
                    )}

                    {isTextLike && isEditing && (
                      <>
                        {item.tab_type === "date" ? (
                          <input
                            type="date"
                            value={editingValue}
                            onBlur={commitEdit}
                            min="1900-01-01"
                            max="2099-12-31"
                            onChange={(e) => {
                              const value = e.target.value;
                              // Tarih formatını kontrol et (YYYY-MM-DD)
                              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                              if (dateRegex.test(value) || value === "") {
                                setEditingValue(value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              fontFamily: meta.font,
                              fontSize: `14px`,
                              fontWeight: 700,
                              color: "#000",
                              padding: "2px",
                            }}
                          />
                        ) : (
                          <input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              outline: "none",
                              background: "transparent",
                              fontFamily: meta.font,
                              fontSize: `${meta.size}px`,
                              fontWeight: 700,
                              color: "#000",
                            }}
                          />
                        )}
                      </>
                    )}

                    {isCheckbox && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            backgroundColor: "#fff",
                            border: "2px solid #222",
                            borderRadius: "3px",
                          }}
                        />
                      </Box>
                    )}

                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.page, item.id);
                      }}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14, color: "#000" }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Stack direction="row" spacing={2} mt={2} justifyContent="center">
              <Button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
              >
                {t("back")}
              </Button>
              <Button
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                disabled={pageNumber === numPages}
              >
                {t("next")}
              </Button>
            </Stack>
            <Typography align="center" mt={1}>
              {t("pageCounter", { page: pageNumber, total: numPages })}
            </Typography>
          </Box>
        </Grid>

        {/* Sağ panel */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleSave(1)}
            fullWidth
            sx={{
              py: 1.5,
              px: 3,
              mb: 2,
              borderRadius: 1,
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #025f19 0%, #01773c 100%)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #01775f 0%, #025f4d 100%)",
              },
            }}
          >
            {t("sendForSign")}
          </Button>
          <Button
            onClick={() => handleSave(2)}
            fullWidth
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: 1,
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #003383 0%, #0156a7 100%)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #0156a7 0%, #003383 100%)",
              },
            }}
          >
            {t("save")}
          </Button>
          <Button
            variant="contained"
            color="inherit"
            fullWidth
            type="a"
            href="/dashboard"
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: 1,
              color: "#555",
              fontWeight: 600,
              textTransform: "none",
              background:
                "linear-gradient(135deg, #00000027 0%, #00000027 100%)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              "&:hover": {
                background: "linear-gradient(135deg, #e6e6e6 0%, #d6d6d6 100%)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
              },
            }}
          >
            {t("exit")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
