// app/api/document/resend-reminder/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
const API = process.env.API_BASE_URL!;

type InBody = { docGroupId?: string | number };

export async function POST(req: Request) {
  try {
    // --- Cookie'den auth token & userId ---
    const cookieStore = await cookies();
    const tokenValue = cookieStore.get("token")?.value;
    const userId = cookieStore.get("user")?.value;

    if (!tokenValue) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Kullanıcı bilgisi yok (userId)" },
        { status: 400 }
      );
    }

    // --- Input ---
    const body = (await req.json().catch(() => ({}))) as InBody;
    const docGroupId = body.docGroupId;

    if (!docGroupId) {
      return NextResponse.json(
        { error: "docGroupId zorunludur" },
        { status: 400 }
      );
    }
    // --- Backend çağrısı ---
    const backendRes = await fetch(
      `${API}/DocumentService/Document/ResendReminder`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenValue}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          docGroupId: String(docGroupId),
          userId: String(userId),
        }),
      }
    );

    const raw = await backendRes.text();

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw; // düz metin dönerse
    }

    if (!backendRes.ok) {
      // Hata: frontend'e okunaklı error ver
      return NextResponse.json(
        {
          ok: false,
          error:
            typeof payload === "string"
              ? payload
              : payload?.error || "ResendReminder başarısız",
          status: backendRes.status,
        },
        { status: backendRes.status }
      );
    }

    // Başarılı: { count: 0 | 1 } bekleniyor
    if (typeof payload === "object" && payload !== null && "count" in payload) {
      return NextResponse.json(
        {
          ok: true,
          count: Number(payload.count),
          mail: payload.nonsigned[0].signerMail,
        },
        { status: 200 }
      );
    }
    // Beklenmeyen ama geçerli bir cevap (string vs.)
    return NextResponse.json({ ok: true, result: payload }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
