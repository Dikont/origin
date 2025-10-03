import { NextResponse, NextRequest } from "next/server";
import { buildLogoutResponse } from "@/lib/logout";
const API = process.env.API_BASE_URL!;

type Body = {
  period: string;
  companyId: string | number;
  userId: string;
};

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    // --- Input ---
    const body: Body = await req.json().catch(() => ({} as Body));
    const { period, companyId, userId } = body;

    if (!period || !companyId || !userId) {
      return NextResponse.json(
        { error: "period, companyId ve userId zorunlu parametrelerdir." },
        { status: 400 }
      );
    }

    // --- Backend URL ---
    const url =
      `${API}/DocumentService/Document/GetSignatureAnalytics` +
      `?period=${encodeURIComponent(String(period))}` +
      `&companyId=${encodeURIComponent(String(companyId))}` +
      `&userId=${encodeURIComponent(String(userId))}`;

    // --- Backend Call ---
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (resp.status === 401) {
      return buildLogoutResponse(req);
    }
    const raw = await resp.text();
    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          error: "GetSignatureAnalytics başarısız",
          status: resp.status,
          details: payload,
        },
        { status: resp.status }
      );
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "İşlem hatası", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
