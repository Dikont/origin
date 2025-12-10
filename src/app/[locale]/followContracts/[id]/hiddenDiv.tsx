import React from "react";

export default function HiddenDiv({
  t,
  contractNo,
  docMeta,
  onlySigners,
  rejectionReason,
  rejectedSigner,
  pdfDate,
}: {
  t: (k: string) => string;
  contractNo: string | number;
  docMeta: any;
  onlySigners: any[];
  rejectionReason?: string;
  rejectedSigner?: any;
  pdfDate: string;
}) {
  // --- Yardımcı Fonksiyonlar (Aynı kaldı) ---
  const fmt = (dt?: string | null) => {
    if (!dt) return "-";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fmtTR = (dt?: string | null) => {
    if (!dt) return "-";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const parseMeta = (raw: any): Record<string, any> | null => {
    if (!raw) return null;
    if (typeof raw === "string" && /^[\s]*\{/.test(raw)) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    if (typeof raw === "string" && raw.includes("|") && raw.includes("=")) {
      const obj: Record<string, string> = {};
      raw.split("|").forEach((pair: string) => {
        const [k, v] = pair.split("=");
        if (k) obj[k.trim()] = (v ?? "").trim();
      });
      return obj;
    }
    if (typeof raw === "object") return raw as any;
    return null;
  };

  const extractEmail = (meta: any, fallback?: string | null) => {
    if (!meta) return fallback ?? null;
    if (meta.email) return meta.email;
    if (meta.to) return meta.to;
    if (typeof meta.lastReminderMeta === "string") {
      const m = meta.lastReminderMeta.match(/to:([^,\s]+)/i);
      if (m?.[1]) return m[1];
    }
    return fallback ?? null;
  };

  const extractSentAt = (
    meta: any,
    signerUpdated?: string | null,
    docUpdated?: string | null
  ) =>
    meta?.sentAt || meta?.lastReminderAt || signerUpdated || docUpdated || null;

  // --- SAYFALAMA MANTIĞI ---
  const CHUNK_SIZE = 2; // Sayfa başına max imza sayısı
  const signerChunks: any[][] = [];

  if (onlySigners.length === 0) {
    signerChunks.push([]); // Hiç imza yoksa boş bir sayfa oluştur
  } else {
    for (let i = 0; i < onlySigners.length; i += CHUNK_SIZE) {
      signerChunks.push(onlySigners.slice(i, i + CHUNK_SIZE));
    }
  }

  // Wrapper Stilleri (Görünmez tutucu)
  const wrapperStyle: React.CSSProperties = {
    opacity: 0,
    pointerEvents: "none",
    position: "absolute",
    left: "-9999px",
    top: 0,
    width: "auto", // Genişlik içeriğe göre
    height: "auto",
  };

  // A4 Sayfa Stilleri (Her bir sayfa için)
  const pageStyle: React.CSSProperties = {
    width: "794px", // A4 width (210mm @ 96dpi)
    height: "1123px", // A4 height (297mm @ 96dpi) - SABİT YÜKSEKLİK
    position: "relative",
    backgroundColor: "#fff",
    backgroundImage: "url('/pdf-arkaplan.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "40px",
    boxSizing: "border-box",
    fontFamily: "Times New Roman, serif",
    color: "#000",
    fontSize: "14px",
    lineHeight: "1.4",
    marginBottom: "20px", // html2canvas alırken karışmasın diye görsel boşluk
  };

  return (
    <div id="pdf-wrapper" style={wrapperStyle}>
      {signerChunks.map((chunk, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === signerChunks.length - 1;

        return (
          <div key={pageIndex} className="pdf-page-sheet" style={pageStyle}>
            {/* --- İLK SAYFA: Başlık ve Özet --- */}
            {isFirstPage && (
              <>
                {/* Başlık */}
                <div
                  style={{
                    textAlign: "center",
                    paddingBottom: "20px",
                    borderBottom: "2px solid #000",
                    marginBottom: "20px",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      margin: "0 0 10px 0",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("contract_report_title")}
                  </h1>
                </div>

                {/* Üst Özet */}
                <div
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    border: "1px solid #000",
                    borderRadius: "0",
                    padding: "20px",
                    marginBottom: "20px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    backdropFilter: "blur(1px)",
                  }}
                >
                  <div>
                    <strong
                      style={{ textTransform: "uppercase", fontSize: "12px" }}
                    >
                      {t("contractNo")}:
                    </strong>
                    <br />
                    {contractNo}
                  </div>
                  {docMeta?.documentHash && (
                    <div>
                      <strong
                        style={{ textTransform: "uppercase", fontSize: "12px" }}
                      >
                        {t("hash")}:
                      </strong>
                      <br />
                      <div style={{ fontSize: "11px", wordBreak: "break-all" }}>
                        {docMeta.documentHash}
                      </div>
                    </div>
                  )}
                  <div>
                    <strong
                      style={{ textTransform: "uppercase", fontSize: "12px" }}
                    >
                      {t("createdAt")}:
                    </strong>
                    <br />
                    {fmt(docMeta?.createdAt)}
                  </div>
                  <div>
                    <strong
                      style={{ textTransform: "uppercase", fontSize: "12px" }}
                    >
                      {t("updatedAt")}:
                    </strong>
                    <br />
                    {fmt(docMeta?.updatedAt)}
                  </div>
                </div>

                {/* İmzalayanlar başlık */}
                <div
                  style={{
                    borderBottom: "1px solid #333",
                    paddingBottom: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {t("signersTitle")}
                  </h2>
                </div>
              </>
            )}

            {/* --- İÇERİK: İmzalar (Her sayfada en fazla 2 tane) --- */}
            <div>
              {chunk.length === 0 && isFirstPage ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                  {t("noSigners")}
                </p>
              ) : (
                chunk.map((s: any, idx: number) => {
                  const metaObj = parseMeta(s?.userMetadataInfos);
                  const sentAt = extractSentAt(
                    metaObj,
                    s?.updatedAt,
                    docMeta?.updatedAt
                  );
                  const email = extractEmail(
                    metaObj,
                    s?.signerMail && s.signerMail !== "-" ? s.signerMail : null
                  );
                  const phone =
                    s?.phoneNumber && s.phoneNumber !== "-"
                      ? s.phoneNumber
                      : "—";
                  const ip =
                    metaObj?.ip ||
                    metaObj?.ipAddress ||
                    metaObj?.clientIp ||
                    "—";
                  const ua = metaObj?.userAgent || metaObj?.ua || null;
                  const platform = metaObj?.platform || null;
                  const language = metaObj?.language || null;
                  const tz = metaObj?.timezone || null;
                  const device =
                    [ua, platform, language, tz].filter(Boolean).join(" | ") ||
                    "—";

                  const isSigned = s?.isSigned === true;
                  const isRejectedSigner = s?.isRejector === true;

                  const statusLabel = isRejectedSigner
                    ? "✗ " + t("status.rejected")
                    : isSigned
                    ? "✓ " + t("status.signed")
                    : "○ " + t("status.pending");

                  return (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #000",
                        borderRadius: "0",
                        padding: "15px",
                        marginBottom: "15px",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(1px)",
                      }}
                    >
                      {/* Başlık ve durum */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "15px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <div>
                          <strong>{t("fieldName")}:</strong>{" "}
                          {s?.signerName && s.signerName !== "-"
                            ? s.signerName
                            : "—"}
                        </div>
                        <div
                          style={{
                            padding: "3px 8px",
                            borderRadius: "0",
                            fontSize: "11px",
                            fontWeight: "bold",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            color: "#000",
                            border: "1px solid #000",
                            textTransform: "uppercase",
                          }}
                        >
                          {statusLabel}
                        </div>
                      </div>

                      {/* Bilgi grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                          marginBottom: "15px",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "11px" }}>
                            {t("email")}:
                          </strong>
                          <br />
                          {email || "—"}
                        </div>
                        <div>
                          <strong style={{ fontSize: "11px" }}>
                            {t("phone")}:
                          </strong>
                          <br />
                          {phone}
                        </div>
                        <div>
                          <strong style={{ fontSize: "11px" }}>
                            {t("createdAt")}:
                          </strong>
                          <br />
                          {fmt(s?.createdAt)}
                        </div>
                        <div>
                          <strong style={{ fontSize: "11px" }}>
                            {t("updatedAt")}:
                          </strong>
                          <br />
                          {fmt(s?.updatedAt)}
                        </div>
                      </div>

                      {/* Teknik detaylar */}
                      <div
                        style={{
                          backgroundColor: "rgba(248, 249, 250, 0.6)",
                          padding: "10px",
                          borderRadius: "0",
                          border: "1px solid #000",
                          fontSize: "12px",
                          backdropFilter: "blur(1px)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "10px",
                            fontSize: "11px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("technical_detail_title")}
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "10px" }}>
                              {t("sentAt")}:
                            </strong>
                            <br />
                            {fmt(sentAt)}
                          </div>
                          <div>
                            <strong style={{ fontSize: "10px" }}>
                              {t("trTimestamp")}:
                            </strong>
                            <br />
                            {fmtTR(sentAt)}
                          </div>
                          <div>
                            <strong style={{ fontSize: "10px" }}>
                              {t("ipAddress")}:
                            </strong>
                            <br />
                            {ip}
                          </div>
                          <div>
                            <strong style={{ fontSize: "10px" }}>
                              {t("deviceInfo")}:
                            </strong>
                            <br />
                            <div
                              style={{
                                fontSize: "10px",
                                wordBreak: "break-word",
                              }}
                            >
                              {device}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* --- SON SAYFA: Footer ve Red Nedeni --- */}
            {isLastPage && (
              <div
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "40px",
                  width: "calc(100% - 80px)", // Paddingleri düşüyoruz
                }}
              >
                {rejectionReason && (
                  <div
                    style={{
                      border: "2px solid",
                      padding: "15px",
                      marginBottom: "20px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        marginBottom: "10px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("reason_rejected")}
                    </div>
                    <div style={{ fontSize: "11px", marginBottom: "6px" }}>
                      <strong>{t("rejecting")}:</strong>{" "}
                      {rejectedSigner?.signerName ?? "—"}
                    </div>

                    <div style={{ fontSize: "11px", whiteSpace: "pre-line" }}>
                      <strong>{t("explanation")}:</strong> {rejectionReason}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div
                  style={{
                    paddingTop: "20px",
                    borderTop: "1px solid #ccc",
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#666",
                  }}
                >
                  {t("pdf_generated_at")} {pdfDate} {t("pdf_generated_end")}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
