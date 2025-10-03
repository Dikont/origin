import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API = process.env.API_BASE_URL!; // https://cloudservices.dikontapp.com

export async function POST(req: Request) {
  try {
    // auth
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Auth token yok" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const docGId =
      body?.DocGId ?? body?.docGId ?? body?.groupId ?? body?.id ?? null;

    if (!docGId) {
      return NextResponse.json(
        { error: "DocGId parametresi eksik" },
        { status: 400 }
      );
    }

    const url = `${API}/DocumentService/Document/GetDownloadAblePdf?docGId=${encodeURIComponent(
      String(docGId)
    )}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
        { error: "getDocumentTakipSinglePage başarısız", details: payload },
        { status: resp.status }
      );
    }

    const out = payload?.result !== undefined ? payload.result : payload;
    return NextResponse.json(out, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "İşlem Hatası", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
