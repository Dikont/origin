import React from "react";

export default function HiddenDiv({
  t,
  contractNo,
  docMeta,
  onlySigners,
}: {
  t: (k: string) => string;
  contractNo: string | number;
  docMeta: any;
  onlySigners: any[];
}) {
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

  return (
    <div
      id="pdf-sheet"
      style={{
        opacity: 0,
        pointerEvents: "none",
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: "794px", // A4 width in pixels (210mm)
        height: "auto", // Auto height - gerçek içerik yüksekliği
        maxHeight: "1123px", // A4 maximum height
        backgroundColor: "#fff",
        backgroundImage: "url('/pdf-arkaplan.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        padding: "40px",
        paddingBottom: "20px", // Alt padding azalt
        boxSizing: "border-box",
        fontFamily: "Times New Roman, serif",
        color: "#000",
        fontSize: "14px",
        lineHeight: "1.4",
      }}
    >
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
          Sözleşme Takip Raporu
        </h1>
      </div>

      {/* Üst Özet */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Daha şeffaf
          border: "1px solid #000",
          borderRadius: "0", // Keskin köşeler
          padding: "20px",
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          backdropFilter: "blur(1px)", // Hafif blur efekti
        }}
      >
        <div>
          <strong style={{ textTransform: "uppercase", fontSize: "12px" }}>
            {t("contractNo")}:
          </strong>
          <br />
          {contractNo}
        </div>
        {docMeta?.documentHash && (
          <div>
            <strong style={{ textTransform: "uppercase", fontSize: "12px" }}>
              {t("hash")}:
            </strong>
            <br />
            <div style={{ fontSize: "11px", wordBreak: "break-all" }}>
              {docMeta.documentHash}
            </div>
          </div>
        )}
        <div>
          <strong style={{ textTransform: "uppercase", fontSize: "12px" }}>
            {t("createdAt")}:
          </strong>
          <br />
          {fmt(docMeta?.createdAt)}
        </div>
        <div>
          <strong style={{ textTransform: "uppercase", fontSize: "12px" }}>
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

      {/* İmzalayanlar listesi */}
      <div>
        {onlySigners.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#666" }}>{t("noSigners")}</p>
        ) : (
          onlySigners.map((s: any, idx: number) => {
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
              s?.phoneNumber && s.phoneNumber !== "-" ? s.phoneNumber : "—";
            const ip =
              metaObj?.ip || metaObj?.ipAddress || metaObj?.clientIp || "—";
            const ua = metaObj?.userAgent || metaObj?.ua || null;
            const platform = metaObj?.platform || null;
            const language = metaObj?.language || null;
            const tz = metaObj?.timezone || null;
            const device =
              [ua, platform, language, tz].filter(Boolean).join(" | ") || "—";
            const isDone = !!s?.isSigned;

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #000",
                  borderRadius: "0", // Keskin köşeler
                  padding: "15px",
                  marginBottom: "15px",
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Daha şeffaf
                  pageBreakInside: "avoid", // Sayfa kırılmasını engelle
                  backdropFilter: "blur(1px)", // Hafif blur efekti
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
                    {s?.signerName && s.signerName !== "-" ? s.signerName : "—"}
                  </div>
                  <div
                    style={{
                      padding: "3px 8px",
                      borderRadius: "0", // Keskin köşeler
                      fontSize: "11px",
                      fontWeight: "bold",
                      backgroundColor: "rgba(255, 255, 255, 0.9)", // Sadece beyaz arka plan
                      color: "#000",
                      border: "1px solid #000",
                      textTransform: "uppercase",
                    }}
                  >
                    {isDone
                      ? "✓ " + t("status.signed")
                      : "○ " + t("status.pending")}
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
                    <strong style={{ fontSize: "11px" }}>{t("email")}:</strong>
                    <br />
                    {email || "—"}
                  </div>
                  <div>
                    <strong style={{ fontSize: "11px" }}>{t("phone")}:</strong>
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
                    backgroundColor: "rgba(248, 249, 250, 0.6)", // Daha şeffaf gri
                    padding: "10px",
                    borderRadius: "0", // Keskin köşeler
                    border: "1px solid #000",
                    fontSize: "12px",
                    backdropFilter: "blur(1px)", // Hafif blur efekti
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
                    Teknik Detaylar
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
                        style={{ fontSize: "10px", wordBreak: "break-word" }}
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

      {/* Footer */}
      <div
        style={{
          marginTop: "30px",
          paddingTop: "20px",
          borderTop: "1px solid #ccc",
          textAlign: "center",
          fontSize: "11px",
          color: "#666",
        }}
      >
        Bu rapor{" "}
        {new Date().toLocaleString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        tarihinde oluşturulmuştur.
      </div>
    </div>
  );
}
