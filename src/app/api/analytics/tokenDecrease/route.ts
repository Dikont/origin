// app/api/user/token-decrease/route.ts
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!; // örn: https://cloudservices.dikontapp.com

type Body = {
  userId?: string;
};

export async function POST(req: Request) {
  try {
    // --- Auth ---
    const rawAuth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    const token = rawAuth?.replace(/Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    // --- Input (body + query ikisinden biri kabul) ---
    const url = new URL(req.url);
    const qpUserId = url.searchParams.get("userId") || undefined;

    const body: Body = await req.json().catch(() => ({} as Body));
    const userId = body.userId || qpUserId;

    if (!userId) {
      return NextResponse.json(
        { error: "userId zorunlu parametredir." },
        { status: 400 }
      );
    }

    // --- Backend URL ---
    const backendUrl = `${API}/UserService/UserAuth/TokenDecrease?userId=${encodeURIComponent(
      userId
    )}`;

    // --- Backend Call (POST, gövde yok) ---
    const resp = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*", // swagger çıktısıyla aynı
      },
    });

    // Bazı durumlarda text dönebiliyor (ör: "Token Hakkınız Yok veya Bitmiş")
    const raw = await resp.text();
    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw; // düz metin ise olduğu gibi bırak
    }

    if (!resp.ok) {
      // Sunucunun verdiği metin hatayı da details içinde döndürüyoruz
      return NextResponse.json(
        {
          error: "TokenDecrease başarısız",
          status: resp.status,
          details: payload,
        },
        { status: resp.status }
      );
    }

    // 200 ise: JSON dönerse JSON; metin dönerse metin olarak ilet
    if (typeof payload === "string") {
      return new NextResponse(payload, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
