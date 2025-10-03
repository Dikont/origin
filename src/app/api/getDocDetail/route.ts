import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!;

type Body = {
  docGId: string | number;
};

export async function POST(req: Request) {
  try {
    // get token read from headers
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    // --- Input ---
    const body: Body = await req.json().catch(() => ({} as Body));
    const { docGId } = body;

    if (!docGId) {
      return NextResponse.json(
        { error: "eksik parametreler" },
        { status: 400 }
      );
    }

    // --- Backend URL ---
    const url =
      `${API}/DocumentService/Document/GetDocDetail` +
      `?docGId=${encodeURIComponent(String(docGId))}`;

    // --- Backend Call ---
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

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
