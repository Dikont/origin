// app/api/analytics/dowloandExportSignReport/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_BASE_URL!;

type Period = "today" | "week" | "month" | "allTime";
const ALLOWED = new Set<Period>(["today", "week", "month", "allTime"]);

type Body = {
  period: Period;
  companyId: string | number;
  userId?: string | number;
};

function buildUrl({ period, companyId, userId }: Body) {
  let url =
    `${API}/DocumentService/Analytics/ExportSignReport` +
    `?period=${encodeURIComponent(String(period))}` +
    `&companyId=${encodeURIComponent(String(companyId))}`;
  if (userId !== undefined && userId !== null && String(userId) !== "") {
    url += `&userId=${encodeURIComponent(String(userId))}`;
  }
  return url;
}

/** Upstream’den XLSX/CSV’yi binary olarak al, Content-Type’ı ve uzantıyı belirle */
async function fetchReportBinary(url: string, token: string) {
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      // XLSX’i tercih et, CSV fallback
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv;q=0.9, */*;q=0.1",
    },
    cache: "no-store",
  });

  const buf = await resp.arrayBuffer();
  const ct = (resp.headers.get("content-type") || "").toLowerCase();

  let contentType = "application/octet-stream";
  let ext = "bin";

  if (ct.includes("spreadsheetml")) {
    contentType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    ext = "xlsx";
  } else if (ct.includes("text/csv") || ct.includes("application/csv")) {
    contentType = "text/csv; charset=utf-8";
    ext = "csv";
  } else {
    // İçerik tipine güvenemezsek sihirli bayt: XLSX = ZIP = "PK"
    const head = new Uint8Array(buf.slice(0, 2));
    if (head[0] === 0x50 && head[1] === 0x4b) {
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      ext = "xlsx";
    }
  }

  return { ok: resp.ok, status: resp.status, buf, contentType, ext };
}

/** GET -> anchor link ile indirme */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = (url.searchParams.get("period") || "") as Period;
    const companyId = url.searchParams.get("companyId") || "";
    const userId = url.searchParams.get("userId") || undefined;

    if (!period || !ALLOWED.has(period)) {
      return NextResponse.json(
        { error: "Geçersiz period. today | week | month | allTime olmalı." },
        { status: 400 }
      );
    }
    if (!companyId) {
      return NextResponse.json(
        { error: "companyId zorunludur." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";
    if (!token) {
      return NextResponse.json(
        { error: "Auth token yok (cookie)" },
        { status: 401 }
      );
    }

    const upstreamUrl = buildUrl({ period, companyId, userId } as Body);
    const { ok, status, buf, contentType, ext } = await fetchReportBinary(
      upstreamUrl,
      token
    );

    if (!ok) {
      // Hata gövdesini metin olarak göstermeye çalış
      const text = new TextDecoder("utf-8").decode(buf);
      return NextResponse.json(
        { error: "ExportSignReport başarısız", status, details: text },
        { status }
      );
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="sign-report-${period}-${Date.now()}.${ext}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

/** POST -> SSR tüketimi (dashboard/reports sayfaları)
 *  Binary döner; tarafında arrayBuffer() ile alıp XLSX/CSV parse et.
 */
export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const body: Body = await req.json().catch(() => ({} as Body));
    const { period, companyId, userId } = body;

    if (!period || !ALLOWED.has(period)) {
      return NextResponse.json(
        { error: "Geçersiz period. today | week | month | allTime olmalı." },
        { status: 400 }
      );
    }
    if (!companyId) {
      return NextResponse.json(
        { error: "companyId zorunludur." },
        { status: 400 }
      );
    }

    const upstreamUrl = buildUrl({ period, companyId, userId });
    const { ok, status, buf, contentType, ext } = await fetchReportBinary(
      upstreamUrl,
      token
    );

    if (!ok) {
      const text = new TextDecoder("utf-8").decode(buf);
      return NextResponse.json(
        { error: "ExportSignReport başarısız", status, details: text },
        { status }
      );
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // SSR’de inline; sen tarafında arrayBuffer() ile alıp parse edeceksin
        "Content-Disposition": `inline; filename="sign-report-${period}-${Date.now()}.${ext}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
